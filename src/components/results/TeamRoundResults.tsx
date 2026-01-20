'use client';

import React, { useState, useMemo } from 'react';
import { TournamentRoundResultDto, GameDto } from '@/lib/api/types';
import { isWalkoverPlayer, isWalkoverClub, createRoundResultsTeamNameFormatter } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';

export interface TeamRoundResultsProps {
  /** Team round results data */
  roundResults: TournamentRoundResultDto[];
  /** Function to get club name from club ID */
  getClubName: (clubId: number) => string;
  /** Function to get player name from player ID */
  getPlayerName: (playerId: number) => string;
  /** Function to get player ELO from player ID */
  getPlayerElo: (playerId: number) => string;
  /** Function to get player club ID from player ID */
  getPlayerClubId: (playerId: number) => number | null;
  /** Tournament ID for player links */
  tournamentId: number;
  /** Group ID for player links */
  groupId: number;
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
}

export function TeamRoundResults({
  roundResults,
  getClubName,
  getPlayerName,
  getPlayerElo,
  getPlayerClubId,
  tournamentId,
  groupId
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

  // Set default selected round if not set
  if (selectedRound === null && rounds.length > 0) {
    setSelectedRound(rounds[0]);
  }

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
  const processGame = (game: GameDto, homeClubId: number, awayClubId: number): DisplayGame => {
    // Step 1: Pull the club from each player
    const whiteClubId = getPlayerClubId(game.whiteId);
    const blackClubId = getPlayerClubId(game.blackId);

    // Determine if white player is on home team or away team
    // Strategy: Check which player's club actually matches either home or away team
    // Players might be playing for a different club than their registered main club
    let whiteIsHome: boolean;
    let couldNotDeduceClub = false;

    if (isWalkoverPlayer(game.whiteId)) {
      // White is W.O, so use black's club - if black is home, white must be away (and vice versa)
      if (blackClubId === homeClubId) {
        whiteIsHome = false; // Black is home, so W.O is away
      } else if (blackClubId === awayClubId) {
        whiteIsHome = true; // Black is away, so W.O is home
      } else {
        // Black's club doesn't match either team - shouldn't happen often
        whiteIsHome = blackClubId !== homeClubId;
        couldNotDeduceClub = true;
      }
    } else if (isWalkoverPlayer(game.blackId)) {
      // Black is W.O, so use white's club
      if (whiteClubId === homeClubId) {
        whiteIsHome = true; // White is home, so W.O is away
      } else if (whiteClubId === awayClubId) {
        whiteIsHome = false; // White is away, so W.O is home
      } else {
        // White's club doesn't match either team
        whiteIsHome = whiteClubId === homeClubId;
        couldNotDeduceClub = true;
      }
    } else {
      // Step 2: Check if player1 (white) has either home or away team as their club
      if (whiteClubId === homeClubId) {
        whiteIsHome = true;
      } else if (whiteClubId === awayClubId) {
        whiteIsHome = false;
      // Step 3: If not, check player2 (black) has either home or away team as their club
      } else if (blackClubId === homeClubId) {
        whiteIsHome = false; // Black is home, so white is away
      } else if (blackClubId === awayClubId) {
        whiteIsHome = true; // Black is away, so white is home
      } else {
        // Step 4: Neither player's registered club matches the teams playing
        // This is the problematic case - mark for debugging
        couldNotDeduceClub = true;
        // Fall back to color-based assignment (white=home)
        whiteIsHome = true;
        console.warn(`Could not deduce club assignment for game: white=${game.whiteId} (club=${whiteClubId}), black=${game.blackId} (club=${blackClubId}), match: ${homeClubId} vs ${awayClubId}`);
      }
    }

    // Handle W.O (walkover) cases
    // result === 2: white wins on W.O
    // result === -2: black wins on W.O
    // playerId === -1: the missing player
    const isWalkover = Math.abs(game.result) === 2 || isWalkoverPlayer(game.whiteId) || isWalkoverPlayer(game.blackId);

    let homePlayerId: number;
    let awayPlayerId: number;
    let homeScore: number;
    let awayScore: number;

    if (whiteIsHome) {
      // White is home team
      homePlayerId = game.whiteId;
      awayPlayerId = game.blackId;

      // Calculate scores based on result
      if (game.result === 2) {
        // White wins on W.O
        homeScore = 1;
        awayScore = 0;
      } else if (game.result === -2) {
        // Black wins on W.O
        homeScore = 0;
        awayScore = 1;
      } else if (game.result === 1) {
        // White wins
        homeScore = 1;
        awayScore = 0;
      } else if (game.result === -1) {
        // Black wins
        homeScore = 0;
        awayScore = 1;
      } else {
        // Draw
        homeScore = 0.5;
        awayScore = 0.5;
      }
    } else {
      // Black is home team (need to flip)
      homePlayerId = game.blackId;
      awayPlayerId = game.whiteId;

      // Calculate scores based on result (flipped perspective)
      if (game.result === 2) {
        // White wins on W.O (away team wins)
        homeScore = 0;
        awayScore = 1;
      } else if (game.result === -2) {
        // Black wins on W.O (home team wins)
        homeScore = 1;
        awayScore = 0;
      } else if (game.result === 1) {
        // White wins (away team wins)
        homeScore = 0;
        awayScore = 1;
      } else if (game.result === -1) {
        // Black wins (home team wins)
        homeScore = 1;
        awayScore = 0;
      } else {
        // Draw
        homeScore = 0.5;
        awayScore = 0.5;
      }
    }

    return {
      boardNumber: (game.tableNr !== undefined ? game.tableNr + 1 : 0),
      homePlayerId,
      homePlayerElo: isWalkoverPlayer(homePlayerId) ? '-' : getPlayerElo(homePlayerId),
      awayPlayerId,
      awayPlayerElo: isWalkoverPlayer(awayPlayerId) ? '-' : getPlayerElo(awayPlayerId),
      homeScore,
      awayScore,
      isWalkover,
      couldNotDeduceClub
    };
  };

  // Format game result for display
  const formatGameResult = (game: DisplayGame): string => {
    if (game.homeScore === 1 && game.awayScore === 0) {
      return game.isWalkover ? '1 - 0 w.o' : '1 - 0';
    } else if (game.homeScore === 0 && game.awayScore === 1) {
      return game.isWalkover ? '0 - 1 w.o' : '0 - 1';
    } else if (game.homeScore === 0.5 && game.awayScore === 0.5) {
      return '½ - ½';
    }
    return '-';
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
        {rounds.map(roundNumber => (
          <button
            key={roundNumber}
            onClick={() => {
              setSelectedRound(roundNumber);
              setExpandedMatchIndex(null); // Collapse when changing rounds
            }}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedRound === roundNumber
                ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t.pages.tournamentResults.roundByRound.round} {roundNumber}
          </button>
        ))}
      </div>

      {/* Selected Round Content */}
      <div className="p-4 md:p-6">
        <div className="space-y-2">
          {selectedMatches.map((match, index) => (
            <div key={index} className="overflow-hidden">
              {/* Match Header - Clickable */}
              <button
                onClick={() => handleMatchClick(index)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
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
                  <div className="ml-4 flex items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
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

                      // Process games to ensure home team is always in left column
                      const processedGames = allGames.map(game =>
                        processGame(game, match.homeId, match.awayId)
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
                                {getPlayerName(game.homePlayerId)}
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
                                {getPlayerName(game.awayPlayerId)}
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