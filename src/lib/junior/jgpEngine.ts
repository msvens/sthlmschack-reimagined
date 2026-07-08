/**
 * Stockholm Junior Grand Prix (JGP) scoring engine.
 *
 * Pure, side-effect-free functions. The core scoring operates on the normalized
 * {@link JgpPlayerResult} row so it is unit-testable without the SDK; the thin
 * adapter {@link normalizeTournamentResults} converts raw SDK data into rows.
 *
 * Two algorithms, one per division (see the rules PDFs):
 *  - **open** ("all"): a discrete placement ladder, re-bucketed by birth-year
 *    age class. `computeLadderTournament` / `computeOpenSeason`.
 *  - **girls** (Flick): a continuous percentile scaling per playing class, one
 *    combined ranking. `computePercentileTournament` / `computeGirlsSeason`.
 */

import type { JgpAgeClass, JgpDispensation } from '@/data/jgp/types';

/** Normalized per-player result within one tournament, engine input. */
export interface JgpPlayerResult {
  memberId: number;
  firstName: string;
  lastName: string;
  /** Birth year (from `playerInfo.birthdate`). */
  birthYear: number;
  /** Female per the SSF `sex` field (1 = female). See note in the adapter. */
  isFemale: boolean;
  clubId: number;
  clubName: string;
  /** Match points in the tournament (1/0.5/0 system). */
  points: number;
  /** Quality points — the API's secondary tiebreak (`secPoints`). */
  quality: number;
  /** Final placement within the played group (the SDK's official ranking). */
  place: number;
  /** Stable per-playing-class key within a tournament (the group id as string). */
  classKey: string;
  /** True for beginner classes (JGP E/F); from config. */
  isBeginnerClass: boolean;
  /** Oldest birth year the played class admits (from config); null if unknown. */
  classFromYear: number | null;
  /** Youngest birth year the played class admits (from config); null if unknown. */
  classToYear: number | null;
  /** Games actually played (won + drawn + lost), including walkovers. */
  gamesPlayed: number;
  /**
   * Games with a real (played-out) result, excluding walkovers/forfeits — from
   * the round-result game codes (standard play is |code| <= 1; walkover/forfeit
   * is |code| >= 2). A player with zero real games (only walkovers or no-show)
   * is dropped by the JGP rules.
   */
  realGamesPlayed: number;
  // --- girls series only (percentile scoring); unset/ignored for the open ladder ---
  /** Playing-class key to pool by (config `klass`); groups sharing it merge. */
  klass?: string;
  /** Points scaled by rounds (`points/rounds`) — the same-place tie-break. */
  scaledPts?: number;
  /** No-show (only walkover losses): excluded from the pool. */
  isNoShow?: boolean;
  /** Dropout (left early / played fewer rounds): scored a flat 4. */
  isDropout?: boolean;
}

/** A single player's row in a computed season standings table. */
export interface JgpStandingRow {
  memberId: number;
  name: string;
  birthYear: number;
  clubName: string;
  /** Points per tournament, aligned to the season's tournament order; null = did not score. */
  perTournament: (number | null)[];
  /** Season total (plain sum, no drop). */
  total: number;
  /** Number of tournaments the player scored in. */
  played: number;
  /** 1-based place within the table (shared on ties). */
  place: number;
}

/** One age-class table for the open division. */
export interface JgpAgeClassTable {
  ageClass: JgpAgeClass;
  rows: JgpStandingRow[];
}

/**
 * The open-series placement ladder: rank 1 → 25, rank 2 → 22, … rank 18 → 1.
 * Everyone past rank 18 gets 1 (participation). Tied ranks share the average
 * of the rungs they span.
 */
