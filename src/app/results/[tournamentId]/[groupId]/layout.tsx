'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ResultsService, TournamentService, PlayerService, formatPlayerRating } from '@/lib/api';
import { TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto, TournamentClassDto, TournamentClassGroupDto, TeamTournamentEndResultDto, TournamentDto, isTeamTournament } from '@/lib/api/types';
import { GroupResultsProvider, GroupResultsContextValue } from '@/context/GroupResultsContext';
import { useOrganizations } from '@/context/OrganizationsContext';

export default function GroupResultsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const { getClubName: getOrgClubName } = useOrganizations();
  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

  // Tournament metadata
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [thinkingTime, setThinkingTime] = useState<string | null>(null);
  const [groupStartDate, setGroupStartDate] = useState<string | null>(null);
  const [groupEndDate, setGroupEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual tournament results
  const [individualResults, setIndividualResults] = useState<TournamentEndResultDto[]>([]);
  const [individualRoundResults, setIndividualRoundResults] = useState<TournamentRoundResultDto[]>([]);

  // Team tournament results
  const [teamResults, setTeamResults] = useState<TeamTournamentEndResultDto[]>([]);
  const [teamRoundResults, setTeamRoundResults] = useState<TournamentRoundResultDto[]>([]);

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

        // Find the group metadata to get start/end dates
        const findGroupInClasses = (classes: TournamentClassDto[]): TournamentClassGroupDto | null => {
          for (const tournamentClass of classes) {
            const group = tournamentClass.groups?.find((g: TournamentClassGroupDto) => g.id === groupId);
            if (group) return group;
            if (tournamentClass.subClasses) {
              const found = findGroupInClasses(tournamentClass.subClasses);
              if (found) return found;
            }
          }
          return null;
        };

        const groupMeta = findGroupInClasses(tournamentData.rootClasses || []);
        if (groupMeta) {
          setGroupStartDate(groupMeta.start);
          setGroupEndDate(groupMeta.end);
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
          setTeamResults(teamTableData);
          setTeamRoundResults(teamRoundData);
          setIndividualRoundResults([]);

          // Fetch player info in background (non-blocking for team table)
          // This allows the team standings to display immediately while player names load
          // for the expanded round results view
          const fetchPlayerInfo = async () => {
            // Extract unique player IDs from games
            const playerIds = new Set<number>();
            teamRoundData.forEach(roundResult => {
              roundResult.games?.forEach(game => {
                playerIds.add(game.whiteId);
                playerIds.add(game.blackId);
              });
            });

            // Fetch player info for all unique player IDs in parallel
            if (playerIds.size > 0) {
              const playerService = new PlayerService();
              const playerInfoPromises = Array.from(playerIds).map(playerId =>
                playerService.getPlayerInfo(playerId)
              );

              const playerInfoResponses = await Promise.all(playerInfoPromises);

              // Build player map from responses
              const playersMap = new Map<number, PlayerInfoDto>();
              playerInfoResponses.forEach((response) => {
                if (response.status === 200 && response.data) {
                  playersMap.set(response.data.id, response.data);
                }
              });

              // Create minimal TournamentEndResultDto objects for playerMap population
              setIndividualResults(Array.from(playersMap.values()).map(playerInfo => ({
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
              })));
            }
          };

          // Start player fetch in background (don't await)
          fetchPlayerInfo().catch(err => {
            console.error('Error fetching player info for team tournament:', err);
          });

        } else {
          // Fetch individual tournament results
          const [groupResponse, roundResponse] = await Promise.all([
            resultsService.getTournamentResults(groupId),
            resultsService.getTournamentRoundResults(groupId)
          ]);

          setIndividualResults(groupResponse.status === 200 ? (groupResponse.data || []) : []);
          setIndividualRoundResults(roundResponse.status === 200 ? (roundResponse.data || []) : []);
          setTeamResults([]);
          setTeamRoundResults([]);
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

    // For team tournaments, extract player IDs from games
    // Note: We don't have full player info (names, ELO) in team round results
    // The games only contain player IDs, not their details
    // This means getPlayerName and getPlayerElo will fall back to "Player {id}"
    // TODO: Fetch player info for team tournaments if needed

    return map;
  }, [individualResults]);

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

  // Helper to get player club ID from player ID
  const getPlayerClubId = (playerId: number): number | null => {
    const player = playerMap.get(playerId);
    return player?.clubId ?? null;
  };

  // Helper to get club name from ID
  const getClubName = (clubId: number): string => {
    return getOrgClubName(clubId);
  };

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
    groupStartDate,
    groupEndDate,
    loading,
    error,
    getPlayerName,
    getPlayerElo,
    getPlayerClubId,
    getClubName
  };

  return (
    <GroupResultsProvider value={contextValue}>
      {children}
    </GroupResultsProvider>
  );
}
