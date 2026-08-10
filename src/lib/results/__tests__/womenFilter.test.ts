import { describe, it, expect } from 'vitest';
import { Sex, type SexType } from '@/lib/api';
import {
  indexWomen,
  filterContenders,
  filterPairings,
  rankSubset,
  type StandingsRowLike,
} from '../womenFilter';

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

describe('filterContenders', () => {
  it('keeps order, identity, and the gappy official place', () => {
    const { ids } = indexWomen(mixed);
    const out = filterContenders(mixed, ids);
    expect(out).toHaveLength(2);
    expect(out[0]).toBe(mixed[0]); // same object reference
    // Places stay 1 and 3 — deliberately not renumbered.
    expect(out.map((r) => r.place)).toEqual([1, 3]);
  });

  it('returns nothing for an empty id set', () => {
    expect(filterContenders(mixed, new Set())).toEqual([]);
  });
});

describe('filterPairings', () => {
  const ids = new Set([1, 3]); // women

  it('keeps a game where either side is a woman, in either colour', () => {
    expect(filterPairings([{ homeId: 1, awayId: 2 }], ids)).toHaveLength(1);
    expect(filterPairings([{ homeId: 2, awayId: 1 }], ids)).toHaveLength(1);
  });

  it('keeps a woman-vs-woman game exactly once', () => {
    expect(filterPairings([{ homeId: 1, awayId: 3 }], ids)).toHaveLength(1);
  });

  it('drops a game between two men', () => {
    expect(filterPairings([{ homeId: 2, awayId: 5 }], ids)).toEqual([]);
  });

  it("keeps a woman's bye and walkover, drops a man's", () => {
    // -100 is the bye/Frirond slot; other negatives are walkovers. Neither is
    // ever in the id set, so the row survives purely on the real player's side.
    expect(filterPairings([{ homeId: 1, awayId: -100 }], ids)).toHaveLength(1);
    expect(filterPairings([{ homeId: 3, awayId: -1 }], ids)).toHaveLength(1);
    expect(filterPairings([{ homeId: 2, awayId: -100 }], ids)).toEqual([]);
  });

  it('preserves order', () => {
    const rows = [{ homeId: 1, awayId: 2 }, { homeId: 4, awayId: 5 }, { homeId: 3, awayId: 2 }];
    expect(filterPairings(rows, ids)).toEqual([rows[0], rows[2]]);
  });
});

describe('rankSubset', () => {
  const id = (r: { contenderId: number }) => r.contenderId;

  it('numbers an ordered subset 1..N', () => {
    const out = rankSubset([row(7, Sex.FEMALE), row(3, Sex.FEMALE), row(9, Sex.FEMALE)], id);
    expect([...out.entries()]).toEqual([[7, 1], [3, 2], [9, 3]]);
  });

  it('ranks by position, independent of the ids themselves', () => {
    const out = rankSubset([row(9, Sex.FEMALE), row(7, Sex.FEMALE)], id);
    expect(out.get(9)).toBe(1);
    expect(out.get(7)).toBe(2);
  });

  it('shares a rank for tied places and skips the next (1,2,2,4)', () => {
    const rows = [row(1, Sex.FEMALE, 1), row(2, Sex.FEMALE, 5), row(3, Sex.FEMALE, 5), row(4, Sex.FEMALE, 8)];
    const out = rankSubset(rows, id, (r) => r.place);
    expect([out.get(1), out.get(2), out.get(3), out.get(4)]).toEqual([1, 2, 2, 4]);
  });

  it('ignores ties when no placeOf is given', () => {
    const rows = [row(1, Sex.FEMALE, 5), row(2, Sex.FEMALE, 5)];
    expect([...rankSubset(rows, id).values()]).toEqual([1, 2]);
  });

  it('handles an empty subset', () => {
    expect(rankSubset([], id).size).toBe(0);
  });
});
