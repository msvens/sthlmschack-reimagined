'use client';

import React, { useState, useMemo } from 'react';
import { TournamentRoundResultDto, GameDto } from '@/lib/api/types';
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
  homeScore: number;
  awayScore: number;
  date: string;
  finalized: boolean;
  boards: TournamentRoundResultDto[]; // All board results for this match
}

export function TeamRoundResults({
  roundResults,
  getClubName,
  getPlayerName,
  getPlayerElo,
  tournamentId,
  groupId
}: TeamRoundResultsProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [expandedMatchIndex, setExpandedMatchIndex] = useState<number | null>(null);

  // Group round results by round number and then by match (homeId, awayId)
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, TeamMatch[]> = {};

    roundResults.forEach(result => {
      const round = result.roundNr || 1;
      if (!grouped[round]) grouped[round] = [];

      // Find existing match or create new one
      const matchKey = `${result.homeId}-${result.awayId}`;
      let match = grouped[round].find(m => `${m.homeId}-${m.awayId}` === matchKey);

      if (!match) {
        match = {
          roundNr: round,
          homeId: result.homeId,
          awayId: result.awayId,
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

  // Get game result display
  const getGameResult = (result: number): string => {
    if (result === 1) return '1 - 0';
    if (result === 0) return '½ - ½';
    if (result === -1) return '0 - 1';
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
            <div key={index} className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
              {/* Match Header - Clickable */}
              <button
                onClick={() => handleMatchClick(index)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {getClubName(match.homeId)}
                    </span>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">-</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {getClubName(match.awayId)}
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
                      // Get all games from this match (match.boards[0] contains the TournamentRoundResultDto)
                      const allGames = match.boards[0]?.games || [];

                      // Create columns for board games table
                      const boardColumns: TableColumn<GameDto>[] = [
                        {
                          id: 'board',
                          header: t.pages.tournamentResults.teamRoundResults.board,
                          accessor: (game) => game.tableNr !== undefined ? game.tableNr + 1 : '-',
                          align: 'left',
                          noWrap: true
                        },
                        {
                          id: 'homePlayer',
                          header: t.pages.tournamentResults.teamRoundResults.homeTeam,
                          accessor: (game) => (
                            <Link
                              href={`/results/${tournamentId}/${groupId}/${game.whiteId}`}
                              color="gray"
                            >
                              {getPlayerName(game.whiteId)}
                            </Link>
                          ),
                          align: 'left'
                        },
                        {
                          id: 'homeElo',
                          header: t.pages.tournamentResults.teamRoundResults.elo,
                          accessor: (game) => getPlayerElo(game.whiteId),
                          align: 'center',
                          noWrap: true
                        },
                        {
                          id: 'awayPlayer',
                          header: t.pages.tournamentResults.teamRoundResults.awayTeam,
                          accessor: (game) => (
                            <Link
                              href={`/results/${tournamentId}/${groupId}/${game.blackId}`}
                              color="gray"
                            >
                              {getPlayerName(game.blackId)}
                            </Link>
                          ),
                          align: 'left'
                        },
                        {
                          id: 'awayElo',
                          header: t.pages.tournamentResults.teamRoundResults.elo,
                          accessor: (game) => getPlayerElo(game.blackId),
                          align: 'center',
                          noWrap: true
                        },
                        {
                          id: 'result',
                          header: t.pages.tournamentResults.teamRoundResults.result,
                          accessor: (game) => getGameResult(game.result),
                          align: 'center',
                          noWrap: true,
                          cellStyle: { fontWeight: 'medium' }
                        }
                      ];

                      // Sort games by table number
                      const sortedGames = [...allGames].sort((a, b) => (a.tableNr || 0) - (b.tableNr || 0));

                      return (
                        <Table
                          data={sortedGames}
                          columns={boardColumns}
                          getRowKey={(game) => game.id.toString()}
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