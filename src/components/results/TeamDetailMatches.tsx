'use client';

import React, { useMemo } from 'react';
import { TournamentRoundResultDto, GameDto, isWalkoverPlayer, isWalkoverClub, createRoundResultsTeamNameFormatter, normalizeEloLookupDate, calculatePoints, ResultCode } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';

export interface TeamDetailMatchesProps {
  /** All matches involving this team */
  matches: TournamentRoundResultDto[];
  /** All round results in the tournament (for team name formatting) */
  allRoundResults: TournamentRoundResultDto[];
  /** Club ID of the selected team */
  selectedClubId: number;
  /** Team number of the selected team */
  selectedTeamNumber: number;
  /** Function to get club name from club ID */
  getClubName: (clubId: number) => string;
  /** Function to get player name from player ID, with optional date for historical lookups */
  getPlayerName: (playerId: number, date?: number) => string;
  /** Tournament ID for player links */
  tournamentId: number;
  /** Group ID for player links */
  groupId: number;
  /** Function to get player Elo at a specific historical date */
  getPlayerEloByDate: (playerId: number, date: number) => string;
}

// Match represents a team matchup (multiple boards)
interface TeamMatch {
  roundNr: number;
  homeId: number;
  awayId: number;
  homeTeamNumber: number;
  awayTeamNumber: number;
  homeScore: number;
  awayScore: number;
  date: string;
  finalized: boolean;
  boards: TournamentRoundResultDto[];
}

// Processed game data for display (selected team always in left column)
interface DisplayGame {
  boardNumber: number;
  selectedPlayerId: number;
  selectedPlayerElo: string;
  opponentPlayerId: number;
  opponentPlayerElo: string;
  selectedScore: number;
  opponentScore: number;
  isWalkover: boolean;
  resultCode: number | null; // Original result code for special display (e.g., adjudicated)
}

/**
 * Parse a date string to Unix timestamp in milliseconds
 */
function parseDateToTimestamp(dateStr: string): number {
  const asNumber = Number(dateStr);
  if (!isNaN(asNumber) && asNumber > 0) {
    return asNumber;
  }
  return new Date(dateStr).getTime();
}

/**
 * Format a date string for display (e.g., "2025-01-15")
 */
