/**
 * Adapter from raw SDK tournament data to the engine's normalized rows.
 * Kept separate from `jgpEngine.ts` so the scoring core has no SDK dependency.
 *
 * Group classification (beginner vs rated, which groups count) comes from the
 * config `JgpGroupRef`, NOT from parsing group names at runtime — see the note
 * on `JgpGroupRef` in `src/data/jgp/types.ts`. The name-parsing helpers below
 * exist only to generate that config offline at authoring time.
 */

import type {
  TournamentEndResultDto,
  TournamentRoundResultDto,
} from '@msvens/schack-se-sdk';
import type { JgpPlayerResult } from './jgpEngine';

/** One class-group's standings within a tournament, with its config classification. */
export interface JgpGroupResults {
  groupId: number;
  /** Beginner class (JGP E/F). From config, not parsed. */
  isBeginner: boolean;
  /** Oldest birth year the class admits (from config); null/undefined if unknown. */
  fromYear?: number | null;
  /** Youngest birth year the class admits (from config); null/undefined if unknown. */
  toYear?: number | null;
  /** Girls series: playing-class pooling key (config `klass`). Open: undefined. */
  klass?: string;
  /** Girls series: rounds the group played, for `scaledPts = points/rounds`. */
  rounds?: number;
  results: TournamentEndResultDto[];
  /** Per-round results for the group, used to count real (non-walkover) games. */
  roundResults: TournamentRoundResultDto[];
}

/**
 * Count each contender's real (non-walkover) games from round results, keyed by
 * contender id. A game's per-board `result` code is standard play when
 * |code| <= 1 and a walkover/forfeit when |code| >= 2.
 */
function realGameCounts(roundResults: TournamentRoundResultDto[]): Map<number, number> {
  const counts = new Map<number, number>();
  const bump = (id: number) => counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const r of roundResults) {
    const real = (r.games ?? []).some((g) => Math.abs(g.result) <= 1);
    if (!real) continue;
    if (r.homeId != null) bump(r.homeId);
    if (r.awayId != null) bump(r.awayId);
  }
  return counts;
}

/** Per-contender no-show / dropout status for the girls series. */
interface GirlsRoundStatus {
  /** Only ever a walkover loss (never showed up) — dropped from the series. */
  noShow: boolean;
  /** Last game a walkover loss, or played fewer rounds than the group — scored 4. */
  dropout: boolean;
}

/**
 * Reproduce the reference script's `get_no_show_walkover_players`: build each
 * contender's per-round status ('played' / 'walkover_loss') from the games, then
 * flag no-shows (only walkover losses) and dropouts (last status a walkover loss,
 * or a status count ≠ the rounds played). A game against the dummy player (-100)
 * counts as 'played' for the real player. The round count follows the round data
 * (max round seen) when it disagrees with the configured `rounds`.
 */
function girlsRoundStatus(
  roundResults: TournamentRoundResultDto[],
  rounds: number,
): Map<number, GirlsRoundStatus> {
  const status = new Map<number, string[]>();
  const push = (id: number, s: string) => {
    const list = status.get(id) ?? [];
    list.push(s);
    status.set(id, list);
  };
  let maxRound = 0;
  for (const r of roundResults) {
    maxRound = Math.max(maxRound, r.roundNr ?? 0);
    for (const g of r.games ?? []) {
      const { whiteId: w, blackId: b, result } = g;
      if (w === -100) {
        if (b != null) push(b, 'played');
        continue;
      }
      if (b === -100) {
        if (w != null) push(w, 'played');
        continue;
      }
      if (result === 2) {
        push(b, 'walkover_loss');
        push(w, 'played');
      } else if (result === -2) {
        push(w, 'walkover_loss');
        push(b, 'played');
      } else {
        push(w, 'played');
        push(b, 'played');
      }
    }
  }
  const n = maxRound !== rounds ? maxRound : rounds;
  const out = new Map<number, GirlsRoundStatus>();
  for (const [id, st] of status) {
    out.set(id, {
      noShow: st.every((s) => s === 'walkover_loss'),
      dropout: st[st.length - 1] === 'walkover_loss' || st.length !== n,
    });
  }
  return out;
}

/** Birth year from an SSF birthdate string ("2009" or "2009-05-01"). */
function birthYearOf(birthdate: string): number {
  return Number.parseInt(String(birthdate).slice(0, 4), 10);
}

/**
 * Flatten a tournament's counting class-groups into normalized engine rows.
 *
 * Note on `isFemale`: derived from the SSF `sex` field, where **1 = female**
 * and 0 = male (verified against the girls-only Tjejträffen roster). The girls
 * series relies on it.
 */
export function normalizeTournamentResults(groups: JgpGroupResults[]): JgpPlayerResult[] {
  const rows: JgpPlayerResult[] = [];
  for (const { groupId, isBeginner, fromYear, toYear, klass, rounds, results, roundResults } of groups) {
    const realGames = realGameCounts(roundResults);
    // Girls series extras (no-show/dropout, round-scaled points) — only when the
    // group carries a `klass`/`rounds` config; the open ladder ignores them.
    const girlStatus =
      klass != null && rounds != null ? girlsRoundStatus(roundResults, rounds) : undefined;
    for (const r of results) {
      const p = r.playerInfo;
      const status = girlStatus?.get(r.contenderId);
      const isDropout = status?.dropout ?? false;
      rows.push({
        memberId: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        birthYear: birthYearOf(p.birthdate),
        isFemale: p.sex === 1,
        clubId: p.clubId,
        clubName: p.club,
        points: r.points,
        // Dropouts have their quality negated so they sink in the girls sort (the
        // reference script negates points/secPoints before scoring them a flat 4).
        quality: isDropout ? -r.secPoints : r.secPoints,
        place: r.place,
        // A stable per-class key for the girls per-class scoring; the group id
        // uniquely identifies a playing class within a tournament.
        classKey: String(groupId),
        isBeginnerClass: isBeginner,
        classFromYear: fromYear ?? null,
        classToYear: toYear ?? null,
        gamesPlayed: r.wonGames + r.drawGames + r.lostGames,
        realGamesPlayed: realGames.get(r.contenderId) ?? 0,
        // Girls series only; undefined/false for the open ladder.
        klass,
        scaledPts: rounds != null ? r.points / rounds : undefined,
        isNoShow: status?.noShow ?? false,
        isDropout,
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Authoring-only helpers (used offline to generate config, never at runtime)
// ---------------------------------------------------------------------------

/** Parse the playing-class letter from a group name (authoring aid). */
export function parseClassLetter(groupName: string): string {
  const m = groupName.match(/(?:klass|grupp)\s+([a-fA-F]{1,2})\b/i);
  return m ? m[1].toUpperCase() : '';
}
