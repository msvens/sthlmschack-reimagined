'use client';

import { createContext, useContext } from 'react';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto, TeamTournamentEndResultDto, RoundDto } from '@/lib/api/types';

/**
 * Request for fetching a player's info at a specific historical date
 */
export interface PlayerDateRequest {
  playerId: number;
  date: number;  // Unix timestamp in milliseconds
}

export interface GroupResultsContextValue {
  // Tournament type detection
  isTeamTournament: boolean;

  // Individual tournament fields
  individualResults: TournamentEndResultDto[];
  individualRoundResults: TournamentRoundResultDto[];

  // Team tournament fields
  teamResults: TeamTournamentEndResultDto[];
  teamRoundResults: TournamentRoundResultDto[];

  // Shared fields
  playerMap: Map<number, PlayerInfoDto>;
  thinkingTime: string | null;
  groupName: string | null;
  groupStartDate: string | null;
  groupEndDate: string | null;
  rankingAlgorithm: number | null;
  tournamentState: number | null;
  loading: boolean;
  error: string | null;

  // Helper functions
  getPlayerName: (playerId: number) => string;
  getPlayerElo: (playerId: number) => string;
  getPlayerClubId: (playerId: number) => number | null;
  getClubName: (clubId: number) => string;

  // Historical ELO functions for team tournaments
  fetchPlayersByDate: (requests: PlayerDateRequest[]) => Promise<void>;
  getPlayerByDate: (playerId: number, date: number) => PlayerInfoDto | undefined;
  getPlayerEloByDate: (playerId: number, date: number) => string;

  // Round metadata for per-round rating types
  /** Round metadata map: roundNumber -> RoundDto */
  roundsMap: Map<number, RoundDto>;
  /** Get the rated type for a specific round */
  getRoundRatedType: (roundNumber: number) => number | undefined;
  /** Get formatted ELO for a player at a specific date and round (uses round-specific rating type) */
  getPlayerEloByDateAndRound: (playerId: number, date: number, roundNumber?: number) => string;
}

const GroupResultsContext = createContext<GroupResultsContextValue | null>(null);

export function useGroupResults() {
  const context = useContext(GroupResultsContext);
  if (!context) {
    throw new Error('useGroupResults must be used within a GroupResultsProvider');
  }
  return context;
}

export const GroupResultsProvider = GroupResultsContext.Provider;