function formatMatchDate(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const timestamp = parseDateToTimestamp(dateStr);
  if (isNaN(timestamp) || timestamp <= 0) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function TeamDetailMatches({
  matches,
  allRoundResults,
  selectedClubId,
  selectedTeamNumber,
  getClubName,
  getPlayerName,
  tournamentId,
  groupId,
  getPlayerEloByDate
}: TeamDetailMatchesProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Group matches by round and aggregate board results
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, TeamMatch[]> = {};

    matches.forEach(result => {
      const round = result.roundNr || 1;
      if (!grouped[round]) grouped[round] = [];

      // Include team numbers in match key
      const matchKey = `${result.homeId}-${result.homeTeamNumber}-${result.awayId}-${result.awayTeamNumber}`;
      let match = grouped[round].find(m =>
        `${m.homeId}-${m.homeTeamNumber}-${m.awayId}-${m.awayTeamNumber}` === matchKey
      );

      if (!match) {
        match = {
          roundNr: round,
          homeId: result.homeId,
          awayId: result.awayId,
          homeTeamNumber: result.homeTeamNumber,
          awayTeamNumber: result.awayTeamNumber,
          homeScore: 0,
          awayScore: 0,
          date: result.date,
          finalized: result.finalized,
          boards: []
        };
        grouped[round].push(match);
      }

      match.boards.push(result);
      match.homeScore += result.homeResult || 0;
      match.awayScore += result.awayResult || 0;
    });

    return grouped;
  }, [matches]);

  // Create team name formatter using all round results to detect multi-team clubs
  const formatTeamDisplayName = useMemo(
    () => createRoundResultsTeamNameFormatter(allRoundResults, getClubName),
    [allRoundResults, getClubName]
  );

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  // Process a game to determine selected/opponent players and calculate result
  const processGame = (
    game: GameDto,
    homeClubId: number,
    awayClubId: number,
    isSelectedTeamHome: boolean,
    matchDate: number
  ): DisplayGame => {
    // Determine if white player is on home team using table number
    // In team chess: away team has white on board 1 (table 0), colors alternate by board
    // Even tables (0, 2, 4...): away team plays white (home plays black)
    // Odd tables (1, 3, 5...): home team plays white
    const tableNr = game.tableNr ?? 0;
    const whiteIsHome = tableNr % 2 === 1;

    const isWalkover = Math.abs(game.result) === 2 || isWalkoverPlayer(game.whiteId) || isWalkoverPlayer(game.blackId);

    // Assign players based on home/away
    const homePlayerId = whiteIsHome ? game.whiteId : game.blackId;
    const awayPlayerId = whiteIsHome ? game.blackId : game.whiteId;

    // Calculate scores using the utility function (handles all result codes including -10 for adjudicated 0-0)
    let homeScore = 0;
    let awayScore = 0;
    if (game.result != null && !(isWalkoverPlayer(game.whiteId) && isWalkoverPlayer(game.blackId))) {
      const [whitePoints, blackPoints] = calculatePoints(game.result);
      homeScore = whiteIsHome ? whitePoints : blackPoints;
      awayScore = whiteIsHome ? blackPoints : whitePoints;
    }

    // Get Elos
    const getElo = (playerId: number): string => {
      if (isWalkoverPlayer(playerId)) return '-';
      return getPlayerEloByDate(playerId, matchDate);
    };

    // Now map to selected/opponent based on which team is selected
    if (isSelectedTeamHome) {
      return {
        boardNumber: (game.tableNr !== undefined ? game.tableNr + 1 : 0),
        selectedPlayerId: homePlayerId,
        selectedPlayerElo: getElo(homePlayerId),
        opponentPlayerId: awayPlayerId,
        opponentPlayerElo: getElo(awayPlayerId),
        selectedScore: homeScore,
        opponentScore: awayScore,
        isWalkover,
        resultCode: game.result ?? null
      };
    } else {
      return {
        boardNumber: (game.tableNr !== undefined ? game.tableNr + 1 : 0),
        selectedPlayerId: awayPlayerId,
        selectedPlayerElo: getElo(awayPlayerId),
        opponentPlayerId: homePlayerId,
        opponentPlayerElo: getElo(homePlayerId),
        selectedScore: awayScore,
        opponentScore: homeScore,
        isWalkover,
        resultCode: game.result ?? null
      };
    }
  };

  // Format game result for display
  // Handles special result codes like adjudicated 0-0, walkovers, etc.
  const formatGameResult = (game: DisplayGame): string => {
    const { selectedScore, opponentScore, isWalkover, resultCode } = game;

    // No result yet
    if (resultCode == null) return '-';

    // Format the score part
    const formatScore = (score: number): string => {
      if (score === 0.5) return '½';
      return String(score);
    };

    // Check for special adjudicated results (both players get 0 or both get 1)
    const isAdjudicated = resultCode === ResultCode.BOTH_NO_RESULT ||
                          resultCode === ResultCode.BOTH_WIN ||
                          resultCode === ResultCode.SCHACK4AN_BOTH_NO_RESULT ||
                          resultCode === ResultCode.SCHACK4AN_BOTH_WIN ||
                          resultCode === ResultCode.POINT310_BOTH_NO_RESULT ||
                          resultCode === ResultCode.POINT310_BOTH_WIN;

    // Build result string from selected team's perspective
    const scoreStr = `${formatScore(selectedScore)} - ${formatScore(opponentScore)}`;

    if (isWalkover) {
      return `${scoreStr} w.o`;
    } else if (isAdjudicated) {
      return `${scoreStr} adj`;
    }

    return scoreStr;
  };

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 dark:text-gray-400">
          {t.pages.tournamentResults.teamDetailPage.noMatches}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map(roundNumber => {
        const roundMatches = matchesByRound[roundNumber] || [];

        return roundMatches.map((match, matchIndex) => {
          // Determine if selected team is home or away
          const isSelectedTeamHome = match.homeId === selectedClubId && match.homeTeamNumber === selectedTeamNumber;

          // Get team names and scores from perspective of selected team
          const selectedTeamName = isSelectedTeamHome
            ? (isWalkoverClub(match.homeId) ? 'W.O' : formatTeamDisplayName(match.homeId, match.homeTeamNumber))
            : (isWalkoverClub(match.awayId) ? 'W.O' : formatTeamDisplayName(match.awayId, match.awayTeamNumber));

          const opponentTeamName = isSelectedTeamHome
            ? (isWalkoverClub(match.awayId) ? 'W.O' : formatTeamDisplayName(match.awayId, match.awayTeamNumber))
            : (isWalkoverClub(match.homeId) ? 'W.O' : formatTeamDisplayName(match.homeId, match.homeTeamNumber));

          const selectedScore = isSelectedTeamHome ? match.homeScore : match.awayScore;
          const opponentScore = isSelectedTeamHome ? match.awayScore : match.homeScore;

          const matchDate = formatMatchDate(match.date, language);

          // Parse match date for Elo lookup
          const rawMatchDate = parseDateToTimestamp(match.date);
          const normalizedDate = !isNaN(rawMatchDate) && rawMatchDate > 0
            ? normalizeEloLookupDate(rawMatchDate)
            : Date.now();

          // Process all games
          const allGames = match.boards[0]?.games || [];
          const processedGames = allGames.map(game =>
            processGame(game, match.homeId, match.awayId, isSelectedTeamHome, normalizedDate)
          );
          const sortedGames = [...processedGames].sort((a, b) => a.boardNumber - b.boardNumber);

          // Create columns for board games table with fixed widths for alignment
          const boardColumns: TableColumn<DisplayGame>[] = [
            {
              id: 'board',
              header: t.pages.tournamentResults.teamRoundResults.board,
              accessor: (game) => game.boardNumber || '-',
              align: 'left',
              noWrap: true,
              width: '6%'
            },
            {
              id: 'selectedPlayer',
              header: selectedTeamName,
              headerClassName: 'max-w-[10ch] sm:max-w-none truncate',
              accessor: (game) => {
                if (isWalkoverPlayer(game.selectedPlayerId)) {
                  return <span className="text-gray-500 dark:text-gray-400">W.O</span>;
                }
                return (
                  <Link
                    href={`/results/${tournamentId}/${groupId}/${game.selectedPlayerId}`}
                    color="gray"
                  >
                    {getPlayerName(game.selectedPlayerId, normalizedDate)}
                  </Link>
                );
              },
              align: 'left',
              width: '28%'
            },
            {
              id: 'selectedElo',
              header: t.pages.tournamentResults.teamRoundResults.elo,
              accessor: (game) => game.selectedPlayerElo,
              align: 'center',
              noWrap: true,
              width: '10%'
            },
            {
              id: 'opponentPlayer',
              header: opponentTeamName,
              headerClassName: 'max-w-[10ch] sm:max-w-none truncate',
              accessor: (game) => {
                if (isWalkoverPlayer(game.opponentPlayerId)) {
                  return <span className="text-gray-500 dark:text-gray-400">W.O</span>;
                }
                return (
                  <Link
                    href={`/results/${tournamentId}/${groupId}/${game.opponentPlayerId}`}
                    color="gray"
                  >
                    {getPlayerName(game.opponentPlayerId, normalizedDate)}
                  </Link>
                );
              },
              align: 'left',
              width: '28%'
            },
            {
              id: 'opponentElo',
              header: t.pages.tournamentResults.teamRoundResults.elo,
              accessor: (game) => game.opponentPlayerElo,
              align: 'center',
              noWrap: true,
              width: '10%'
            },
            {
              id: 'result',
              header: t.pages.tournamentResults.teamRoundResults.result,
              accessor: (game) => formatGameResult(game),
              align: 'center',
              noWrap: true,
              cellStyle: { fontWeight: 'medium' },
              width: '18%'
            }
          ];

          const scoreDisplay = selectedScore === 0 && opponentScore === 0 ? '-' : `${selectedScore}-${opponentScore}`;

          return (
            <div
              key={`${roundNumber}-${matchIndex}`}
              className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700"
            >
              {/* Compact Match Header */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t.pages.tournamentResults.roundByRound.round} {roundNumber}: {scoreDisplay}</span>
                  {matchDate && <span className="text-gray-500 dark:text-gray-400"> · {matchDate}</span>}
                </div>
              </div>

              {/* Board Games Table */}
              <div className="px-4 py-2">
                <Table
                  data={sortedGames}
                  columns={boardColumns}
                  getRowKey={(game, index) => `${game.boardNumber}-${index}`}
                  density="compact"
                />
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}

export default TeamDetailMatches;
