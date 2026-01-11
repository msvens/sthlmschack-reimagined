'use client';

import { createContext, useContext } from 'react';
import { GameDto, PlayerInfoDto, TournamentDto } from '@/lib/api/types';

export interface PlayerContextValue {
  // Current player (fetched first, available immediately for page header)
  currentPlayer: PlayerInfoDto | null;
  currentPlayerLoading: boolean;

  // Raw game data
  games: GameDto[];
  gamesLoading: boolean;
  gamesError: string | null;

  // Batch-fetched metadata with loading states
  playerMap: Map<number, PlayerInfoDto>;
  playersLoading: boolean;
  tournamentMap: Map<number, TournamentDto>;
  tournamentsLoading: boolean;

  // Helper functions
  getPlayerName: (playerId: number) => string;
  getPlayerRating: (playerId: number) => string;
  getTournamentName: (groupId: number) => string;
  getTournamentTimeControl: (groupId: number) => 'standard' | 'rapid' | 'blitz';
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export const PlayerProvider = PlayerContext.Provider;