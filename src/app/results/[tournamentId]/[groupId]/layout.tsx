'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, TournamentService, formatPlayerRating } from '@/lib/api';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto } from '@/lib/api/types';
import { GroupResultsProvider, GroupResultsContextValue } from '@/context/GroupResultsContext';

export default function GroupResultsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

  const [groupResults, setGroupResults] = useState<TournamentEndResultDto[]>([]);
  const [roundResults, setRoundResults] = useState<TournamentRoundResultDto[]>([]);
  const [thinkingTime, setThinkingTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch tournament data and results in parallel
        const [tournamentResponse, groupResponse, roundResponse] = await Promise.all([
          tournamentService.getTournament(tournamentId),
          resultsService.getTournamentResults(groupId),
          resultsService.getTournamentRoundResults(groupId)
        ]);

        if (tournamentResponse.status === 200 && tournamentResponse.data) {
          setThinkingTime(tournamentResponse.data.thinkingTime || null);
        }

        if (groupResponse.status !== 200) {
          throw new Error(groupResponse.error || 'Failed to fetch group results');
        }

        if (roundResponse.status !== 200) {
          throw new Error(roundResponse.error || 'Failed to fetch round results');
        }

        setGroupResults(groupResponse.data || []);
        setRoundResults(roundResponse.data || []);

      } catch (err) {
        setError('Failed to load results data');
        console.error('Error fetching results:', err);
        setGroupResults([]);
        setRoundResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [tournamentId, groupId]);

  // Create player lookup map from group results for O(1) lookups
  const playerMap = useMemo(() => {
    const map = new Map<number, PlayerInfoDto>();
    groupResults.forEach(result => {
      if (result.playerInfo) {
        map.set(result.playerInfo.id, result.playerInfo);
      }
    });
    return map;
  }, [groupResults]);

  // Helper to get player name from ID
  const getPlayerName = (playerId: number): string => {
    const player = playerMap.get(playerId);
    if (!player) return `Player ${playerId}`;
    return `${player.firstName} ${player.lastName}`;
  };

  // Helper to get player ELO from ID based on tournament time control
  const getPlayerElo = (playerId: number): string => {
    const player = playerMap.get(playerId);
    return formatPlayerRating(player?.elo, thinkingTime);
  };

  const contextValue: GroupResultsContextValue = {
    groupResults,
    roundResults,
    playerMap,
    loading,
    error,
    getPlayerName,
    getPlayerElo
  };

  return (
    <GroupResultsProvider value={contextValue}>
      {children}
    </GroupResultsProvider>
  );
}