export const LADDER = [25, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const;

/** Ladder value for a 0-based rank (participation = 1 past the ladder). */
function rungValue(rank0: number): number {
  return rank0 < LADDER.length ? LADDER[rank0] : 1;
}

/** Find the age class whose inclusive [fromYear, toYear] contains `year`. */
export function findAgeClass(year: number, ageClasses: JgpAgeClass[]): JgpAgeClass | undefined {
  return ageClasses.find((c) => year >= c.fromYear && year <= c.toYear);
}

/** Build a memberId → granted playClassYear map from a dispensation list. */
export function dispensationMap(dispensations: JgpDispensation[]): Map<number, number> {
  return new Map(dispensations.map((d) => [d.memberId, d.playClassYear]));
}

/** Effective birth year for age bucketing (dispensation overrides real year). */
function effectiveYear(r: JgpPlayerResult, disp: Map<number, number>): number {
  return disp.get(r.memberId) ?? r.birthYear;
}

/**
 * The quality points used for ranking are Buchholz (Cut-1), a multiple of 0.5.
 * The API's `secPoints` carries that value plus a finer sub-tiebreak in its
 * lower decimals (e.g. 27.55 vs 27.54); the JGP calculation ignores the
 * sub-tiebreak and instead averages the resulting ties, so we round to the
 * nearest 0.5 before comparing.
 */
function qualityKey(quality: number): number {
  return Math.round(quality * 2) / 2;
}

/**
 * Whether the player has at least one real (non-walkover) game — those who
 * played only walkovers or did not play are dropped by the JGP rules. Note a
 * player who lost every real game (0 points) still counts: last place in a
 * small age bucket still earns a ladder value.
 */
function playedRealGame(r: JgpPlayerResult): boolean {
  return r.realGamesPlayed > 0;
}

/**
 * Descending sort by (points, quality), then by the group's official place so
 * that players in the same group keep their table order on an exact tie.
 */
function byPointsThenQuality(a: JgpPlayerResult, b: JgpPlayerResult): number {
  return b.points - a.points || qualityKey(b.quality) - qualityKey(a.quality) || a.place - b.place;
}

/**
 * Assign ladder points to players already sorted best-first. For a run of
 * players tied on points and quality:
 *  - if they all played the SAME group, the group's official standing already
 *    ranks them (the run is sorted by place), so they get distinct rungs;
 *  - if they span DIFFERENT groups, they can't be ranked against one another,
 *    so they share the average of the rungs they occupy.
 * Returns a memberId → points map.
 *
 * OPEN QUESTION (cross-group ties) — the rules don't specify how to rank tied
 * players from different playing classes, so this is our best interpretation and
 * it is currently DORMANT: 2025 uses `averaged` (averages regardless of group),
 * and 2026's age buckets line up with single classes, so no cross-group ties
 * arise. It may never occur again. A plausible alternative to discuss with the
 * federation: compute each player's rank *within their own class among only the
 * JGP-age-group members* (i.e. after dropping everyone not in this age bucket),
 * and average only when two cross-class players land on the same such cleaned
 * rank; otherwise keep them distinct. Left as-is (average all cross-group ties)
 * for now.
 */
function assignLadder(sorted: JgpPlayerResult[], averageAll: boolean): Map<number, number> {
  const out = new Map<number, number>();
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      sorted[j].points === sorted[i].points &&
      qualityKey(sorted[j].quality) === qualityKey(sorted[i].quality)
    ) {
      j++;
    }
    const groups = new Set<string>();
    for (let k = i; k < j; k++) groups.add(sorted[k].classKey);
    // 'ranked': same-group ties keep their table order (distinct rungs).
    // 'averaged' (averageAll) or cross-group ties: share the average.
    if (!averageAll && groups.size <= 1) {
      for (let k = i; k < j; k++) out.set(sorted[k].memberId, rungValue(k));
    } else {
      let sum = 0;
      for (let k = i; k < j; k++) sum += rungValue(k);
      const avg = sum / (j - i);
      for (let k = i; k < j; k++) out.set(sorted[k].memberId, avg);
    }
    i = j;
  }
  return out;
}

