'use client';

import { createContext, useContext, ReactNode } from 'react';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto } from '@/lib/api/types';

export interface GroupResultsContextValue {
  groupResults: TournamentEndResultDto[];
  roundResults: TournamentRoundResultDto[];
  playerMap: Map<number, PlayerInfoDto>;
  loading: boolean;
  error: string | null;
  getPlayerName: (playerId: number) => string;
  getPlayerElo: (playerId: number) => string;
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