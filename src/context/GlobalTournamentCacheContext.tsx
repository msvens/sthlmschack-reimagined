'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { TournamentDto } from '@/lib/api/types';
import { TournamentService } from '@/lib/api';

export interface GlobalTournamentCacheContextValue {
  // Sync lookup (cache-only)
  getTournament(groupId: number): TournamentDto | undefined;

  // Async: check cache first, fetch misses via getTournamentFromGroupBatch
  getOrFetchTournaments(groupIds: number[]): Promise<Map<number, TournamentDto>>;

  // Bulk population (for when other code already has tournament data)
  addTournament(groupId: number, tournament: TournamentDto): void;
}

const GlobalTournamentCacheContext = createContext<GlobalTournamentCacheContextValue | null>(null);

export function useGlobalTournamentCache() {
  const context = useContext(GlobalTournamentCacheContext);
  if (!context) {
    throw new Error('useGlobalTournamentCache must be used within a GlobalTournamentCacheProvider');
  }
  return context;
}

export function GlobalTournamentCacheProvider({ children }: { children: ReactNode }) {
  const tournamentMapRef = useRef<Map<number, TournamentDto>>(new Map());
  const [, setVersion] = useState(0);

  const bump = useCallback(() => setVersion(v => v + 1), []);

  const tournamentServiceRef = useRef<TournamentService | null>(null);
  const getTournamentService = useCallback(() => {
    if (!tournamentServiceRef.current) {
      tournamentServiceRef.current = new TournamentService();
    }
    return tournamentServiceRef.current;
  }, []);

  // --- Sync lookup ---

  const getTournament = useCallback((groupId: number): TournamentDto | undefined => {
    return tournamentMapRef.current.get(groupId);
  }, []);

  // --- Async fetch ---

  const getOrFetchTournaments = useCallback(async (groupIds: number[]): Promise<Map<number, TournamentDto>> => {
    const result = new Map<number, TournamentDto>();
    const missingIds: number[] = [];

    for (const id of groupIds) {
      const cached = tournamentMapRef.current.get(id);
      if (cached) {
        result.set(id, cached);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      const service = getTournamentService();
      const responses = await service.getTournamentFromGroupBatch(missingIds);
      responses.forEach((response, index) => {
        if (response.data) {
          tournamentMapRef.current.set(missingIds[index], response.data);
          result.set(missingIds[index], response.data);
        }
      });
      bump();
    }

    return result;
  }, [getTournamentService, bump]);

  // --- Bulk population ---

  const addTournament = useCallback((groupId: number, tournament: TournamentDto): void => {
    if (!tournamentMapRef.current.has(groupId)) {
      tournamentMapRef.current.set(groupId, tournament);
      bump();
    }
  }, [bump]);

  const value: GlobalTournamentCacheContextValue = {
    getTournament,
    getOrFetchTournaments,
    addTournament,
  };

  return (
    <GlobalTournamentCacheContext.Provider value={value}>
      {children}
    </GlobalTournamentCacheContext.Provider>
  );
}
