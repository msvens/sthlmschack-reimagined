/**
 * Filtering a group's results down to its female players.
 *
 * Used by the opt-in "Damer / Women" toggle on the group results page, whose
 * point is to give a tournament admin a ranked list for prize-giving.
 *
 * Gender is read in exactly one place — `indexWomen` — through the SDK's
 * `isFemale`, which owns the `sex` encoding (notably that `2` means "unrecorded"
 * and must not be read as female). Everything downstream works from a set of
 * member ids, so the rest of these helpers stay pure and SDK-free.
 */
import { isFemale } from '@/lib/api';

/** Minimal shape of a standings row that embeds its player. */
export interface StandingsRowLike {
  contenderId: number;
  playerInfo?: ({ sex?: number | null; id?: number }) | null;
}

/** Minimal shape of a pairing row (round results are ID-only). */
export interface PairingRowLike {
  homeId: number;
  awayId: number;
}

export interface WomenIndex {
  /**
   * Ids identifying a female contender. Both `contenderId` and `playerInfo.id`
   * are indexed — they coincide for individual events today, but round rows and
   * round-standings snapshots reference the two independently.
   */
  ids: ReadonlySet<number>;
  /** How many rows are female. Drives the toggle's label and its visibility. */
  count: number;
  /** Rows considered. `count === total` means the filter would be a no-op. */
  total: number;
}

/**
 * Read gender once over the official standings.
 *
 * Unknown or unrecorded gender counts as not-female, so a group whose players
 * all lack a recorded sex can never be mistaken for an all-women group.
 */
export function indexWomen(rows: readonly StandingsRowLike[]): WomenIndex {
  const ids = new Set<number>();
  let count = 0;
  for (const row of rows) {
    if (!isFemale(row.playerInfo)) continue;
    count += 1;
    ids.add(row.contenderId);
    if (row.playerInfo?.id != null) ids.add(row.playerInfo.id);
  }
  return { ids, count, total: rows.length };
}

/**
 * Keep pairings where at least one named side is in `ids`.
 *
 * Showing the opponent too is deliberate: an admin checking a player's games
 * wants to see who she played. Negative opponent ids (`-100` bye, other
 * negatives walkover) are never in `ids`, so they neither match on their own nor
 * suppress a row — a woman's bye survives via her own id, a man's does not.
 */
export function filterPairings<T extends PairingRowLike>(
  rows: readonly T[],
  ids: ReadonlySet<number>
): T[] {
  return rows.filter((row) => ids.has(row.homeId) || ids.has(row.awayId));
}

