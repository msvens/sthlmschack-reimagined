import { describe, it, expect } from 'vitest';
import { PrizeCategoryType } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import {
  SUPPORTED_PRIZE_TYPES,
  PRIZE_TYPE_TITLE_KEY,
  prizeCategoriesOfType,
  availablePrizeTypes,
  findPrizeCategory,
  prizeCategoryLabel,
} from '../prizeCategories';

// Matching players to a category is the SDK's job (resolvePrizeMembers) and is
// tested there. What's left here is ours: which types get a dropdown, in what
// order, under which heading, and how a category reads.

type Cat = Parameters<typeof prizeCategoryLabel>[0];

const cat = (over: Partial<Cat> & Pick<Cat, 'type' | 'start' | 'end'>): Cat =>
  ({ id: 1, name: 'X', groupid: 1, order: 0, usagetype: 1, andlogic: -1, ...over }) as Cat;

const groupWith = (...categories: Cat[]) => ({ prizeCategories: categories }) as never;

describe('prizeCategoriesOfType', () => {
  const group = groupWith(
    cat({ type: PrizeCategoryType.RATING, start: 0, end: 1500, name: 'R2', order: 200, id: 2 }),
    cat({ type: PrizeCategoryType.RATING, start: 1501, end: 2000, name: 'R1', order: 100, id: 1 }),
    cat({ type: PrizeCategoryType.SENIOR, start: 0, end: 50, name: 'Veteran', order: 50, id: 3 }),
    cat({ type: PrizeCategoryType.AGE, start: 0, end: 20, name: 'Junior', order: 10, id: 4 }),
  );

  it('returns only the requested type, sorted by order', () => {
    expect(prizeCategoriesOfType(group, PrizeCategoryType.RATING).map((c) => c.name)).toEqual(['R1', 'R2']);
  });

  it('returns senior categories, now that the rule is known', () => {
    expect(prizeCategoriesOfType(group, PrizeCategoryType.SENIOR).map((c) => c.name)).toEqual(['Veteran']);
  });

  it('never returns SM class, which is only ever a registration restriction', () => {
    const g = groupWith(cat({ type: PrizeCategoryType.SMCLASS, start: 1, end: 1 }));
    expect(prizeCategoriesOfType(g, PrizeCategoryType.SMCLASS)).toEqual([]);
  });

  it('drops a registration category sharing a prize type', () => {
    // Same DTO shape, same type 4 — only usagetype separates a rating prize from
    // a "Rankingspärr 1750+" entry bar. Left in, it would offer a dropdown
    // option that selects an always-empty table.
    const g = groupWith(
      cat({ type: PrizeCategoryType.RATING, start: 0, end: 1750, name: 'Rankingspärr', usagetype: 2, id: 9 }),
      cat({ type: PrizeCategoryType.RATING, start: 0, end: 1500, name: 'R1', id: 1 }),
    );
    expect(prizeCategoriesOfType(g, PrizeCategoryType.RATING).map((c) => c.name)).toEqual(['R1']);
  });

  it('handles a group with no prize categories at all', () => {
    expect(prizeCategoriesOfType(null, PrizeCategoryType.RATING)).toEqual([]);
    expect(prizeCategoriesOfType(groupWith(), PrizeCategoryType.AGE)).toEqual([]);
  });
});

describe('availablePrizeTypes', () => {
  it('lists the types present, in display order', () => {
    const group = groupWith(
      cat({ type: PrizeCategoryType.SENIOR, start: -1, end: -1, id: 1 }),
      cat({ type: PrizeCategoryType.WOMEN, start: 0, end: 0, id: 2 }),
      cat({ type: PrizeCategoryType.AGE, start: 0, end: 20, id: 3 }),
      cat({ type: PrizeCategoryType.RATING, start: 0, end: 1500, id: 4 }),
    );
    expect(availablePrizeTypes(group)).toEqual([
      PrizeCategoryType.RATING,
      PrizeCategoryType.AGE,
      PrizeCategoryType.WOMEN,
      PrizeCategoryType.SENIOR,
    ]);
  });

  it('is empty for a group with only registration categories', () => {
    const g = groupWith(cat({ type: PrizeCategoryType.RATING, start: 0, end: 1750, usagetype: 2 }));
    expect(availablePrizeTypes(g)).toEqual([]);
  });
});

describe('findPrizeCategory', () => {
  const group = groupWith(
    cat({ type: PrizeCategoryType.RATING, start: 0, end: 1500, id: 1, name: 'R1' }),
    cat({ type: PrizeCategoryType.SMCLASS, start: 1, end: 1, id: 2, name: 'Klass I' }),
    cat({ type: PrizeCategoryType.RATING, start: 0, end: 1750, id: 3, usagetype: 2, name: 'Spärr' }),
  );

  it('finds a category the app would offer', () => {
    expect(findPrizeCategory(group, 1)?.name).toBe('R1');
  });

  it('refuses an unsupported type, a registration category, and an unknown id', () => {
    // A selection can outlive a group change, so a stale id must not resolve.
    expect(findPrizeCategory(group, 2)).toBeNull();
    expect(findPrizeCategory(group, 3)).toBeNull();
    expect(findPrizeCategory(group, 999)).toBeNull();
  });

  it('handles no selection and no group', () => {
    expect(findPrizeCategory(group, null)).toBeNull();
    expect(findPrizeCategory(null, 1)).toBeNull();
  });
});

describe('PRIZE_TYPE_TITLE_KEY', () => {
  // The type system guarantees a heading exists for every supported type; only a
  // runtime check catches a key whose translation is missing or empty. Without
  // this, a new type silently renders a blank dropdown heading.
  it.each(['en', 'sv'] as const)('resolves every supported type to a heading in %s', (language) => {
    const titles = getTranslation(language).pages.tournamentResults.prizeCategories;
    for (const type of SUPPORTED_PRIZE_TYPES) {
      expect(titles[PRIZE_TYPE_TITLE_KEY[type]]?.trim()).toBeTruthy();
    }
  });

  it('gives each type a distinct heading', () => {
    const keys = SUPPORTED_PRIZE_TYPES.map((t) => PRIZE_TYPE_TITLE_KEY[t]);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('prizeCategoryLabel', () => {
  it('shows the band for a rating prize', () => {
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.RATING, start: 1575, end: 1718, name: 'R1' })))
      .toBe('R1 (1575–1718)');
  });

  it('shows the band for an age prize', () => {
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.AGE, start: 12, end: 12, name: '2013' })))
      .toBe('2013 (12–12)');
  });

  it('hides the band on a senior prize, where the rule is age >= 60', () => {
    // Live: 0-50 in group 16642 and -1--1 in its sister 16643 — same prize.
    // Printing "Veteran (0–50)" would caption a table full of 66 year olds.
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.SENIOR, start: 0, end: 50, name: 'Veteran' })))
      .toBe('Veteran');
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.SENIOR, start: -1, end: -1, name: 'Veteran' })))
      .toBe('Veteran');
  });

  it('hides the band on a women prize, which matches every woman', () => {
    // "Dampris 1400–2500" lists an unrated woman on the official site, so the
    // band is decorative — showing it would contradict the table beneath it.
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.WOMEN, start: 1400, end: 2500, name: 'Dampris' })))
      .toBe('Dampris');
  });

  it('shows just the name when bounds are unset', () => {
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.WOMEN, start: 0, end: 0, name: 'Dam' }))).toBe('Dam');
  });

  it('falls back to the band when a category has no name', () => {
    expect(prizeCategoryLabel(cat({ type: PrizeCategoryType.RATING, start: 0, end: 1750, name: '' }))).toBe('0–1750');
  });
});
