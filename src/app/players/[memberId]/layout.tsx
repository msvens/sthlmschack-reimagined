'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, PlayerService, TournamentService, formatPlayerRating } from '@/lib/api';
import { GameDto, PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { PlayerProvider, PlayerContextValue } from '@/context/PlayerContext';
import { parseTimeControl } from '@/lib/api/utils/ratingUtils';

export default function PlayerLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const memberId = params.memberId ? parseInt(params.memberId as string) : null;

  // Current player (fetched first, available immediately)
  const [currentPlayer, setCurrentPlayer] = useState<PlayerInfoDto | null>(null);
  const [currentPlayerLoading, setCurrentPlayerLoading] = useState(true);

  // Game data
  const [games, setGames] = useState<GameDto[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);

  // Batch-fetched metadata with separate loading states
  const [playerMap, setPlayerMap] = useState<Map<number, PlayerInfoDto>>(new Map());
  const [playersLoading, setPlayersLoading] = useState(true);
  const [tournamentMap, setTournamentMap] = useState<Map<number, TournamentDto>>(new Map());
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  // Fetch game data and batch metadata
  useEffect(() => {
    if (!memberId || isNaN(memberId)) {
      setGamesError('Invalid member ID');
      setGamesLoading(false);
      return;
    }

    const fetchGamesAndMetadata = async () => {
      try {
        setGamesLoading(true);
        setCurrentPlayerLoading(true);
        setGamesError(null);

        const resultsService = new ResultsService();
        const playerService = new PlayerService();
        const tournamentService = new TournamentService();

        // Step 0: Fetch current player info FIRST (needed immediately for page header)
        const playerResponse = await playerService.getPlayerInfo(memberId);
        let currentPlayerData: PlayerInfoDto | null = null;

        if (playerResponse.status === 200 && playerResponse.data) {
          currentPlayerData = playerResponse.data;
          setCurrentPlayer(currentPlayerData);
          // Add to playerMap immediately so it's available in opponents tab
          setPlayerMap(new Map([[memberId, currentPlayerData]]));
        }
        setCurrentPlayerLoading(false);

        // Step 1: Fetch all games for the member
        const gamesResponse = await resultsService.getMemberGames(memberId);

        if (gamesResponse.status !== 200 || !gamesResponse.data) {
          throw new Error('Failed to fetch game data');
        }

        const gameData = gamesResponse.data;
        setGames(gameData);
        setGamesLoading(false); // Games are ready, can show pie charts now

        // Step 2: Extract unique opponent IDs and group IDs
        const opponentIds = new Set<number>();
        const groupIds = new Set<number>();

        gameData.forEach(game => {
          // Add opponent player IDs (exclude current player and W.O players with ID -1)
          if (game.whiteId !== -1 && game.whiteId !== memberId) {
            opponentIds.add(game.whiteId);
          }
          if (game.blackId !== -1 && game.blackId !== memberId) {
            opponentIds.add(game.blackId);
          }

          // Collect group IDs
          groupIds.add(game.groupiD);
        });

        // Step 3: Fetch tournaments FIRST (priority - needed for Individual, Team, and Opponents tabs)
        const tournamentResults = await tournamentService.getTournamentFromGroupBatch(Array.from(groupIds));

        const newTournamentMap = new Map<number, TournamentDto>();
        const groupIdArray = Array.from(groupIds);
        tournamentResults.forEach((result, index) => {
          if (result.data) {
            newTournamentMap.set(groupIdArray[index], result.data);
          }
        });

        setTournamentMap(newTournamentMap);
        setTournamentsLoading(false); // Tournaments ready

        // Step 4: Fetch opponent player info SECOND (only needed for Opponents tab)
        // Note: Current player already fetched in Step 0
        const playerInfoResults = await playerService.getPlayerInfoBatch(Array.from(opponentIds));

        // Start with current player in the map
        const newPlayerMap = new Map<number, PlayerInfoDto>();
        if (currentPlayerData) {
          newPlayerMap.set(memberId, currentPlayerData);
        }

        // Add opponents
        playerInfoResults.forEach(result => {
          if (result.data) {
            newPlayerMap.set(result.data.id, result.data);
          }
        });

        setPlayerMap(newPlayerMap);
        setPlayersLoading(false); // Player info ready
      } catch (err) {
        console.error('Error fetching games and metadata:', err);
        setGamesError('Failed to load game data');
        setGamesLoading(false);
        setTournamentsLoading(false);
        setPlayersLoading(false);
      }
    };

    fetchGamesAndMetadata();
  }, [memberId]);

  // Helper functions
  const getPlayerName = useMemo(() => (playerId: number): string => {
    const player = playerMap.get(playerId);
    if (player) {
      return `${player.firstName} ${player.lastName}`;
    }
    return `Player ${playerId}`;
  }, [playerMap]);

  const getPlayerRating = useMemo(() => (playerId: number): string => {
    const player = playerMap.get(playerId);
    if (!player || !player.elo) {
      return '-';
    }
    // Show latest standard rating (simplified - not tournament-specific)
    return formatPlayerRating(player.elo, null);
  }, [playerMap]);

  const getTournamentName = useMemo(() => (groupId: number): string => {
    const tournament = tournamentMap.get(groupId);
    return tournament?.name || `Unknown Tournament (Group ${groupId})`;
  }, [tournamentMap]);

  const getTournamentTimeControl = useMemo(() => (groupId: number): 'standard' | 'rapid' | 'blitz' => {
    const tournament = tournamentMap.get(groupId);
    const timeControl = parseTimeControl(tournament?.thinkingTime);
    return timeControl || 'standard';
  }, [tournamentMap]);

  // Context value
  const contextValue: PlayerContextValue = {
    currentPlayer,
    currentPlayerLoading,
    games,
    gamesLoading,
    gamesError,
    playerMap,
    playersLoading,
    tournamentMap,
    tournamentsLoading,
    getPlayerName,
    getPlayerRating,
    getTournamentName,
    getTournamentTimeControl,
  };

  return (
    <PlayerProvider value={contextValue}>
      {children}
    </PlayerProvider>
  );
}