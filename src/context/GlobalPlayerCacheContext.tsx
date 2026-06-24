'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { PlayerInfoDto, PlayerService, getPlayerDateCacheKey, normalizeEloLookupDate } from '@/lib/api';
import { PlayerDateCache, type PlayerCacheStatus } from '@/lib/player/playerDateCache';

export interface PlayerDateRequest {
  playerId: number;
  date: number; // timestamp in milliseconds
}

export type { PlayerCacheStatus };

export interface GlobalPlayerCacheContextValue {
  // Sync lookups (cache-only, no API call)
  getPlayer(playerId: number): PlayerInfoDto | undefined;
  getPlayerByDate(playerId: number, date: number): PlayerInfoDto | undefined;
  /**
   * Tri-state cache status, so callers can tell "still loading" from "confirmed
   * has no record" (the API returns 204/404 for the latter). `date` omitted =
   * current month.
   */
  getPlayerStatus(playerId: number, date?: number): PlayerCacheStatus;

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
  // Single unified cache keyed by "playerId-YYYY-MM-01" (see PlayerDateCache for
  // the negative-caching semantics). All lookups use a date — current date for
  // the "current" player, a specific date for historical lookups.
  const playerCacheRef = useRef<PlayerDateCache>(new PlayerDateCache());
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
    return playerCacheRef.current.get(getPlayerDateCacheKey(playerId, normalizeEloLookupDate(date)));
  }, []);

  const getPlayerStatus = useCallback((playerId: number, date?: number): PlayerCacheStatus => {
    const key = date !== undefined
      ? getPlayerDateCacheKey(playerId, normalizeEloLookupDate(date))
      : getCurrentDateKey(playerId);
    return playerCacheRef.current.status(key);
  }, [getCurrentDateKey]);

  // --- Async fetch methods ---

  const getOrFetchPlayer = useCallback(async (playerId: number): Promise<PlayerInfoDto | undefined> => {
    const normalizedDate = normalizeEloLookupDate(Date.now());
    const key = getPlayerDateCacheKey(playerId, normalizedDate);
    if (playerCacheRef.current.has(key)) return playerCacheRef.current.get(key);

    const service = getPlayerService();
    const response = await service.getPlayerInfo(playerId);
    playerCacheRef.current.setFromResult(key, response.status === 200 ? response.data : null);
    bump();
    return playerCacheRef.current.get(key);
  }, [getPlayerService, bump]);

  const getOrFetchPlayers = useCallback(async (playerIds: number[]): Promise<Map<number, PlayerInfoDto>> => {
    const normalizedDate = normalizeEloLookupDate(Date.now());
    const result = new Map<number, PlayerInfoDto>();
    const missingIds: number[] = [];

    for (const id of playerIds) {
      const key = getPlayerDateCacheKey(id, normalizedDate);
      if (playerCacheRef.current.has(key)) {
        const cached = playerCacheRef.current.get(key);
        if (cached) result.set(id, cached); // negative entries stay out of the result
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      const service = getPlayerService();
      // TODO: Switch to getPlayerList once the SSF API handles missing IDs
      // gracefully (currently POST /player/list/ returns 500 if any ID is unknown)
      const responses = await service.getPlayerInfoBatch(missingIds);
      const returned = new Set<number>();
      responses.forEach(response => {
        if (response.data) {
          playerCacheRef.current.setFound(getPlayerDateCacheKey(response.data.id, normalizedDate), response.data);
          result.set(response.data.id, response.data);
          returned.add(response.data.id);
        }
      });
      // Negative-cache any requested id the batch didn't return, so we stop refetching it.
      missingIds.forEach(id => {
        if (!returned.has(id)) playerCacheRef.current.setMissing(getPlayerDateCacheKey(id, normalizedDate));
      });
      bump();
    }

    return result;
  }, [getPlayerService, bump]);

  const getOrFetchPlayerByDate = useCallback(async (playerId: number, date: number): Promise<PlayerInfoDto | undefined> => {
    const normalizedDate = normalizeEloLookupDate(date);
    const key = getPlayerDateCacheKey(playerId, normalizedDate);
    if (playerCacheRef.current.has(key)) return playerCacheRef.current.get(key);

    const service = getPlayerService();
    const response = await service.getPlayerInfo(playerId, new Date(normalizedDate));
    playerCacheRef.current.setFromResult(key, response.status === 200 ? response.data : null);
    bump();
    return playerCacheRef.current.get(key);
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

    responses.forEach((response, index) => {
      const key = getPlayerDateCacheKey(missing[index].playerId, missing[index].date);
      // Negative-cache failures/no-data too, so we don't refetch them.
      const data =
        response.status === 'fulfilled' && response.value.status === 200 ? response.value.data : null;
      playerCacheRef.current.setFromResult(key, data);
    });

    bump();
  }, [getPlayerService, bump]);

  const value: GlobalPlayerCacheContextValue = {
    getPlayer,
    getPlayerByDate,
    getPlayerStatus,
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
