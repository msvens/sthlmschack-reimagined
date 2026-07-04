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
  for (const { groupId, isBeginner, fromYear, toYear, results, roundResults } of groups) {
    const realGames = realGameCounts(roundResults);
    for (const r of results) {
      const p = r.playerInfo;
      rows.push({
        memberId: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        birthYear: birthYearOf(p.birthdate),
        isFemale: p.sex === 1,
        clubId: p.clubId,
        clubName: p.club,
        points: r.points,
        quality: r.secPoints,
        place: r.place,
        // A stable per-class key for the girls per-class scoring; the group id
        // uniquely identifies a playing class within a tournament.
        classKey: String(groupId),
        isBeginnerClass: isBeginner,
        classFromYear: fromYear ?? null,
        classToYear: toYear ?? null,
        gamesPlayed: r.wonGames + r.drawGames + r.lostGames,
        realGamesPlayed: realGames.get(r.contenderId) ?? 0,
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
