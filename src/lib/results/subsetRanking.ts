/**
 * Showing a subset of a group's standings while keeping the official order.
 *
 * Shared by every "filter the standings to some group of players" feature — the
 * women-only view and the prize categories both narrow the field and then need a
 * rank *within* what's left, without disturbing the official placement.
 */

/**
 * Keep contender rows whose id is in `ids`, preserving order and object identity
 * (so React keys and downstream memos stay stable). Official `place` values are
 * left untouched and will therefore be gappy — 1, 4, 7 — which is intended.
 */
export function filterContenders<T extends { contenderId: number }>(
  rows: readonly T[],
  ids: ReadonlySet<number>
): T[] {
  return rows.filter((row) => ids.has(row.contenderId));
}

/**
 * 1-based rank within an already-ordered subset, keyed by id.
 *
 * A map rather than an array index because the shared `Table` re-sorts rows
 * internally — an index would silently renumber when the user sorts by name.
 *
 * Pass `placeOf` to use standard competition ranking, where rows sharing an
 * official place share a rank and the next one skips (1, 2, 2, 4). Round-standings
 * snapshots genuinely tie; final standings generally do not.
 */
export function rankSubset<T>(
  rows: readonly T[],
  idOf: (row: T) => number,
  placeOf?: (row: T) => number | undefined
): Map<number, number> {
  const ranks = new Map<number, number>();
  let lastPlace: number | undefined;
  let lastRank = 0;
  rows.forEach((row, index) => {
    let rank = index + 1;
    if (placeOf) {
      const place = placeOf(row);
      if (place != null && place === lastPlace) rank = lastRank;
      lastPlace = place;
      lastRank = rank;
    }
    ranks.set(idOf(row), rank);
  });
  return ranks;
}

/** Minimal shape of a pairing row (round results carry ids only). */
export interface PairingRowLike {
  homeId: number;
  awayId: number;
}

/**
 * Keep pairings where at least one named side is in `ids`.
 *
 * Showing the opponent too is deliberate: whoever is looking at a subset — the
 * women in a group, or the players in a rating band — wants to see who they
 * played, and the opponent is usually outside the subset. Negative opponent ids
 * (`-100` bye, other negatives walkover) are never in `ids`, so they neither
 * match on their own nor suppress a row: a subject's bye survives via their own
 * id, someone else's does not.
 */
export function filterPairings<T extends PairingRowLike>(
  rows: readonly T[],
  ids: ReadonlySet<number>
): T[] {
  return rows.filter((row) => ids.has(row.homeId) || ids.has(row.awayId));
}
