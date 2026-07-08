/**
 * Live data loader for a JGP season: fetches every counting group's results and
 * round results from the SSF API, normalizes them, and runs the scoring engine.
 *
 * Pure and React-free — the `useJgpStandings` hook wraps this with state and the
 * Stockholm-eligibility predicate built from the organizations context.
 */

import {
  ResultsService,
  chunkArray,
  type TournamentEndResultDto,
  type TournamentRoundResultDto,
} from '@/lib/api';
import type { JgpSeason } from '@/data/jgp/types';
import { normalizeTournamentResults, type JgpGroupResults } from './jgpAdapter';
import {
  computeGirlsSeason,
  computeOpenSeason,
  type JgpAgeClassTable,
  type JgpPlayerResult,
} from './jgpEngine';

/** Max concurrent group fetches, matching the SDK's batch default. */
const CONCURRENCY = 10;

interface GroupRef {
  tournamentIndex: number;
  groupId: number;
  isBeginner: boolean;
  fromYear?: number;
  toYear?: number;
  klass?: string;
  rounds?: number;
  results: TournamentEndResultDto[];
  roundResults: TournamentRoundResultDto[];
}

/**
 * Fetch, normalize and score a full season. `isEligible` answers only the
 * Stockholm-district question; the engine handles beginner/no-games dropping.
 */
export async function loadSeasonStandings(
  season: JgpSeason,
  isEligible: (row: JgpPlayerResult) => boolean,
): Promise<JgpAgeClassTable[]> {
  const svc = new ResultsService();

  // Flatten every counting group across the season, keeping tournament order.
  const refs: GroupRef[] = [];
  season.tournaments.forEach((t, tournamentIndex) => {
    for (const g of t.groups) {
      refs.push({
        tournamentIndex,
        groupId: g.groupId,
        isBeginner: g.isBeginner,
        fromYear: g.fromYear,
        toYear: g.toYear,
        klass: g.klass,
        rounds: g.rounds,
        results: [],
        roundResults: [],
      });
    }
  });

  // Concurrency-limited fan-out — ResultsService has no batch method, so mirror
  // the SDK's chunked Promise.allSettled pattern.
  for (const chunk of chunkArray(refs, CONCURRENCY)) {
    await Promise.allSettled(
      chunk.map(async (ref) => {
        const [res, rounds] = await Promise.all([
          svc.getTournamentResults(ref.groupId),
          svc.getTournamentRoundResults(ref.groupId),
        ]);
        ref.results = res.status === 200 ? res.data ?? [] : [];
        ref.roundResults = rounds.status === 200 ? rounds.data ?? [] : [];
      }),
    );
  }

  // Regroup by tournament (column order preserved) → normalize → score.
  const tournamentsRows: JgpPlayerResult[][] = season.tournaments.map((_t, ti) => {
    const groups: JgpGroupResults[] = refs
      .filter((r) => r.tournamentIndex === ti)
      .map((r) => ({
        groupId: r.groupId,
        isBeginner: r.isBeginner,
        fromYear: r.fromYear,
        toYear: r.toYear,
        klass: r.klass,
        rounds: r.rounds,
        results: r.results,
        roundResults: r.roundResults,
      }));
    return normalizeTournamentResults(groups);
  });

  // Girls: one flat percentile ranking (no age classes), wrapped as a single
  // "table" so the hook's return type is shared with the open division.
  if (season.division === 'girls') {
    return [
      { ageClass: { label: '', fromYear: 0, toYear: 9999 }, rows: computeGirlsSeason(tournamentsRows, isEligible) },
    ];
  }

  return computeOpenSeason(
    tournamentsRows,
    season.ageClasses ?? [],
    season.dispensations,
    isEligible,
    season.tieScoring ?? 'ranked',
  );
}
