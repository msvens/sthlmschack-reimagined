import { describe, it, expect } from 'vitest';
import { filterContenders, filterPairings, rankSubset } from '../subsetRanking';

/** Contender row: id plus the official place. */
const row = (id: number, place = id) => ({ contenderId: id, place });

const field = [row(1, 1), row(2, 2), row(3, 3), row(4, 4), row(5, 5)];

describe('filterContenders', () => {
  it('keeps order, identity, and the gappy official place', () => {
    const out = filterContenders(field, new Set([1, 3]));
    expect(out).toHaveLength(2);
    expect(out[0]).toBe(field[0]); // same object reference
    // Places stay 1 and 3 — deliberately not renumbered.
    expect(out.map((r) => r.place)).toEqual([1, 3]);
  });

  it('returns nothing for an empty id set', () => {
    expect(filterContenders(field, new Set())).toEqual([]);
  });

  it('ignores ids that match no row', () => {
    expect(filterContenders(field, new Set([99]))).toEqual([]);
  });
});

describe('rankSubset', () => {
  const id = (r: { contenderId: number }) => r.contenderId;

  it('numbers an ordered subset 1..N', () => {
    const out = rankSubset([row(7), row(3), row(9)], id);
    expect([...out.entries()]).toEqual([[7, 1], [3, 2], [9, 3]]);
  });

  it('ranks by position, independent of the ids themselves', () => {
    const out = rankSubset([row(9), row(7)], id);
    expect(out.get(9)).toBe(1);
    expect(out.get(7)).toBe(2);
  });

  it('shares a rank for tied places and skips the next (1,2,2,4)', () => {
    const rows = [row(1, 1), row(2, 5), row(3, 5), row(4, 8)];
    const out = rankSubset(rows, id, (r) => r.place);
    expect([out.get(1), out.get(2), out.get(3), out.get(4)]).toEqual([1, 2, 2, 4]);
  });

  it('ignores ties when no placeOf is given', () => {
    expect([...rankSubset([row(1, 5), row(2, 5)], id).values()]).toEqual([1, 2]);
  });

  it('handles an empty subset', () => {
    expect(rankSubset([], id).size).toBe(0);
  });
});

describe('filterPairings', () => {
  const ids = new Set([1, 3]); // the subset in view

  it('keeps a game where either side is in the subset, in either colour', () => {
    expect(filterPairings([{ homeId: 1, awayId: 2 }], ids)).toHaveLength(1);
    expect(filterPairings([{ homeId: 2, awayId: 1 }], ids)).toHaveLength(1);
  });

  it('keeps a game between two subject players exactly once', () => {
    expect(filterPairings([{ homeId: 1, awayId: 3 }], ids)).toHaveLength(1);
  });

  it('drops a game between two players outside the subset', () => {
    expect(filterPairings([{ homeId: 2, awayId: 5 }], ids)).toEqual([]);
  });

  it("keeps a subject's bye and walkover, drops someone else's", () => {
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
