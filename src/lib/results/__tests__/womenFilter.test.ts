import { describe, it, expect } from 'vitest';
import { PrizeCategoryType, resolvePrizeMembers, Sex, type SexType } from '@/lib/api';
import { indexWomen, type StandingsRowLike } from '../womenFilter';

/** Standings row: id, sex, and the official place. */
const row = (id: number, sex: SexType | undefined, place = id): StandingsRowLike & { place: number } => ({
  contenderId: id,
  place,
  playerInfo: sex === undefined ? null : { id, sex },
});

// Which values count as female is the SDK's contract (isFemale), not ours —
// these fixtures just need a realistic mix.
const mixed = [
  row(1, Sex.FEMALE, 1),
  row(2, Sex.MALE, 2),
  row(3, Sex.FEMALE, 3),
  row(4, Sex.UNRECORDED, 4),
  row(5, Sex.MALE, 5),
];

describe('indexWomen', () => {
  it('counts and indexes only positively-female rows', () => {
    const idx = indexWomen(mixed);
    expect(idx.count).toBe(2);
    expect(idx.total).toBe(5);
    expect([...idx.ids].sort()).toEqual([1, 3]);
  });

  it('counts every row in total, including ones with no usable player', () => {
    // `total` must span the whole field, not just classified players — the
    // all-women guard is `count === total`, so undercounting here would hide
    // the toggle on a group that should have it.
    const idx = indexWomen([row(1, Sex.FEMALE), row(2, Sex.MALE), row(3, undefined)]);
    expect(idx.count).toBe(1);
    expect(idx.total).toBe(3);
  });

  it('reports an all-women group as count === total', () => {
    const idx = indexWomen([row(1, Sex.FEMALE), row(2, Sex.FEMALE)]);
    expect(idx.count).toBe(idx.total);
  });

  it('indexes contenderId and playerInfo.id when they differ', () => {
    const idx = indexWomen([{ contenderId: 10, playerInfo: { id: 99, sex: Sex.FEMALE } }]);
    expect(idx.ids.has(10)).toBe(true);
    expect(idx.ids.has(99)).toBe(true);
  });
});

describe('agreement with the SDK women prize', () => {
  // The toggle and a "Dam" prize category answer the same question by different
  // routes: indexWomen here, resolvePrizeMembers in the SDK. Both bottom out in
  // isFemale, but nothing else pins them together — so assert they agree, and
  // notice if the SDK's women rule ever diverges from ours.
  const damCategory = {
    id: 1, name: 'Dam', start: 0, end: 0, type: Sex.FEMALE /* = 1, unused */,
    groupid: 1, order: 0, usagetype: 1, andlogic: -1,
  };

  it('selects the same contenders as resolvePrizeMembers', () => {
    const category = { ...damCategory, type: PrizeCategoryType.WOMEN } as never;
    const fromPrize = new Set(
      resolvePrizeMembers(category, mixed as never, { tournamentYear: 2025, rankingAlgorithm: 1 })
    );
    const fromToggle = indexWomen(mixed).ids;
    for (const id of fromPrize) expect(fromToggle.has(id)).toBe(true);
    expect(fromPrize.size).toBe(indexWomen(mixed).count);
  });

  it('both ignore a synthetic walkover row, even one that looks female', () => {
    // A standings table can carry the walkover/bye placeholder (contender -100).
    // Both sides skip negative contender ids, so neither counts it as a player.
    const withWalkover = [...mixed, row(-100, Sex.FEMALE)];
    const category = { ...damCategory, type: PrizeCategoryType.WOMEN } as never;
    const fromPrize = new Set(
      resolvePrizeMembers(category, withWalkover as never, { tournamentYear: 2025, rankingAlgorithm: 1 })
    );
    const idx = indexWomen(withWalkover);
    expect(fromPrize.has(-100)).toBe(false);
    expect(idx.ids.has(-100)).toBe(false);
    // and it must not inflate `total`, or an all-women group would look mixed
    expect(idx.total).toBe(mixed.length);
  });
});
