/**
 * Data layer for the tournament print route. Fetches a tournament and, for one
 * group or all groups, its standings + round pairings — shaped for the print
 * sheets. Mirrors the per-group fetching the results detail layout does, but for
 * many groups at once (parallel). No React; the print route calls this on mount.
 */
import {
  TournamentService,
  ResultsService,
  findTournamentGroup,
  isTeamPairing,
  type TournamentDto,
  type TournamentClassDto,
  type TournamentClassGroupDto,
  type TournamentEndResultDto,
  type TeamTournamentEndResultDto,
  type TournamentRoundResultDto,
  type PlayerInfoDto,
} from '@/lib/api';

export interface PrintGroupData {
  group: TournamentClassGroupDto;
  className: string | null;
  /** Tournament has >1 class (mirrors the detail page's `hasMultipleClasses`). */
  multipleClasses: boolean;
  /** This group's class has >1 group (mirrors `hasMultipleGroups`). */
  multipleGroups: boolean;
  kind: 'individual' | 'team';
  /** Individual standings (empty for team). */
  standings: TournamentEndResultDto[];
  /** Team standings (empty for individual). */
  teamStandings: TeamTournamentEndResultDto[];
  /** Round pairings — individual pairs, or team board rows (grouped into matches in the UI). */
  roundResults: TournamentRoundResultDto[];
  /** Player lookup built from the standings' embedded playerInfo (individual). */
  playerMap: Map<number, PlayerInfoDto>;
  /** Distinct round numbers present, ascending. */
  rounds: number[];
}

export interface PrintData {
  tournament: TournamentDto;
  groups: PrintGroupData[];
  /** Total groups in the whole tournament (drives whether "all groups" is offered). */
  totalGroups: number;
}

/** Flatten the class tree (root classes + nested subClasses), preserving order. */
function flattenClasses(tournament: TournamentDto): TournamentClassDto[] {
  const out: TournamentClassDto[] = [];
  const walk = (c: TournamentClassDto) => {
    out.push(c);
    c.subClasses?.forEach(walk);
  };
  tournament.rootClasses?.forEach(walk);
  return out;
}

function distinctRounds(rows: TournamentRoundResultDto[]): number[] {
  return [...new Set(rows.map((r) => r.roundNr || 1))].sort((a, b) => a - b);
}

/**
 * Load print data. `groupId` undefined → all groups of the tournament.
 * Throws if the tournament itself can't be loaded; per-group fetch failures
 * degrade to empty arrays (that group just prints with no rows).
 */
export async function loadPrintData(tournamentId: number, groupId?: number): Promise<PrintData> {
  const tournamentService = new TournamentService();
  const tResp = await tournamentService.getTournament(tournamentId);
  if (tResp.status !== 200 || !tResp.data) {
    throw new Error('Failed to load tournament');
  }
  const tournament = tResp.data;

  // Resolve target groups (one, or all in document order). multipleClasses /
  // multipleGroups mirror the detail page's hasMultipleClasses / hasMultipleGroups.
  const allClasses = flattenClasses(tournament);
  const multipleClasses = allClasses.length > 1;
  type Target = { group: TournamentClassGroupDto; className: string | null; multipleGroups: boolean };
  const targets: Target[] = [];
  if (groupId != null) {
    const found = findTournamentGroup(tournament, groupId);
    if (found) {
      targets.push({
        group: found.group,
        className: found.parentClass?.className ?? null,
        multipleGroups: (found.parentClass?.groups?.length ?? 0) > 1,
      });
    }
  } else {
    for (const c of allClasses) {
      const multipleGroups = (c.groups?.length ?? 0) > 1;
      for (const g of c.groups ?? []) {
        targets.push({ group: g, className: c.className ?? null, multipleGroups });
      }
    }
  }

  const results = new ResultsService();
  const team = isTeamPairing(tournament.type);

  const groups = await Promise.all(
    targets.map(async ({ group, className, multipleGroups }): Promise<PrintGroupData> => {
      if (team) {
        const [standRes, roundRes] = await Promise.all([
          results.getTeamTournamentResults(group.id),
          results.getTeamRoundResults(group.id),
        ]);
        const roundResults = roundRes.status === 200 ? roundRes.data ?? [] : [];
        return {
          group,
          className,
          multipleClasses,
          multipleGroups,
          kind: 'team',
          standings: [],
          teamStandings: standRes.status === 200 ? standRes.data ?? [] : [],
          roundResults,
          playerMap: new Map(),
          rounds: distinctRounds(roundResults),
        };
      }

      const [standRes, roundRes] = await Promise.all([
        results.getTournamentResults(group.id),
        results.getTournamentRoundResults(group.id),
      ]);
      const standings = standRes.status === 200 ? standRes.data ?? [] : [];
      const roundResults = roundRes.status === 200 ? roundRes.data ?? [] : [];
      const playerMap = new Map<number, PlayerInfoDto>();
      standings.forEach((s) => {
        if (s.playerInfo) playerMap.set(s.playerInfo.id, s.playerInfo);
      });
      return {
        group,
        className,
        multipleClasses,
        multipleGroups,
        kind: 'individual',
        standings,
        teamStandings: [],
        roundResults,
        playerMap,
        rounds: distinctRounds(roundResults),
      };
    }),
  );

  const totalGroups = allClasses.reduce((n, c) => n + (c.groups?.length ?? 0), 0);
  return { tournament, groups, totalGroups };
}
