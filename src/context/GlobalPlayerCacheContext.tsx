'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { PlayerInfoDto } from '@/lib/api/types';
import { PlayerService } from '@/lib/api';
import { getPlayerDateCacheKey, normalizeEloLookupDate } from '@/lib/api/utils/dateUtils';

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
  // Single unified cache keyed by "playerId-YYYY-MM-01"
  // All lookups use a date (current date for "current" player, specific date for historical)
  const playerCacheRef = useRef<Map<string, PlayerInfoDto>>(new Map());
  const [, setVersion] = useState(0);

  const bump = useCallback(() => setVersion(v => v + 1), []);

  const playerServiceRef = useRef<PlayerService | null>(null);
  const getPlayerService = useCallback(() => {
    if (!playerServiceRef.current) {
      playerServiceRef.current = new PlayerService();
    }
    return playerServiceRef.current;
  }, []);

  // Helper to get current month cache key
  const getCurrentDateKey = useCallback((playerId: number): string => {
    return getPlayerDateCacheKey(playerId, normalizeEloLookupDate(Date.now()));
  }, []);

  // --- Sync lookups ---

  const getPlayer = useCallback((playerId: number): PlayerInfoDto | undefined => {
    return playerCacheRef.current.get(getCurrentDateKey(playerId));
  }, [getCurrentDateKey]);

  const getPlayerByDate = useCallback((playerId: number, date: number): PlayerInfoDto | undefined => {
    const key = getPlayerDateCacheKey(playerId, normalizeEloLookupDate(date));
    return playerCacheRef.current.get(key);
  }, []);

  // --- Async fetch methods ---

  const getOrFetchPlayer = useCallback(async (playerId: number): Promise<PlayerInfoDto | undefined> => {
    const normalizedDate = normalizeEloLookupDate(Date.now());
    const key = getPlayerDateCacheKey(playerId, normalizedDate);
    const cached = playerCacheRef.current.get(key);
    if (cached) return cached;

    const service = getPlayerService();
    const response = await service.getPlayerInfo(playerId);
    if (response.status === 200 && response.data) {
      playerCacheRef.current.set(key, response.data);
      bump();
      return response.data;
    }
    return undefined;
  }, [getPlayerService, bump]);

  const getOrFetchPlayers = useCallback(async (playerIds: number[]): Promise<Map<number, PlayerInfoDto>> => {
    const normalizedDate = normalizeEloLookupDate(Date.now());
    const result = new Map<number, PlayerInfoDto>();
    const missingIds: number[] = [];

    for (const id of playerIds) {
      const key = getPlayerDateCacheKey(id, normalizedDate);
      const cached = playerCacheRef.current.get(key);
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
          const key = getPlayerDateCacheKey(response.data.id, normalizedDate);
          playerCacheRef.current.set(key, response.data);
          result.set(response.data.id, response.data);
        }
      });
      bump();
    }

    return result;
  }, [getPlayerService, bump]);

  const getOrFetchPlayerByDate = useCallback(async (playerId: number, date: number): Promise<PlayerInfoDto | undefined> => {
    const normalizedDate = normalizeEloLookupDate(date);
    const key = getPlayerDateCacheKey(playerId, normalizedDate);
    const cached = playerCacheRef.current.get(key);
    if (cached) return cached;

    const service = getPlayerService();
    const dateObj = new Date(normalizedDate);
    const response = await service.getPlayerInfo(playerId, dateObj);
    if (response.status === 200 && response.data) {
      playerCacheRef.current.set(key, response.data);
      bump();
      return response.data;
    }
    return undefined;
  }, [getPlayerService, bump]);

  const getOrFetchPlayersByDate = useCallback(async (requests: PlayerDateRequest[]): Promise<void> => {
    const missing: PlayerDateRequest[] = [];

    for (const req of requests) {
      const normalizedDate = normalizeEloLookupDate(req.date);
      const key = getPlayerDateCacheKey(req.playerId, normalizedDate);
      if (!playerCacheRef.current.has(key)) {
        missing.push({ playerId: req.playerId, date: normalizedDate });
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
        playerCacheRef.current.set(key, response.value.data);
        added = true;
      }
    });

    if (added) bump();
  }, [getPlayerService, bump]);

  const value: GlobalPlayerCacheContextValue = {
    getPlayer,
    getPlayerByDate,
    getOrFetchPlayer,
    getOrFetchPlayers,
    getOrFetchPlayerByDate,
    getOrFetchPlayersByDate,
  };

  return (
    <GlobalPlayerCacheContext.Provider value={value}>
      {children}
    </GlobalPlayerCacheContext.Provider>
  );
}
