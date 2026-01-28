'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, PlayerService, TournamentService, formatPlayerRating, formatPlayerName } from '@/lib/api';
import { GameDto, PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { PlayerProvider, PlayerContextValue, TournamentParticipation } from '@/context/PlayerContext';
import { parseTimeControl } from '@/lib/api/utils/ratingUtils';
import { isTeamTournament, findTournamentGroup } from '@/lib/api';
import { calculatePlayerResult, calculatePlayerPoints } from '@/lib/api/utils/opponentStats';

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

  // Tournament participation derived from games
  const [tournaments, setTournaments] = useState<TournamentParticipation[]>([]);

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

        // Step 4: Build TournamentParticipation[] from games
        // Group games by groupId and calculate stats per group
        interface GroupStats {
          gameCount: number;
          wins: number;
          draws: number;
          losses: number;
          totalPoints: number;
        }
        const statsByGroup = new Map<number, GroupStats>();

        gameData.forEach(game => {
          const stats = statsByGroup.get(game.groupiD) || { gameCount: 0, wins: 0, draws: 0, losses: 0, totalPoints: 0 };
          stats.gameCount++;

          // Calculate result (handles standard and 3-1 point systems)
          const result = calculatePlayerResult(game, memberId);
          if (result === 'win') stats.wins++;
          else if (result === 'draw') stats.draws++;
          else if (result === 'loss') stats.losses++;
          // null results (walkovers, forfeits) are not counted in W/D/L

          // Calculate points using the tournament's point system
          const points = calculatePlayerPoints(game, memberId);
          if (points !== null) stats.totalPoints += points;

          statsByGroup.set(game.groupiD, stats);
        });

        // Build tournament participation list
        const participations: TournamentParticipation[] = [];
        for (const groupId of groupIds) {
          const tournament = newTournamentMap.get(groupId);
          if (!tournament) continue;

          // Get group metadata
          const groupResult = findTournamentGroup(tournament, groupId);
          const groupName = groupResult?.group.name || '';
          const groupStartDate = groupResult?.group.start || tournament.start;
          const groupEndDate = groupResult?.group.end || tournament.end;
          const className = groupResult?.parentClass.className || '';
          const hasMultipleClasses = groupResult?.hasMultipleClasses ?? false;

          const stats = statsByGroup.get(groupId) || { gameCount: 0, wins: 0, draws: 0, losses: 0, totalPoints: 0 };

          participations.push({
            groupId,
            tournament,
            gameCount: stats.gameCount,
            groupName,
            groupStartDate,
            groupEndDate,
            className,
            hasMultipleClasses,
            isTeam: isTeamTournament(tournament.type),
            wins: stats.wins,
            draws: stats.draws,
            losses: stats.losses,
            totalPoints: stats.totalPoints,
          });
        }

        // Sort by date (latest first)
        participations.sort((a, b) => {
          const dateA = new Date(a.groupEndDate);
          const dateB = new Date(b.groupEndDate);
          return dateB.getTime() - dateA.getTime();
        });

        setTournaments(participations);
        setTournamentsLoading(false); // Tournaments ready

        // Step 5: Fetch opponent player info LAST (only needed for Opponents tab)
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

  // Helper functions (includes FIDE title if available)
  const getPlayerName = useMemo(() => (playerId: number): string => {
    const player = playerMap.get(playerId);
    if (player) {
      return formatPlayerName(player.firstName, player.lastName, player.elo?.title);
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
    tournaments,
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