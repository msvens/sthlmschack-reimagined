'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TournamentRoundResultDto, GameDto } from '@/lib/api/types';
import { isWalkoverPlayer, isWalkoverClub, createRoundResultsTeamNameFormatter, normalizeEloLookupDate, calculatePoints, ResultCode } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';
import { PlayerDateRequest } from '@/context/GroupResultsContext';

export interface TeamRoundResultsProps {
  /** Team round results data */
  roundResults: TournamentRoundResultDto[];
  /** Function to get club name from club ID */
  getClubName: (clubId: number) => string;
  /** Function to get player name from player ID, with optional date for historical lookups */
  getPlayerName: (playerId: number, date?: number) => string;
  /** Function to get player ELO from player ID (current) */
  getPlayerElo: (playerId: number) => string;
  /** Tournament ID for player links */
  tournamentId: number;
  /** Group ID for player links */
  groupId: number;
  /** Function to fetch player info for specific dates (historical ELO) */
  fetchPlayersByDate?: (requests: PlayerDateRequest[]) => Promise<void>;
  /** Function to get player ELO at a specific historical date */
  getPlayerEloByDate?: (playerId: number, date: number) => string;
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
  boards: TournamentRoundResultDto[]; // All board results for this match
}

// Processed game data for display (home team always in left column)
interface DisplayGame {
  boardNumber: number;
  homePlayerId: number;
  homePlayerElo: string;
  awayPlayerId: number;
  awayPlayerElo: string;
  homeScore: number;
  awayScore: number;
  isWalkover: boolean;
  couldNotDeduceClub: boolean; // Debug flag when we can't determine player teams
  resultCode: number | null; // Original result code for special display (e.g., adjudicated)
  whiteIsHome: boolean; // Whether white player is on home team
}

/**
 * Parse a date string to Unix timestamp in milliseconds
 * Handles both numeric timestamp strings and ISO date strings
 */
function parseDateToTimestamp(dateStr: string): number {
  // Try parsing as number first (timestamp string)
  const asNumber = Number(dateStr);
  if (!isNaN(asNumber) && asNumber > 0) {
    return asNumber;
  }
  // Fall back to Date parsing (ISO string or other formats)
  return new Date(dateStr).getTime();
}

/**
 * Format a date string for compact display (e.g., "26-01-15" or "1/15/26" depending on locale)
 */
function formatRoundDate(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const timestamp = parseDateToTimestamp(dateStr);
  if (isNaN(timestamp) || timestamp <= 0) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: '2-digit' });
}

