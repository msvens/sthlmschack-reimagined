/**
 * Identifying the female players in a group's standings.
 *
 * Backs the opt-in "Damer / Women" toggle on the group results page, whose point
 * is a quick ranked list of the women in a mixed field — the only route to that
 * on the ~86% of tournaments carrying no women's prize category.
 *
 * Gender is read here and nowhere else in the app, through the SDK's `isFemale`,
 * which owns the `sex` encoding (notably that `2` means "unrecorded" and must not
 * be read as female). The result is a set of member ids, which the generic
 * helpers in `./subsetRanking` then filter and rank — the same ones the prize
 * filters use, so the two paths narrow the standings identically.
 */
import { isFemale } from '@/lib/api';

/** Minimal shape of a standings row that embeds its player. */
export interface StandingsRowLike {
  contenderId: number;
  playerInfo?: ({ sex?: number | null; id?: number }) | null;
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
 *
 * Synthetic rows are skipped entirely — a standings table can carry the
 * walkover/bye placeholder (contender `-100`), which is not a person and must
 * not count towards `total`, or an all-women group containing one would look
 * mixed and keep a filter that has nothing to filter. This matches the SDK's
 * `resolvePrizeMembers`, so the toggle and a "Dam" prize agree exactly.
 */
export function indexWomen(rows: readonly StandingsRowLike[]): WomenIndex {
  const ids = new Set<number>();
  let count = 0;
  let total = 0;
  for (const row of rows) {
    if (row.contenderId < 0) continue;
    total += 1;
    if (!isFemale(row.playerInfo)) continue;
    count += 1;
    ids.add(row.contenderId);
    if (row.playerInfo?.id != null) ids.add(row.playerInfo.id);
  }
  return { ids, count, total };
}
