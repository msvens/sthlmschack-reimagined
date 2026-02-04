'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { PlayerInfoDto } from '@/lib/api/types';
import { PlayerService } from '@/lib/api';
import { getPlayerDateCacheKey } from '@/lib/api/utils/dateUtils';

export interface PlayerDateRequest {
  playerId: number;
  date: number; // timestamp in milliseconds
}

export interface GlobalPlayerCacheContextValue {
  // Sync lookups (cache-only, no API call)
  getPlayer(playerId: number): PlayerInfoDto | undefined;
  getPlayerByDate(playerId: number, date: number): PlayerInfoDto | undefined;

  // Async fetch methods (check cache first, only call API for misses)
  getOrFetchPlayer(playerId: number): Promise<PlayerInfoDto | undefined>;
  getOrFetchPlayers(playerIds: number[]): Promise<Map<number, PlayerInfoDto>>;
  getOrFetchPlayerByDate(playerId: number, date: number): Promise<PlayerInfoDto | undefined>;
  getOrFetchPlayersByDate(requests: PlayerDateRequest[]): Promise<void>;

  // Bulk cache population (for when route contexts fetch data)
  addPlayers(players: PlayerInfoDto[]): void;
  addPlayersByDate(players: PlayerInfoDto[]): void;
}

const GlobalPlayerCacheContext = createContext<GlobalPlayerCacheContextValue | null>(null);

export function useGlobalPlayerCache() {
  const context = useContext(GlobalPlayerCacheContext);
  if (!context) {
    throw new Error('useGlobalPlayerCache must be used within a GlobalPlayerCacheProvider');
  }
  return context;
}

export function GlobalPlayerCacheProvider({ children }: { children: ReactNode }) {
  // Using refs for the actual cache data to avoid re-renders on every cache update.
  // State counter triggers re-renders only when consumers need fresh data.
  const playerMapRef = useRef<Map<number, PlayerInfoDto>>(new Map());
  const playerDateMapRef = useRef<Map<string, PlayerInfoDto>>(new Map());
  const [, setVersion] = useState(0);

  const bump = useCallback(() => setVersion(v => v + 1), []);

  const playerServiceRef = useRef<PlayerService | null>(null);
  const getPlayerService = useCallback(() => {
    if (!playerServiceRef.current) {
      playerServiceRef.current = new PlayerService();
    }
    return playerServiceRef.current;
  }, []);

  // --- Sync lookups ---

  const getPlayer = useCallback((playerId: number): PlayerInfoDto | undefined => {
    return playerMapRef.current.get(playerId);
  }, []);

  const getPlayerByDate = useCallback((playerId: number, date: number): PlayerInfoDto | undefined => {
    const key = getPlayerDateCacheKey(playerId, date);
    return playerDateMapRef.current.get(key);
  }, []);

  // --- Async fetch methods ---

  const getOrFetchPlayer = useCallback(async (playerId: number): Promise<PlayerInfoDto | undefined> => {
    const cached = playerMapRef.current.get(playerId);
    if (cached) return cached;

    const service = getPlayerService();
    const response = await service.getPlayerInfo(playerId);
    if (response.status === 200 && response.data) {
      playerMapRef.current.set(playerId, response.data);
      bump();
      return response.data;
    }
    return undefined;
  }, [getPlayerService, bump]);

  const getOrFetchPlayers = useCallback(async (playerIds: number[]): Promise<Map<number, PlayerInfoDto>> => {
    const result = new Map<number, PlayerInfoDto>();
    const missingIds: number[] = [];

    for (const id of playerIds) {
      const cached = playerMapRef.current.get(id);
      if (cached) {
        result.set(id, cached);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      const service = getPlayerService();
      const responses = await service.getPlayerInfoBatch(missingIds);
      responses.forEach(response => {
        if (response.data) {
          playerMapRef.current.set(response.data.id, response.data);
          result.set(response.data.id, response.data);
        }
      });
      bump();
    }

    return result;
  }, [getPlayerService, bump]);

  const getOrFetchPlayerByDate = useCallback(async (playerId: number, date: number): Promise<PlayerInfoDto | undefined> => {
    const key = getPlayerDateCacheKey(playerId, date);
    const cached = playerDateMapRef.current.get(key);
    if (cached) return cached;

    const service = getPlayerService();
    const dateObj = new Date(date);
    const response = await service.getPlayerInfo(playerId, dateObj);
    if (response.status === 200 && response.data) {
      playerDateMapRef.current.set(key, response.data);
      bump();
      return response.data;
    }
    return undefined;
  }, [getPlayerService, bump]);

  const getOrFetchPlayersByDate = useCallback(async (requests: PlayerDateRequest[]): Promise<void> => {
    const missing: PlayerDateRequest[] = [];

    for (const req of requests) {
      const key = getPlayerDateCacheKey(req.playerId, req.date);
      if (!playerDateMapRef.current.has(key)) {
        missing.push(req);
      }
    }

    if (missing.length === 0) return;

    const service = getPlayerService();
    // Fetch all missing in parallel batches
    const responses = await Promise.allSettled(
      missing.map(req => service.getPlayerInfo(req.playerId, new Date(req.date)))
    );

    let added = false;
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled' && response.value.status === 200 && response.value.data) {
        const key = getPlayerDateCacheKey(missing[index].playerId, missing[index].date);
        playerDateMapRef.current.set(key, response.value.data);
        added = true;
      }
    });

    if (added) bump();
  }, [getPlayerService, bump]);

  // --- Bulk population ---

  const addPlayers = useCallback((players: PlayerInfoDto[]): void => {
    if (players.length === 0) return;
    let added = false;
    for (const player of players) {
      if (!playerMapRef.current.has(player.id)) {
        playerMapRef.current.set(player.id, player);
        added = true;
      }
    }
    if (added) bump();
  }, [bump]);

  const addPlayersByDate = useCallback((players: PlayerInfoDto[]): void => {
    if (players.length === 0) return;
    let added = false;
    for (const player of players) {
      if (player.elo?.date) {
        // Use the elo.date from the response as the source of truth
        const dateTimestamp = new Date(player.elo.date).getTime();
        const key = getPlayerDateCacheKey(player.id, dateTimestamp);
        if (!playerDateMapRef.current.has(key)) {
          playerDateMapRef.current.set(key, player);
          added = true;
        }
      }
    }
    if (added) bump();
  }, [bump]);

  const value: GlobalPlayerCacheContextValue = {
    getPlayer,
    getPlayerByDate,
    getOrFetchPlayer,
    getOrFetchPlayers,
    getOrFetchPlayerByDate,
    getOrFetchPlayersByDate,
    addPlayers,
    addPlayersByDate,
  };

  return (
    <GlobalPlayerCacheContext.Provider value={value}>
      {children}
    </GlobalPlayerCacheContext.Provider>
  );
}
