/**
 * Configuration types for the Stockholm Junior Grand Prix (JGP) standings.
 *
 * This is plain hand-maintained data (see `seasons.ts`), loaded synchronously
 * like `src/data/changelog.ts`. It is deliberately decoupled from the scoring
 * engine in `src/lib/junior/` so the same data shape could later be served from
 * an admin UI or uploaded JSON without touching the engine.
 */

/** Which JGP series a season belongs to. */
export type JgpDivision = 'open' | 'girls';

/** Scoring algorithm used for a division (see `src/lib/junior/jgpEngine.ts`). */
export type JgpScoring = 'ladder' | 'percentile';

/**
 * How ties (players with equal points and quality points) are turned into
 * standings points:
 *  - `ranked` — the literal current rules: assign 25, 22, 20 … straight down the
 *    ranked table. Players in the SAME tournament group keep that group's order
 *    (distinct scores); players in DIFFERENT groups can't be compared, so they
 *    share the average. This reproduces the 2026 standings exactly.
 *  - `averaged` — every set of players tied on points and quality points shares
 *    the average of the rungs they span, regardless of group. This is what the
 *    2025 (and earlier) standings were compiled with, so use it to reproduce
 *    those; it differs from the ranked rule by ±1-2 on same-group tied players.
 */
export type JgpTieScoring = 'ranked' | 'averaged';

/**
 * A player allowed to be scored in an older age class than their birth year
 * (Swedish: dispens / "spelardispens"). Overrides the wrong-class penalty and
 * the age bucket the player is sorted into.
 */
export interface JgpDispensation {
  /** SSF member id — the stable key. Prefer this over name matching. */
  memberId: number;
  /** Display name, for readability/auditing of the config only. */
  name: string;
  /** The player's real birth year. */
  birthYear: number;
  /** The birth year the player is scored as (their granted age class). */
  playClassYear: number;
}

/**
 * One birth-year age class in the open series. Boundaries roll each season, so
 * they are stored explicitly per season (read off the official standings PDF).
 * Inclusive on both ends. Girls is a single combined ranking and has none.
 */
export interface JgpAgeClass {
  /** Label as printed on the standings, e.g. "2005-2009" or "2017 onward". */
  label: string;
  /** Oldest birth year in the class (inclusive). */
  fromYear: number;
  /** Youngest birth year in the class (inclusive). */
  toYear: number;
}

/**
 * One counting class-group of a tournament.
 *
 * Group classification is baked into the config, never parsed from group names
 * at runtime: organizer naming is inconsistent ("grupp A" vs "Klass A",
 * combined "Klass AB", dummy "ANVÄNDS EJ") and ambiguous — e.g. "Klass E" is a
 * dropped beginner class in a JGP event but a counted youngest age class in a
 * JDM event. Only groups listed here are fetched and scored; anything omitted
 * (unused/dummy groups) is ignored.
 */
export interface JgpGroupRef {
  /** SSF group id (the results endpoint key). */
  groupId: number;
  /**
   * Beginner class (JGP class E/F). Dropped from the open series; in the girls
   * series it still scores but on the beginner scale (baseline 5, top-3 8/7/6).
   * JDM events have no beginner groups, so their class E is `false`.
   */
  isBeginner: boolean;
  /** Optional class label for display/debug, e.g. "A", "AB", "E". */
  label?: string;
  /**
   * Girls series only: the class key players are pooled by (Ganesh's fixed
   * `extract_klass`): a class letter ("a".."f", "ab"), or "y" (öppen/allmän) or
   * "z" (nybörjar). Groups sharing a klass are scored together (e.g. two beginner
   * groups both "z"). Omit for the open series (it re-buckets by age instead).
   */
  klass?: string;
  /**
   * Girls series only: number of rounds the group played. Used to scale points
   * (`points / rounds`) as the same-place tie-break when pooled classes ran
   * different round counts. Omit for the open series.
   */
  rounds?: number;
  /**
   * Birth-year range the class admits (inclusive), authored from the class
   * definition — NOT parsed from the group name (combined classes like
   * "A/B (2005-2012)" and unlabelled "grupp A" defeat parsing). Used to detect
   * the wrong-class-without-dispensation penalty: a player whose class
   * `toYear` sits in an older age bucket than their own scores 0.
   * `toYear` of 9999 denotes an open-ended youngest class ("2015-").
   */
  fromYear?: number;
  toYear?: number;
}

/** A single constituent tournament of a JGP season. */
export interface JgpTournamentRef {
  /** Column header on the standings, e.g. "Tyresö JGP 2026". */
  label: string;
  /** Short label for narrow columns, e.g. "Tyresö". */
  shortLabel: string;
  /** Tournament start date (YYYY-MM-DD), for ordering and display. */
  date: string;
  /** SSF tournament id (for linking/metadata). */
  tournamentId: number;
  /** The counting class-groups (classified at authoring time). */
  groups: JgpGroupRef[];
}

/**
 * A player counted as Stockholm-eligible even though their SSF main club is not
 * in the Stockholm district — they hold a secondary membership in a Stockholm
 * club, which the results API does not expose. Maintained per season.
 */
export interface JgpClubException {
  /** SSF member id. */
  memberId: number;
  /** Display name, for auditing. */
  name: string;
  /** The Stockholm club they play for (for reference). */
  stockholmClub: string;
}

/** A full season of one division. */
export interface JgpSeason {
  /** Season year, e.g. 2025. */
  year: number;
  division: JgpDivision;
  scoring: JgpScoring;
  /** How tied players are scored; defaults to `ranked` (the current rules). */
  tieScoring?: JgpTieScoring;
  /**
   * The season's finals event, if held (SSF tournament id). Drives the "Finals"
   * link in the UI; omit for seasons whose finals hasn't happened yet.
   */
  finalsTournamentId?: number;
  /**
   * Marks a season whose inputs are estimated rather than authoritative — the
   * dispensations/club-exceptions were deduced from the published standings and
   * it may use the legacy `averaged` tie scoring. The UI shows a caveat banner.
   */
  estimated?: boolean;
  /** Constituent tournaments, in the order they should appear as columns. */
  tournaments: JgpTournamentRef[];
  /** Birth-year age classes — open only; omit/empty for girls. */
  ageClasses?: JgpAgeClass[];
  /** Per-season age dispensations (players scored in an older age class). */
  dispensations: JgpDispensation[];
  /** Per-season secondary-Stockholm-membership eligibility overrides. */
  clubExceptions: JgpClubException[];
}
