import { describe, it, expect } from 'vitest';
import { Sex } from '@/lib/api';
import {
  PrizeType,
  prizeCategoriesOfType,
  availablePrizeTypes,
  eligibleForPrize,
  prizeCategoryLabel,
} from '../prizeCategories';

type Cat = Parameters<typeof prizeCategoryLabel>[0];

const cat = (over: Partial<Cat> & Pick<Cat, 'type' | 'start' | 'end'>): Cat =>
  ({ id: 1, name: 'X', groupid: 1, order: 0, usagetype: 1, andlogic: -1, ...over }) as Cat;

/** Standings row carrying just what the prize rules read. */
const player = (
  contenderId: number,
  opts: { rating?: number | null; birth?: string; sex?: number } = {}
) =>
  ({
    contenderId,
    place: contenderId,
    playerInfo: {
      id: contenderId,
      firstName: 'A',
      lastName: 'B',
      birthdate: opts.birth ?? '2000',
      sex: opts.sex ?? Sex.MALE,
      elo: opts.rating === null ? null : { rating: opts.rating ?? 1500 },
    },
  }) as never;

// rankingAlgorithm 1 = standard rating, matching what the standings table shows.
const ctx = { tournamentYear: 2025, rankingAlgorithm: 1 };

describe('prizeCategoriesOfType', () => {
  const group = {
    prizeCategories: [
      cat({ type: PrizeType.RATING, start: 0, end: 1500, name: 'R2', order: 200 }),
      cat({ type: PrizeType.RATING, start: 1501, end: 2000, name: 'R1', order: 100 }),
      cat({ type: PrizeType.VETERAN, start: 0, end: 50, name: 'Veteran', order: 50 }),
      cat({ type: PrizeType.AGE, start: 0, end: 20, name: 'Junior', order: 10 }),
    ],
  } as never;

  it('returns only the requested type, sorted by order', () => {
    expect(prizeCategoriesOfType(group, PrizeType.RATING).map((c) => c.name)).toEqual(['R1', 'R2']);
  });

  it('never returns veteran categories, which we cannot evaluate', () => {
    expect(prizeCategoriesOfType(group, PrizeType.VETERAN)).toEqual([]);
  });

  it('handles a group with no prize categories at all', () => {
    expect(prizeCategoriesOfType(null, PrizeType.RATING)).toEqual([]);
    expect(prizeCategoriesOfType({ prizeCategories: [] } as never, PrizeType.AGE)).toEqual([]);
  });

  it('lists available types in display order, excluding veteran', () => {
    expect(availablePrizeTypes(group)).toEqual([PrizeType.RATING, PrizeType.AGE]);
  });
});

describe('eligibleForPrize — rating bands', () => {
  const band = cat({ type: PrizeType.RATING, start: 1500, end: 1600 });

  it('includes both bounds and excludes just outside', () => {
    const rows = [
      player(1, { rating: 1499 }),
      player(2, { rating: 1500 }),
      player(3, { rating: 1600 }),
      player(4, { rating: 1601 }),
    ];
    expect([...eligibleForPrize(rows, band, ctx)].sort()).toEqual([2, 3]);
  });

  it('excludes an unrated player from a band that does not start at 0', () => {
    const rows = [player(1, { rating: null }), player(2, { rating: 1550 })];
    expect([...eligibleForPrize(rows, band, ctx)]).toEqual([2]);
  });
});

describe('eligibleForPrize — unrated players and the bottom band', () => {
  // SSF reports unrated as `rating: 0`, which the SDK surfaces as null. A band
  // starting at 0 is the organiser's catch-all for them: no real SSF rating sits
  // between 1 and 1000, so "R3 (0-1000)" can only mean unrated and beginners.
  // Regression: this band matched nobody, because unrated was treated as
  // ineligible everywhere. Live case — group 16643 had 12 such players.
  const bottom = cat({ type: PrizeType.RATING, start: 0, end: 1000, name: 'R3' });

  it('includes unrated players in a band starting at 0', () => {
    const rows = [
      player(1, { rating: 0 }),
      player(2, { rating: null }),
      player(3, { rating: 1500 }),
    ];
    expect([...eligibleForPrize(rows, bottom, ctx)].sort()).toEqual([1, 2]);
  });

  it('still respects the upper bound for rated players', () => {
    const rows = [player(1, { rating: 999 }), player(2, { rating: 1001 })];
    expect([...eligibleForPrize(rows, bottom, ctx)]).toEqual([1]);
  });

  it('sweeps unrated players into a wide bottom band too', () => {
    // Västerås Open's "R8 (0-1783)" — same catch-all intent, wider range.
    const r8 = cat({ type: PrizeType.RATING, start: 0, end: 1783 });
    expect([...eligibleForPrize([player(1, { rating: null })], r8, ctx)]).toEqual([1]);
  });

  it('does not sweep unrated players into a women\'s prize with a rating band', () => {
    // "Dampris 1400-2500" starts above 0, so unrated women are not eligible.
    const dampris = cat({ type: PrizeType.WOMEN, start: 1400, end: 2500 });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: null }),
      player(2, { sex: Sex.FEMALE, rating: 1500 }),
    ];
    expect([...eligibleForPrize(rows, dampris, ctx)]).toEqual([2]);
  });

  it('includes unrated women in a women\'s prize whose band starts at 0', () => {
    const dam = cat({ type: PrizeType.WOMEN, start: 0, end: 1200 });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: null }),
      player(2, { sex: Sex.MALE, rating: null }),
    ];
    expect([...eligibleForPrize(rows, dam, ctx)]).toEqual([1]);
  });
});

