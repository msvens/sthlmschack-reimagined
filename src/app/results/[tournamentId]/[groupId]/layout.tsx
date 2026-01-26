'use client';

import { ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, TournamentService, PlayerService, formatRatingWithType, getPlayerRatingByAlgorithm } from '@/lib/api';
import { chunkArray } from '@/lib/api/utils/batchUtils';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto, TeamTournamentEndResultDto, TournamentDto, isTeamTournament } from '@/lib/api/types';
import { GroupResultsProvider, GroupResultsContextValue, PlayerDateRequest } from '@/context/GroupResultsContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { useLanguage } from '@/context/LanguageContext';
import { findTournamentGroup } from '@/lib/api/utils/tournamentGroupUtils';

// Concurrency for date-based API calls (each date triggers a separate batch)
const DATE_CONCURRENCY = 3;

/**
 * Generate cache key for player-date combination
 * Normalizes to month-start (YYYY-MM-01) since SSF ELO updates monthly
 * This ensures all dates within a month share the same cache entry
 */
function getPlayerDateKey(playerId: number, date: number): string {
  const d = new Date(date);
  const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  return `${playerId}-${monthStart}`;
}

/**
 * Convert a date to month-start string for API calls
 * SSF API returns the same ELO for any date within a month
 */
function getMonthStartString(date: number): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function GroupResultsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const { getClubName: getOrgClubName } = useOrganizations();
  const { language } = useLanguage();
  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

  // Tournament metadata
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [thinkingTime, setThinkingTime] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [groupStartDate, setGroupStartDate] = useState<string | null>(null);
  const [groupEndDate, setGroupEndDate] = useState<string | null>(null);
  const [rankingAlgorithm, setRankingAlgorithm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual tournament results
  const [individualResults, setIndividualResults] = useState<TournamentEndResultDto[]>([]);
  const [individualRoundResults, setIndividualRoundResults] = useState<TournamentRoundResultDto[]>([]);

  // Team tournament results
  const [teamResults, setTeamResults] = useState<TeamTournamentEndResultDto[]>([]);
  const [teamRoundResults, setTeamRoundResults] = useState<TournamentRoundResultDto[]>([]);

  // Historical player data cache: "playerId-YYYY-MM-DD" -> PlayerInfoDto
  const [playerDateCache, setPlayerDateCache] = useState<Map<string, PlayerInfoDto>>(new Map());

  // Fetch tournament data and results when IDs are available
  useEffect(() => {
    if (!tournamentId || !groupId || isNaN(tournamentId) || isNaN(groupId)) {
      setError('Invalid tournament or group ID');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const resultsService = new ResultsService();
        const tournamentService = new TournamentService();

        // Fetch tournament metadata first to determine type
        const tournamentResponse = await tournamentService.getTournament(tournamentId);

        if (tournamentResponse.status !== 200 || !tournamentResponse.data) {
          throw new Error('Failed to fetch tournament data');
        }

        const tournamentData = tournamentResponse.data;
        setTournament(tournamentData);
        setThinkingTime(tournamentData.thinkingTime || null);

        // Find the group metadata to get name, dates, and ranking algorithm
        const groupResult = findTournamentGroup(tournamentData, groupId);
        if (groupResult) {
          setGroupName(groupResult.group.name);
          setGroupStartDate(groupResult.group.start);
          setGroupEndDate(groupResult.group.end);
          setRankingAlgorithm(groupResult.group.rankingAlgorithm);
        }

        // Detect tournament type and fetch appropriate results
        const isTeam = isTeamTournament(tournamentData.type);

        if (isTeam) {
          // Fetch team tournament results
          const [teamTableResponse, teamRoundResponse] = await Promise.all([
            resultsService.getTeamTournamentResults(groupId),
            resultsService.getTeamRoundResults(groupId)
          ]);

          const teamTableData = teamTableResponse.status === 200 ? (teamTableResponse.data || []) : [];
          const teamRoundData = teamRoundResponse.status === 200 ? (teamRoundResponse.data || []) : [];

          // Set team results immediately so UI can render team standings table
          // Player info is fetched lazily when user expands individual matches
          setTeamResults(teamTableData);
          setTeamRoundResults(teamRoundData);
          setIndividualRoundResults([]);

        } else {
          // Fetch individual tournament results
          const [groupResponse, roundResponse] = await Promise.all([
            resultsService.getTournamentResults(groupId),
            resultsService.getTournamentRoundResults(groupId)
          ]);

          const individualData = groupResponse.status === 200 ? (groupResponse.data || []) : [];
          setIndividualResults(individualData);
          setIndividualRoundResults(roundResponse.status === 200 ? (roundResponse.data || []) : []);
          setTeamResults([]);
          setTeamRoundResults([]);

          // Pre-populate playerDateCache with player info from results
          // Use the elo.date field which tells us exactly which month's ELO this represents
          // This covers most tournaments (single day or short duration)
          // For multi-month tournaments, additional data is fetched lazily when needed
          if (individualData.length > 0) {
            setPlayerDateCache(prev => {
              const newCache = new Map(prev);
              for (const result of individualData) {
                if (result.playerInfo?.elo?.date) {
                  // Use the ELO date from the API response as the cache key
                  const eloDate = new Date(result.playerInfo.elo.date).getTime();
                  const monthStart = getMonthStartString(eloDate);
                  newCache.set(`${result.playerInfo.id}-${monthStart}`, result.playerInfo);
                }
              }
              return newCache;
            });
          }
        }

      } catch (err) {
        setError('Failed to load results data');
        console.error('Error fetching results:', err);
        setIndividualResults([]);
        setIndividualRoundResults([]);
        setTeamResults([]);
        setTeamRoundResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [tournamentId, groupId]);

  // Create player lookup map for O(1) lookups
  const playerMap = useMemo(() => {
    const map = new Map<number, PlayerInfoDto>();

    // For individual tournaments, use playerInfo from results
    individualResults.forEach(result => {
      if (result.playerInfo) {
        map.set(result.playerInfo.id, result.playerInfo);
      }
    });

    // For team tournaments, player info is populated lazily via fetchPlayersByDate
    // when users expand individual matches

    return map;
  }, [individualResults]);

  /**
   * Helper to find a player in either playerMap or playerDateCache
   * Used as fallback for name/club lookups when playerMap hasn't updated yet
   */
  const findPlayer = useCallback((playerId: number): PlayerInfoDto | undefined => {
    // First check playerMap (populated from individualResults)
    const fromMap = playerMap.get(playerId);
    if (fromMap) return fromMap;

    // Fallback: search playerDateCache (in case state hasn't synchronized)
    for (const player of playerDateCache.values()) {
      if (player.id === playerId) return player;
    }
    return undefined;
  }, [playerMap, playerDateCache]);

  // Helper to get player name from ID
  const getPlayerName = useCallback((playerId: number): string => {
    const player = findPlayer(playerId);
    if (!player) return `Player ${playerId}`;
    return `${player.firstName} ${player.lastName}`;
  }, [findPlayer]);

  // Helper to get player ELO from ID based on group's ranking algorithm
  const getPlayerElo = useCallback((playerId: number): string => {
    const player = findPlayer(playerId);
    const { rating, ratingType } = getPlayerRatingByAlgorithm(player?.elo, rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  }, [findPlayer, rankingAlgorithm, language]);

  // Helper to get player club ID from player ID
  const getPlayerClubId = useCallback((playerId: number): number | null => {
    const player = findPlayer(playerId);
    return player?.clubId ?? null;
  }, [findPlayer]);

  // Helper to get club name from ID
  const getClubName = (clubId: number): string => {
    return getOrgClubName(clubId);
  };

  /**
   * Fetch player info for multiple (playerId, date) pairs
   * Groups requests by month (since SSF ELO updates monthly) and fetches with controlled concurrency
   * Results are cached to avoid duplicate API calls
   * Also populates playerMap for name/club lookups
   */
  const fetchPlayersByDate = useCallback(async (requests: PlayerDateRequest[]): Promise<void> => {
    // Filter out already cached (playerId, month) combinations
    const uncached = requests.filter(r => !playerDateCache.has(getPlayerDateKey(r.playerId, r.date)));
    if (uncached.length === 0) return;

    // Group by month-start (API returns same ELO for any date within a month)
    const byMonth = new Map<string, Set<number>>();
    for (const req of uncached) {
      const monthStr = getMonthStartString(req.date);
      if (!byMonth.has(monthStr)) byMonth.set(monthStr, new Set());
      byMonth.get(monthStr)!.add(req.playerId);
    }

    // Convert to array and chunk for controlled concurrency
    const monthEntries = Array.from(byMonth.entries()).map(([month, ids]) => [month, Array.from(ids)] as [string, number[]]);
    const monthChunks = chunkArray(monthEntries, DATE_CONCURRENCY);

    const allResults: { monthStr: string; players: PlayerInfoDto[] }[] = [];
    const playerService = new PlayerService();

    // Process month chunks sequentially
    for (const chunk of monthChunks) {
      // Within chunk, fetch months in parallel
      const chunkResults = await Promise.all(
        chunk.map(async ([monthStr, playerIds]) => {
          const results = await playerService.getPlayerInfoBatch(playerIds, new Date(monthStr));
          const players = results.filter(r => r.data).map(r => r.data!);
          return { monthStr, players };
        })
      );
      allResults.push(...chunkResults);
    }

    // Collect all fetched players for playerMap update
    const allPlayers: PlayerInfoDto[] = [];
    for (const { players } of allResults) {
      allPlayers.push(...players);
    }

    // Update date cache with results (keyed by playerId-monthStart)
    setPlayerDateCache(prev => {
      const newCache = new Map(prev);
      for (const { monthStr, players } of allResults) {
        for (const player of players) {
          newCache.set(`${player.id}-${monthStr}`, player);
        }
      }
      return newCache;
    });

    // Also update individualResults to populate playerMap (for name/club lookups)
    // This allows getPlayerName and getPlayerClubId to work after lazy fetching
    if (allPlayers.length > 0 && groupId) {
      setIndividualResults(prev => {
        const existingIds = new Set(prev.map(r => r.playerInfo?.id).filter(Boolean));
        const newResults = allPlayers
          .filter(p => !existingIds.has(p.id))
          .map(playerInfo => ({
            place: 0,
            points: 0,
            secPoints: 0,
            contenderId: playerInfo.id,
            teamNumber: 0,
            wonGames: 0,
            drawGames: 0,
            lostGames: 0,
            groupId: groupId,
            playerInfo
          }));
        return [...prev, ...newResults];
      });
    }
  }, [playerDateCache, groupId]);

  /**
   * Get cached player info for a specific date
   * Returns undefined if not cached (call fetchPlayersByDate first)
   */
  const getPlayerByDate = useCallback((playerId: number, date: number): PlayerInfoDto | undefined => {
    return playerDateCache.get(getPlayerDateKey(playerId, date));
  }, [playerDateCache]);

  /**
   * Get formatted ELO for a player at a specific historical date
   * Falls back to current playerMap if historical data not available
   */
  const getPlayerEloByDate = useCallback((playerId: number, date: number): string => {
    const historicalPlayer = playerDateCache.get(getPlayerDateKey(playerId, date));
    const player = historicalPlayer || playerMap.get(playerId);
    const { rating, ratingType } = getPlayerRatingByAlgorithm(player?.elo, rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  }, [playerDateCache, playerMap, rankingAlgorithm, language]);

  // Determine if this is a team tournament
  const isTeam = tournament ? isTeamTournament(tournament.type) : false;

  const contextValue: GroupResultsContextValue = {
    isTeamTournament: isTeam,
    individualResults,
    individualRoundResults,
    teamResults,
    teamRoundResults,
    playerMap,
    thinkingTime,
    groupName,
    groupStartDate,
    groupEndDate,
    rankingAlgorithm,
    loading,
    error,
    getPlayerName,
    getPlayerElo,
    getPlayerClubId,
    getClubName,
    fetchPlayersByDate,
    getPlayerByDate,
    getPlayerEloByDate
  };

  return (
    <GroupResultsProvider value={contextValue}>
      {children}
    </GroupResultsProvider>
  );
}
