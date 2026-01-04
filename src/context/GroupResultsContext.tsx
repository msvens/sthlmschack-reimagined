'use client';

import { createContext, useContext } from 'react';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto, TeamTournamentEndResultDto } from '@/lib/api/types';

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
  groupStartDate: string | null;
  groupEndDate: string | null;
  loading: boolean;
  error: string | null;

  // Helper functions
  getPlayerName: (playerId: number) => string;
  getPlayerElo: (playerId: number) => string;
  getClubName: (clubId: number) => string;
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