describe('eligibleForPrize — age bands', () => {
  // The real Manhemknatten 2025 bands: '2013' is declared as ages 12-12.
  const born2013 = cat({ type: PrizeType.AGE, start: 12, end: 12, name: '2013' });

  it('computes age as tournamentYear - birthYear', () => {
    const rows = [
      player(1, { birth: '2012' }), // 13
      player(2, { birth: '2013' }), // 12
      player(3, { birth: '2014' }), // 11
    ];
    expect([...eligibleForPrize(rows, born2013, ctx)]).toEqual([2]);
  });

  it('accepts a full date and an open-ended junior band', () => {
    const junior = cat({ type: PrizeType.AGE, start: 0, end: 20 });
    const rows = [player(1, { birth: '2010-05-01' }), player(2, { birth: '1980' })];
    expect([...eligibleForPrize(rows, junior, ctx)]).toEqual([1]);
  });

  it('excludes players with no birthdate', () => {
    const rows = [player(1, { birth: '' })];
    expect([...eligibleForPrize(rows, born2013, ctx)]).toEqual([]);
  });

  it('never matches the synthetic walkover row', () => {
    // Contender -100 carries birthdate 1970, which would otherwise land in bands.
    const veteranAges = cat({ type: PrizeType.AGE, start: 0, end: 100 });
    const rows = [player(-100, { birth: '1970' }), player(5, { birth: '2000' })];
    expect([...eligibleForPrize(rows, veteranAges, ctx)]).toEqual([5]);
  });
});

describe('eligibleForPrize — women', () => {
  it('matches women when the bounds are unset', () => {
    const dam = cat({ type: PrizeType.WOMEN, start: 0, end: 0, name: 'Dam' });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: 1200 }),
      player(2, { sex: Sex.MALE, rating: 2000 }),
      player(3, { sex: Sex.UNRECORDED, rating: 1800 }),
    ];
    expect([...eligibleForPrize(rows, dam, ctx)]).toEqual([1]);
  });

  it('also applies the rating band when bounds are set', () => {
    // Live example: "Dampris" 1400-2500.
    const dampris = cat({ type: PrizeType.WOMEN, start: 1400, end: 2500, name: 'Dampris' });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: 1399 }),
      player(2, { sex: Sex.FEMALE, rating: 1500 }),
      player(3, { sex: Sex.MALE, rating: 1500 }),
    ];
    expect([...eligibleForPrize(rows, dampris, ctx)]).toEqual([2]);
  });
});

describe('eligibleForPrize — unsupported types', () => {
  it('matches nobody for a veteran category', () => {
    const veteran = cat({ type: PrizeType.VETERAN, start: 0, end: 50 });
    const rows = [player(1, { birth: '1950' }), player(2, { birth: '2000' })];
    expect([...eligibleForPrize(rows, veteran, ctx)]).toEqual([]);
  });
});

describe('prizeCategoryLabel', () => {
  it('shows the band when bounds are usable', () => {
    expect(prizeCategoryLabel(cat({ type: 4, start: 1575, end: 1718, name: 'R1' }))).toBe('R1 (1575–1718)');
  });

  it('shows just the name when bounds are unset', () => {
    expect(prizeCategoryLabel(cat({ type: 2, start: 0, end: 0, name: 'Dam' }))).toBe('Dam');
    expect(prizeCategoryLabel(cat({ type: 2, start: -1, end: -1, name: 'Dam' }))).toBe('Dam');
  });

  it('falls back to the band when a category has no name', () => {
    expect(prizeCategoryLabel(cat({ type: 4, start: 0, end: 1750, name: '' }))).toBe('0–1750');
  });
});