export function TeamRoundResults({
  roundResults,
  getClubName,
  getPlayerName,
  getPlayerElo,
  tournamentId,
  groupId,
  fetchPlayersByDate,
  getPlayerEloByDate
}: TeamRoundResultsProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [expandedMatchIndex, setExpandedMatchIndex] = useState<number | null>(null);

  // Group round results by round number and then by match (homeId, homeTeamNumber, awayId, awayTeamNumber)
  // Team numbers are important because the same two clubs can have multiple teams playing each other
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, TeamMatch[]> = {};

    roundResults.forEach(result => {
      const round = result.roundNr || 1;
      if (!grouped[round]) grouped[round] = [];

      // Include team numbers in match key - clubs can have multiple teams (e.g., Rockaden 1, Rockaden 2)
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

      // Add board result to match
      match.boards.push(result);
      match.homeScore += result.homeResult || 0;
      match.awayScore += result.awayResult || 0;
    });

    return grouped;
  }, [roundResults]);

  // Create team name formatter that adds Roman numerals for multi-team clubs
  const formatTeamDisplayName = useMemo(
    () => createRoundResultsTeamNameFormatter(roundResults, getClubName),
    [roundResults, getClubName]
  );

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  // Set default selected round to the last round with any results
  if (selectedRound === null && rounds.length > 0) {
    // A round is "played" if at least one match has a non-zero score
    const isRoundPlayed = (roundNumber: number): boolean => {
      const matches = matchesByRound[roundNumber] || [];
      return matches.some(m => m.homeScore !== 0 || m.awayScore !== 0);
    };

    // Find last round with any results (scan backwards)
    const lastPlayedRound = [...rounds].reverse().find(r => isRoundPlayed(r));

    if (lastPlayedRound !== undefined) {
      // Show the last round with results
      setSelectedRound(lastPlayedRound);
    } else {
      // No rounds have been played yet - show Round 1
      setSelectedRound(rounds[0]);
    }
  }

  // Fetch historical ELO data when a match is expanded
  useEffect(() => {
    if (expandedMatchIndex === null || !selectedRound || !fetchPlayersByDate) return;

    const selectedMatches = matchesByRound[selectedRound] || [];
    const match = selectedMatches[expandedMatchIndex];
    if (!match) return;

    // Get all games from this match
    const allGames = match.boards[0]?.games || [];
    if (allGames.length === 0) return;

    // Parse match date to timestamp and normalize for ELO lookup
    // (falls back to current month if match date is in the future)
    const matchDate = parseDateToTimestamp(match.date);
    if (isNaN(matchDate) || matchDate <= 0) return;
    const lookupDate = normalizeEloLookupDate(matchDate);

    // Collect all player IDs from the games
    const requests: PlayerDateRequest[] = [];
    allGames.forEach(game => {
      if (!isWalkoverPlayer(game.whiteId)) {
        requests.push({ playerId: game.whiteId, date: lookupDate });
      }
      if (!isWalkoverPlayer(game.blackId)) {
        requests.push({ playerId: game.blackId, date: lookupDate });
      }
    });

    if (requests.length === 0) return;

    // Fetch historical player data (fire and forget - cache will update)
    fetchPlayersByDate(requests);
  }, [expandedMatchIndex, selectedRound, matchesByRound, fetchPlayersByDate]);

  if (rounds.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 dark:text-gray-400">
          {t.pages.tournamentResults.roundByRound.noResults}
        </div>
      </div>
    );
  }

  const selectedMatches = selectedRound ? matchesByRound[selectedRound] : [];

  // Toggle match expansion
  const handleMatchClick = (index: number) => {
    setExpandedMatchIndex(expandedMatchIndex === index ? null : index);
  };

  // Process a game to determine home/away players and calculate result
  // matchDate parameter enables historical player data lookup (club ID, ELO)
  const processGame = (game: GameDto, homeClubId: number, awayClubId: number, matchDate: number): DisplayGame => {
    // Determine if white player is on home team using table number
    // In team chess: away team has white on board 1 (table 0), colors alternate by board
    // Even tables (0, 2, 4...): away team plays white (home plays black)
    // Odd tables (1, 3, 5...): home team plays white
    const tableNr = game.tableNr ?? 0;
    const whiteIsHome = tableNr % 2 === 1;
    const couldNotDeduceClub = false;

    // Handle W.O (walkover) cases
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

    // Use historical ELO if date is provided and function is available, otherwise fall back to current ELO
    const getElo = (playerId: number): string => {
      if (isWalkoverPlayer(playerId)) return '-';
      if (matchDate && getPlayerEloByDate) {
        return getPlayerEloByDate(playerId, matchDate);
      }
      return getPlayerElo(playerId);
    };

    return {
      boardNumber: (game.tableNr !== undefined ? game.tableNr + 1 : 0),
      homePlayerId,
      homePlayerElo: getElo(homePlayerId),
      awayPlayerId,
      awayPlayerElo: getElo(awayPlayerId),
      homeScore,
      awayScore,
      isWalkover,
      couldNotDeduceClub,
      resultCode: game.result ?? null,
      whiteIsHome
    };
  };

  // Format game result for display
  // Handles special result codes like adjudicated 0-0, walkovers, etc.
  const formatGameResult = (game: DisplayGame): string => {
    const { homeScore, awayScore, isWalkover, resultCode } = game;

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

    // Build result string from home team's perspective
    const scoreStr = `${formatScore(homeScore)} - ${formatScore(awayScore)}`;

    if (isWalkover) {
      return `${scoreStr} w.o`;
    } else if (isAdjudicated) {
      return `${scoreStr} adj`;
    }

    return scoreStr;
  };

  return (
    <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
          {t.pages.tournamentResults.roundByRound.title}
        </h3>
      </div>

      {/* Round Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {rounds.map(roundNumber => {
          // Get round date from first match in round
          // TODO: Add roundsMap fallback for unplayed rounds (like individual tournaments in page.tsx)
          const firstMatch = matchesByRound[roundNumber]?.[0];
          const roundDate = firstMatch?.date ? formatRoundDate(firstMatch.date, language) : '';

          return (
            <button
              key={roundNumber}
              onClick={() => {
                setSelectedRound(roundNumber);
                setExpandedMatchIndex(null); // Collapse when changing rounds
              }}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRound === roundNumber
                  ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div>{t.pages.tournamentResults.roundByRound.round} {roundNumber}</div>
              {roundDate && (
                <div className={`text-xs ${
                  selectedRound === roundNumber
                    ? 'text-blue-500 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {roundDate}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Round Content */}
      <div className="p-4 md:p-6">
        <div className="space-y-2">
          {selectedMatches.map((match, index) => (
            <div key={index} className="overflow-hidden">
              {/* Match Header - Clickable */}
              <button
                onClick={() => handleMatchClick(index)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {isWalkoverClub(match.homeId) ? 'W.O' : formatTeamDisplayName(match.homeId, match.homeTeamNumber)}
                    </span>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">-</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {isWalkoverClub(match.awayId) ? 'W.O' : formatTeamDisplayName(match.awayId, match.awayTeamNumber)}
                    </span>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {match.homeScore === 0 && match.awayScore === 0 ? '-' : `${match.homeScore} - ${match.awayScore}`}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedMatchIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Board Games */}
              {expandedMatchIndex === index && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="p-4">
                    {(() => {
                      // Get all games from this match
                      const allGames = match.boards[0]?.games || [];

                      // Parse match date for historical ELO lookup
                      // Normalize to handle future dates (falls back to current month)
                      const rawMatchDate = parseDateToTimestamp(match.date);
                      const normalizedDate = !isNaN(rawMatchDate) && rawMatchDate > 0
                        ? normalizeEloLookupDate(rawMatchDate)
                        : normalizeEloLookupDate(Date.now());

                      // Process games to ensure home team is always in left column
                      // Pass normalized date to enable historical ELO lookup
                      const processedGames = allGames.map(game =>
                        processGame(game, match.homeId, match.awayId, normalizedDate)
                      );

                      // Sort by board number
                      const sortedGames = [...processedGames].sort((a, b) => a.boardNumber - b.boardNumber);

                      // Get team names for headers (use W.O for walkover clubs, include Roman numeral for multi-team clubs)
                      const homeClubName = isWalkoverClub(match.homeId) ? 'W.O' : formatTeamDisplayName(match.homeId, match.homeTeamNumber);
                      const awayClubName = isWalkoverClub(match.awayId) ? 'W.O' : formatTeamDisplayName(match.awayId, match.awayTeamNumber);

                      // Create columns for board games table
                      const boardColumns: TableColumn<DisplayGame>[] = [
                        {
                          id: 'board',
                          header: t.pages.tournamentResults.teamRoundResults.board,
                          accessor: (game) => game.boardNumber || '-',
                          align: 'left',
                          noWrap: true
                        },
                        {
                          id: 'homePlayer',
                          header: homeClubName,
                          headerClassName: 'max-w-[10ch] sm:max-w-none truncate',
                          accessor: (game) => {
                            if (isWalkoverPlayer(game.homePlayerId)) {
                              return <span className="text-gray-500 dark:text-gray-400">W.O</span>;
                            }
                            return (
                              <Link
                                href={`/results/${tournamentId}/${groupId}/${game.homePlayerId}`}
                                color="gray"
                              >
                                {getPlayerName(game.homePlayerId, normalizedDate)}
                              </Link>
                            );
                          },
                          align: 'left'
                        },
                        {
                          id: 'homeElo',
                          header: t.pages.tournamentResults.teamRoundResults.elo,
                          accessor: (game) => game.homePlayerElo,
                          align: 'center',
                          noWrap: true
                        },
                        {
                          id: 'awayPlayer',
                          header: awayClubName,
                          headerClassName: 'max-w-[10ch] sm:max-w-none truncate',
                          accessor: (game) => {
                            if (isWalkoverPlayer(game.awayPlayerId)) {
                              return <span className="text-gray-500 dark:text-gray-400">W.O</span>;
                            }
                            return (
                              <Link
                                href={`/results/${tournamentId}/${groupId}/${game.awayPlayerId}`}
                                color="gray"
                              >
                                {getPlayerName(game.awayPlayerId, normalizedDate)}
                              </Link>
                            );
                          },
                          align: 'left'
                        },
                        {
                          id: 'awayElo',
                          header: t.pages.tournamentResults.teamRoundResults.elo,
                          accessor: (game) => game.awayPlayerElo,
                          align: 'center',
                          noWrap: true
                        },
                        {
                          id: 'result',
                          header: t.pages.tournamentResults.teamRoundResults.result,
                          accessor: (game) => formatGameResult(game),
                          align: 'center',
                          noWrap: true,
                          cellStyle: { fontWeight: 'medium' }
                        }
                      ];

                      return (
                        <Table
                          data={sortedGames}
                          columns={boardColumns}
                          getRowKey={(game, index) => `${game.boardNumber}-${index}`}
                          density="compact"
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamRoundResults;