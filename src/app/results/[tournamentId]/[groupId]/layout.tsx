'use client';

import { ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, TournamentService, formatRatingWithType, getPlayerRatingStrict, getPlayerRatingByRoundType, formatPlayerName, TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto, TeamTournamentEndResultDto, TournamentDto, RoundDto, isTeamTournament, findTournamentGroup } from '@/lib/api';
import { GroupResultsProvider, GroupResultsContextValue, PlayerDateRequest } from '@/context/GroupResultsContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { useLanguage } from '@/context/LanguageContext';
import { useGlobalPlayerCache } from '@/context/GlobalPlayerCacheContext';

export default function GroupResultsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const { getClubName: getOrgClubName } = useOrganizations();
  const { language } = useLanguage();
  const globalCache = useGlobalPlayerCache();
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Individual tournament results
  const [individualResults, setIndividualResults] = useState<TournamentEndResultDto[]>([]);
  const [individualRoundResults, setIndividualRoundResults] = useState<TournamentRoundResultDto[]>([]);

  // Team tournament results
  const [teamResults, setTeamResults] = useState<TeamTournamentEndResultDto[]>([]);
  const [teamRoundResults, setTeamRoundResults] = useState<TournamentRoundResultDto[]>([]);

  // Round metadata for per-round rating types
  const [roundsMap, setRoundsMap] = useState<Map<number, RoundDto>>(new Map());

  /**
   * Fetch only results data (standings + round results).
   * Used by both initial load and live refresh.
   */
  const fetchResults = useCallback(async (isTeam: boolean, isInitialLoad: boolean) => {
    const resultsService = new ResultsService();

    if (isTeam) {
      const [teamTableResponse, teamRoundResponse] = await Promise.all([
        resultsService.getTeamTournamentResults(groupId!),
        resultsService.getTeamRoundResults(groupId!)
      ]);

      const teamTableData = teamTableResponse.status === 200 ? (teamTableResponse.data || []) : [];
      const teamRoundData = teamRoundResponse.status === 200 ? (teamRoundResponse.data || []) : [];

      setTeamResults(teamTableData);
      // On refresh, keep existing round results if API returns empty (API may return
      // empty during updates)
      if (teamRoundData.length > 0 || isInitialLoad) {
        setTeamRoundResults(teamRoundData);
      }
      setIndividualRoundResults([]);

    } else {
      const [groupResponse, roundResponse] = await Promise.all([
        resultsService.getTournamentResults(groupId!),
        resultsService.getTournamentRoundResults(groupId!)
      ]);

      const individualData = groupResponse.status === 200 ? (groupResponse.data || []) : [];
      setIndividualResults(individualData);
      const roundData = roundResponse.status === 200 ? (roundResponse.data || []) : [];
      // On refresh, keep existing round results if API returns empty (API may return
      // empty during updates)
      if (roundData.length > 0 || isInitialLoad) {
        setIndividualRoundResults(roundData);
      }
      setTeamResults([]);
      setTeamRoundResults([]);
    }

    setLastUpdated(new Date());
  }, [groupId]);

  /**
   * Full initial load: fetches tournament metadata + results.
   * Called on mount and when tournamentId/groupId changes.
   */
  const fetchInitialData = useCallback(async () => {
    if (!tournamentId || !groupId || isNaN(tournamentId) || isNaN(groupId)) {
      setError('Invalid tournament or group ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tournamentService = new TournamentService();
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

        // Build rounds map from tournamentRounds for per-round rating types
        const newRoundsMap = new Map<number, RoundDto>();
        groupResult.group.tournamentRounds?.forEach(round => {
          newRoundsMap.set(round.roundNumber, round);
        });
        setRoundsMap(newRoundsMap);
      }

      const isTeam = isTeamTournament(tournamentData.type);
      await fetchResults(isTeam, true);

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
  }, [tournamentId, groupId, fetchResults]);

  // Refresh function for live updates (only re-fetches results, not tournament metadata)
  const refreshResults = useCallback(async () => {
    if (!tournament || !groupId) return;
    try {
      await fetchResults(isTeamTournament(tournament.type), false);
    } catch (err) {
      console.error('Error refreshing results:', err);
    }
  }, [tournament, groupId, fetchResults]);

  // Initial fetch on mount or when IDs change
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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
   * Helper to find a player in either playerMap or global cache
   * Pass optional date for historical lookups (team tournaments)
   */
  const findPlayer = useCallback((playerId: number, date?: number): PlayerInfoDto | undefined => {
    // If date provided, try date-based cache first (for team tournament historical lookups)
    if (date !== undefined) {
      const fromDateCache = globalCache.getPlayerByDate(playerId, date);
      if (fromDateCache) return fromDateCache;
    }

    // Check playerMap (populated from individualResults)
    const fromMap = playerMap.get(playerId);
    if (fromMap) return fromMap;

    // Fallback: check global player cache (current month)
    return globalCache.getPlayer(playerId);
  }, [playerMap, globalCache]);

  // Helper to get player name from ID (includes FIDE title if available)
  // Pass optional date for historical lookups (team tournaments)
  const getPlayerName = useCallback((playerId: number, date?: number): string => {
    const player = findPlayer(playerId, date);
    if (!player) return `Player ${playerId}`;
    return formatPlayerName(player.firstName, player.lastName, player.elo?.title);
  }, [findPlayer]);

  // Helper to get player ELO from ID based on group's ranking algorithm
  // Uses strict rating matching (no fallback to other rating types)
  const getPlayerElo = useCallback((playerId: number): string => {
    const player = findPlayer(playerId);
    const { rating, ratingType } = getPlayerRatingStrict(player?.elo, rankingAlgorithm);
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
   * Delegates to the global player cache which handles deduplication and batching
   */
  const fetchPlayersByDate = useCallback(async (requests: PlayerDateRequest[]): Promise<void> => {
    await globalCache.getOrFetchPlayersByDate(requests);
  }, [globalCache]);

  /**
   * Get cached player info for a specific date
   * Returns undefined if not cached (call fetchPlayersByDate first)
   */
  const getPlayerByDate = useCallback((playerId: number, date: number): PlayerInfoDto | undefined => {
    return globalCache.getPlayerByDate(playerId, date);
  }, [globalCache]);

  /**
   * Get formatted ELO for a player at a specific historical date
   * Falls back to current playerMap if historical data not available
   * Uses strict rating matching (no fallback to other rating types)
   */
  const getPlayerEloByDate = useCallback((playerId: number, date: number): string => {
    const historicalPlayer = globalCache.getPlayerByDate(playerId, date);
    const player = historicalPlayer || playerMap.get(playerId);
    // Use strict rating - only returns the primary rating type for the algorithm
    // (e.g., rapid for RAPID_STANDARD_BLITZ_ELO), no fallback to standard
    const { rating, ratingType } = getPlayerRatingStrict(player?.elo, rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  }, [globalCache, playerMap, rankingAlgorithm, language]);

  /**
   * Get the rated type for a specific round
   * Returns the RoundDto.rated value (0=unrated, 1=standard, 2=rapid, 3=blitz)
   */
  const getRoundRatedType = useCallback((roundNumber: number): number | undefined => {
    return roundsMap.get(roundNumber)?.rated;
  }, [roundsMap]);

  /**
   * Get formatted ELO for a player at a specific historical date and round
   * Uses round's rated type if available, falls back to group rankingAlgorithm
   * Uses strict rating matching (no fallback to other rating types)
   */
  const getPlayerEloByDateAndRound = useCallback((
    playerId: number,
    date: number,
    roundNumber?: number
  ): string => {
    const historicalPlayer = globalCache.getPlayerByDate(playerId, date);
    const player = historicalPlayer || playerMap.get(playerId);

    // If round number provided, try to use round-specific rating type
    if (roundNumber !== undefined) {
      const roundRatedType = roundsMap.get(roundNumber)?.rated;
      if (roundRatedType !== undefined && roundRatedType !== 0) {
        const { rating, ratingType } = getPlayerRatingByRoundType(player?.elo, roundRatedType);
        return formatRatingWithType(rating, ratingType, language);
      }
    }

    // Fallback to group-level ranking algorithm (strict - no fallback to other rating types)
    const { rating, ratingType } = getPlayerRatingStrict(player?.elo, rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  }, [globalCache, playerMap, roundsMap, rankingAlgorithm, language]);

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
    tournamentState: tournament?.state ?? null,
    loading,
    error,
    getPlayerName,
    getPlayerElo,
    getPlayerClubId,
    getClubName,
    fetchPlayersByDate,
    getPlayerByDate,
    getPlayerEloByDate,
    roundsMap,
    getRoundRatedType,
    getPlayerEloByDateAndRound,
    refreshResults,
    lastUpdated
  };

  return (
    <GroupResultsProvider value={contextValue}>
      {children}
    </GroupResultsProvider>
  );
}