/**
 * Compute open-division standings points for ONE tournament.
 *
 * Filters (Stockholm-club members only, drop E&F, drop players with no games),
 * re-buckets survivors by effective birth-year age class, sorts each bucket by
 * (points, quality) and assigns the ladder with tie averaging.
 *
 * @returns memberId → standings points for this tournament.
 */
export function computeLadderTournament(
  rows: JgpPlayerResult[],
  ageClasses: JgpAgeClass[],
  disp: Map<number, number>,
  isEligible: (row: JgpPlayerResult) => boolean,
  averageAll = false,
): Map<number, number> {
  const eligible = rows.filter(
    (r) => isEligible(r) && !r.isBeginnerClass && playedRealGame(r),
  );

  const out = new Map<number, number>();
  const buckets = new Map<string, JgpPlayerResult[]>();

  // Players who played the wrong class in this tournament score 0 and do not
  // compete for a rung. This is voiding/sticky: any wrong-class appearance zeroes
  // the whole tournament for that player, even if they also have a valid-class
  // entry (double registration).
  //
  // All checks use the player's EFFECTIVE age — their granted (dispensation)
  // year if any, else their birth year. A dispensation is an obligation to play
  // up: a dispensed player scores only when they play at (or above) their
  // granted level; if they play their native younger class, that's "played
  // younger" and voids the tournament just like anyone else. Two cases:
  //  - played a class *younger* than the player's effective age;
  //  - played *up* into an older age bucket than the player's effective bucket,
  //    WHEN a younger class was available. Playing up is only a violation if a
  //    more age-appropriate (younger) class existed; the youngest class a
  //    tournament offers is legitimate for the youngest players (e.g. a 2017 in
  //    the youngest "2015-2016" class). Playing up within one's own bucket
  //    (a 2009 in a 2005-2008 class whose bucket is 2005-2009) is also fine.
  const toYears = eligible.map((r) => r.classToYear).filter((y): y is number => y != null);
  const youngestClassToYear = toYears.length ? Math.max(...toYears) : -Infinity;
  const voided = new Set<number>();
  for (const r of eligible) {
    const eff = effectiveYear(r, disp);
    const home = findAgeClass(eff, ageClasses);
    const playedYounger = r.classFromYear != null && r.classFromYear > eff;
    const playedUp =
      r.classToYear != null &&
      home != null &&
      r.classToYear < home.fromYear &&
      r.classToYear < youngestClassToYear;
    if (playedYounger || playedUp) voided.add(r.memberId);
  }

  for (const r of eligible) {
    if (voided.has(r.memberId)) {
      out.set(r.memberId, 0);
      continue;
    }
    const ac = findAgeClass(effectiveYear(r, disp), ageClasses);
    if (!ac) continue;
    const list = buckets.get(ac.label) ?? [];
    list.push(r);
    buckets.set(ac.label, list);
  }

  for (const list of buckets.values()) {
    const sorted = [...list].sort(byPointsThenQuality);
    for (const [id, pts] of assignLadder(sorted, averageAll)) out.set(id, pts);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Girls / percentile
// ---------------------------------------------------------------------------

/** Banker's rounding (round half to even) — matches the reference script's Python `round`. */
function roundHalfEven(x: number): number {
  if (Math.abs(x - Math.trunc(x)) === 0.5) {
    const f = Math.floor(x);
    return f % 2 === 0 ? f : f + 1;
  }
  return Math.round(x);
}

/**
 * Girls percentile points for a girl at 0-based rank `i` among `n` girls in her
 * playing class: q = (n-1-i)/(n-1), so the top girl gets q=1 and a lone girl
 * q=0 → 5. Top half 11+28*(q-0.5) (25→11), below median 5+12*q (10→5); banker's
 * rounding to match the reference script.
 */
function girlsPercentile(i: number, n: number): number {
  const q = n > 1 ? (n - 1 - i) / (n - 1) : 0;
  const raw = q >= 0.5 ? 11 + 28 * (q - 0.5) : 5 + 12 * q;
  return roundHalfEven(raw);
}

/**
 * Girls ranking within a playing class: official `place` first, then round-scaled
 * points (`scaledPts` descending), then quality (`secPoints`; negated on dropouts
 * so they sink), then youngest first — matching the reference script's sort.
 */
function byGirlsRank(a: JgpPlayerResult, b: JgpPlayerResult): number {
  return (
    a.place - b.place ||
    Math.trunc((b.scaledPts ?? 0) * 10) - Math.trunc((a.scaledPts ?? 0) * 10) ||
    b.quality - a.quality ||
    b.birthYear - a.birthYear
  );
}

/**
 * Compute girls-division standings points for ONE tournament — girls-only, per
 * playing class, matching Ganesh Srinivasson's reference script:
 *  - filter to girls, drop no-shows and zero-game players;
 *  - group by playing `klass` (groups sharing a klass merge, e.g. two beginner
 *    groups both "z"); rank the girls in that klass by {@link byGirlsRank};
 *  - non-beginner: percentile over N girls, but dropouts score a flat 4;
 *  - beginner (klass e/f/z): top-3 get 8/7/6, the rest 5.
 *
 * Only Stockholm-eligible girls are returned; non-local girls stay in the pool
 * (they affect N and ranks) but are dropped from the displayed table.
 *
 * @returns memberId → standings points for this tournament (eligible girls only).
 */
export function computePercentileTournament(
  rows: JgpPlayerResult[],
  isEligible: (row: JgpPlayerResult) => boolean,
): Map<number, number> {
  // Girls only (filtered before grouping, per the reference `step_02`); no-shows
  // and zero-game players are excluded so they don't inflate N.
  const girls = rows.filter((r) => r.isFemale && !r.isNoShow && r.gamesPlayed > 0);

  // Group by playing class; groups configured with the same klass merge.
  const byKlass = new Map<string, JgpPlayerResult[]>();
  for (const r of girls) {
    const key = r.klass ?? r.classKey;
    const list = byKlass.get(key) ?? [];
    list.push(r);
    byKlass.set(key, list);
  }

  const allPoints = new Map<number, number>();
  for (const list of byKlass.values()) {
    const sorted = [...list].sort(byGirlsRank);
    const beginner = sorted[0]?.isBeginnerClass;
    sorted.forEach((r, i) => {
      // A dropout scores a flat 4 — but only if they had points to lose: the
      // reference negates points then scores `points < 0` as 4, so a 0-point
      // dropout (−0 is not < 0) falls through to the percentile (last place).
      const pts = beginner
        ? ([8, 7, 6][i] ?? 5)
        : r.isDropout && r.points > 0
          ? 4
          : girlsPercentile(i, sorted.length);
      allPoints.set(r.memberId, pts);
    });
  }

  const out = new Map<number, number>();
  for (const r of girls) {
    if (isEligible(r)) out.set(r.memberId, allPoints.get(r.memberId)!);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Season aggregation
// ---------------------------------------------------------------------------

/** Minimal per-player identity carried across a season. */
interface PlayerMeta {
  memberId: number;
  name: string;
  birthYear: number;
  effYear: number;
  clubName: string;
  isFemale: boolean;
}

/**
 * Aggregate per-tournament point maps into standings rows.
 *
 * @param perTournamentPoints one memberId→points map per tournament, in column order
 * @param meta memberId → identity (from the merged result pool)
 * @param sortRows comparator applied within each table (best first)
 */
function aggregate(
  perTournamentPoints: Map<number, number>[],
  meta: Map<number, PlayerMeta>,
): Map<number, JgpStandingRow> {
  const rows = new Map<number, JgpStandingRow>();
  const n = perTournamentPoints.length;
  for (const [id, m] of meta) {
    const perTournament: (number | null)[] = new Array(n).fill(null);
    let total = 0;
    let played = 0;
    perTournamentPoints.forEach((map, t) => {
      const pts = map.get(id);
      if (pts != null) {
        perTournament[t] = pts;
        total += pts;
        played++;
      }
    });
    if (played === 0) continue;
    rows.set(id, {
      memberId: id,
      name: m.name,
      birthYear: m.birthYear,
      clubName: m.clubName,
      perTournament,
      total: round2(total),
      played,
      place: 0,
    });
  }
  return rows;
}

/** Round to 2 decimals to tame floating-point sums of .5 rungs. */
function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/**
 * Order rows within a table and assign sequential 1-based places. The official
 * standings number every row distinctly (no shared ranks); rows with equal
 * totals are separated by the documented tie-break — higher total, then fewer
 * tournaments, then younger (higher year). Players identical on all three are
 * left in an unspecified order: the published rules define no further tie-break,
 * so their relative order cannot be reproduced from the ruleset.
 */
function placeRows(rows: JgpStandingRow[], effYearById: Map<number, number>): JgpStandingRow[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.total - a.total ||
      a.played - b.played ||
      (effYearById.get(b.memberId) ?? b.birthYear) - (effYearById.get(a.memberId) ?? a.birthYear),
  );
  sorted.forEach((r, i) => {
    r.place = i + 1;
  });
  return sorted;
}

/** Build the per-player identity pool from all tournaments' normalized rows. */
function buildMeta(tournamentsRows: JgpPlayerResult[][], disp: Map<number, number>): Map<number, PlayerMeta> {
  const meta = new Map<number, PlayerMeta>();
  for (const rows of tournamentsRows) {
    for (const r of rows) {
      if (meta.has(r.memberId)) continue;
      meta.set(r.memberId, {
        memberId: r.memberId,
        name: `${r.firstName} ${r.lastName}`.trim(),
        birthYear: r.birthYear,
        effYear: effectiveYear(r, disp),
        clubName: r.clubName,
        isFemale: r.isFemale,
      });
    }
  }
  return meta;
}

/**
 * Compute the full open-division season: one standings table per age class.
 *
 * @param tournamentsRows normalized rows per tournament, in column order
 */
export function computeOpenSeason(
  tournamentsRows: JgpPlayerResult[][],
  ageClasses: JgpAgeClass[],
  dispensations: JgpDispensation[],
  isEligible: (row: JgpPlayerResult) => boolean,
  tieScoring: 'ranked' | 'averaged' = 'ranked',
): JgpAgeClassTable[] {
  const disp = dispensationMap(dispensations);
  const averageAll = tieScoring === 'averaged';
  const perTournament = tournamentsRows.map((rows) =>
    computeLadderTournament(rows, ageClasses, disp, isEligible, averageAll),
  );
  const meta = buildMeta(tournamentsRows, disp);
  const allRows = aggregate(perTournament, meta);
  const effYearById = new Map([...meta].map(([id, m]) => [id, m.effYear]));

  return ageClasses.map((ac) => {
    const rows = [...allRows.values()].filter((r) => {
      const m = meta.get(r.memberId)!;
      return findAgeClass(m.effYear, ageClasses)?.label === ac.label;
    });
    return { ageClass: ac, rows: placeRows(rows, effYearById) };
  });
}

/**
 * Compute the full girls-division season: a single combined ranking.
 *
 * @param tournamentsRows normalized rows per tournament, in column order
 */
export function computeGirlsSeason(
  tournamentsRows: JgpPlayerResult[][],
  isEligible: (row: JgpPlayerResult) => boolean,
): JgpStandingRow[] {
  const perTournament = tournamentsRows.map((rows) =>
    computePercentileTournament(rows, isEligible),
  );
  const meta = buildMeta(tournamentsRows, new Map());
  const allRows = aggregate(perTournament, meta);
  const effYearById = new Map([...meta].map(([id, m]) => [id, m.birthYear]));
  return placeRows([...allRows.values()], effYearById);
}
