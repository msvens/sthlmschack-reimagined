'use client';

import { createContext, useContext } from 'react';
import { GameDto, PlayerInfoDto, TournamentDto } from '@/lib/api/types';

/**
 * Tournament participation derived from games
 * Contains all data needed to display tournament in Individual/Team tabs
 */
export interface TournamentParticipation {
  groupId: number;
  tournament: TournamentDto;
  gameCount: number;
  groupName: string;
  groupStartDate: string;
  groupEndDate: string;
  className: string;
  hasMultipleClasses: boolean;
  isTeam: boolean;  // Derived from isTeamTournament(tournament.type)
  // Player's results in this tournament (individual games, even in team tournaments)
  wins: number;
  draws: number;
  losses: number;
  totalPoints: number;  // Sum of points using the tournament's point system
}

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

  // Tournament participation derived from games (unified list)
  tournaments: TournamentParticipation[];

  // Head-to-head state
  selectedOpponentId: number | null;
  selectedOpponentName: string | null;
  setSelectedOpponent: (opponentId: number | null, name?: string) => void;

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