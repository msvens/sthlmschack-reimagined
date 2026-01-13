'use client';

// TODO: Verify rating algorithm implementation against schack.se's actual code
// Current implementation is based on constant names and educated guesses
// Waiting for official implementation details from schack.se

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { EloRatingChart, RatingDataPoint } from '@/components/player/EloRatingChart';
import { Table, TableColumn } from '@/components/Table';
import { Link } from '@/components/Link';
import { PlayerService, TournamentService, getPlayerRatingHistory, formatRatingWithType, getPlayerRatingByAlgorithm, getKFactorForRating, calculateRatingChange, calculateTournamentStats } from '@/lib/api';
import { PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults } from '@/context/GroupResultsContext';

interface PlayerMatch {
  round: number;
  opponent: PlayerInfoDto;
  result: 'win' | 'draw' | 'loss';
  color: 'white' | 'black';
  homeResult: number;
  awayResult: number;
}

export default function TournamentPlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get group-level data from context
  const { isTeamTournament, individualRoundResults, teamRoundResults, playerMap, groupName, groupStartDate, groupEndDate, rankingAlgorithm, loading: resultsLoading } = useGroupResults();

  const [player, setPlayer] = useState<PlayerInfoDto | null>(null); // Current player info for display
  const [tournamentPlayer, setTournamentPlayer] = useState<PlayerInfoDto | null>(null); // Historical player info for calculations
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rating history state
  const [ratingHistory, setRatingHistory] = useState<RatingDataPoint[]>([]);
  const [ratingHistoryLoading, setRatingHistoryLoading] = useState(false);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;
  const memberId = params.memberId ? parseInt(params.memberId as string) : null;

  // Fetch player and tournament info, and extract player's matches from context data
  useEffect(() => {
    if (!tournamentId || !memberId || !groupId || isNaN(tournamentId) || isNaN(memberId) || isNaN(groupId)) {
      setError('Invalid tournament, group, or member ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch player info and tournament info in parallel
        const playerService = new PlayerService();
        const tournamentService = new TournamentService();

        const [playerResponse, tournamentResponse] = await Promise.all([
          playerService.getPlayerInfo(memberId),
          tournamentService.getTournament(tournamentId)
        ]);

        if (playerResponse.status !== 200 || !playerResponse.data) {
          throw new Error('Failed to fetch player data');
        }

        if (tournamentResponse.status !== 200 || !tournamentResponse.data) {
          throw new Error('Failed to fetch tournament data');
        }

        setPlayer(playerResponse.data);
        setTournament(tournamentResponse.data);

      } catch (err) {
        setError('Failed to load tournament player data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, memberId, groupId]);

  // Get historical tournament player info from playerMap
  useEffect(() => {
    if (!memberId || !playerMap || resultsLoading) {
      return;
    }

    const historicalPlayer = playerMap.get(memberId);
    if (historicalPlayer) {
      setTournamentPlayer(historicalPlayer);
    }
  }, [memberId, playerMap, resultsLoading]);

  // Extract player's matches from context round results once available
  useEffect(() => {
    if (!memberId || !tournamentPlayer || resultsLoading) {
      return;
    }

    const playerMatches: PlayerMatch[] = [];

    if (isTeamTournament) {
      // Team tournament: extract games from teamRoundResults
      if (teamRoundResults.length === 0) return;

      for (const roundResult of teamRoundResults) {
        // Look through all games in this round result
        roundResult.games?.forEach(game => {
          if (game.whiteId === memberId || game.blackId === memberId) {
            const isWhite = game.whiteId === memberId;
            const opponentId = isWhite ? game.blackId : game.whiteId;

            // Get opponent info from playerMap
            const opponent = playerMap.get(opponentId);
            if (opponent) {
              // Determine result based on game.result and player color
              let result: 'win' | 'draw' | 'loss';
              let homeResult: number;
              let awayResult: number;

              if (game.result === 0) {
                // Draw
                result = 'draw';
                homeResult = 0.5;
                awayResult = 0.5;
              } else if (game.result === 1) {
                // White wins
                result = isWhite ? 'win' : 'loss';
                homeResult = 1;
                awayResult = 0;
              } else {
                // Black wins (result === -1)
                result = isWhite ? 'loss' : 'win';
                homeResult = 0;
                awayResult = 1;
              }

              playerMatches.push({
                round: roundResult.roundNr,
                opponent,
                result,
                color: isWhite ? 'white' : 'black',
                homeResult,
                awayResult
              });
            }
          }
        });
      }
    } else {
      // Individual tournament: use existing logic
      if (individualRoundResults.length === 0) return;

      for (const roundResult of individualRoundResults) {
        if (roundResult.homeId === memberId || roundResult.awayId === memberId) {
          const isHome = roundResult.homeId === memberId;
          const opponentId = isHome ? roundResult.awayId : roundResult.homeId;
          const playerResult = isHome ? roundResult.homeResult : roundResult.awayResult;

          // Get opponent info from playerMap
          const opponent = playerMap.get(opponentId);
          if (opponent) {
            // Determine result
            let result: 'win' | 'draw' | 'loss';
            if (playerResult === 1) {
              result = 'win';
            } else if (playerResult === 0.5) {
              result = 'draw';
            } else {
              result = 'loss';
            }

            playerMatches.push({
              round: roundResult.roundNr,
              opponent,
              result,
              color: isHome ? 'white' : 'black',
              homeResult: roundResult.homeResult,
              awayResult: roundResult.awayResult
            });
          }
        }
      }
    }

    // Sort by round number
    playerMatches.sort((a, b) => a.round - b.round);

    setMatches(playerMatches);
  }, [memberId, tournamentPlayer, isTeamTournament, individualRoundResults, teamRoundResults, playerMap, resultsLoading]);

  // Fetch tournament history and rating history after player data is loaded
  useEffect(() => {
    if (!player || !memberId) return;

    const fetchRatingHistory = async () => {
      try {
        setRatingHistoryLoading(true);

        const response = await getPlayerRatingHistory(memberId, 12);

        if (response.status === 200 && response.data) {
          setRatingHistory(response.data);
        }
      } catch (err) {
        console.error('Error fetching rating history:', err);
      } finally {
        setRatingHistoryLoading(false);
      }
    };

    // Fetch rating history
    fetchRatingHistory();
  }, [player, memberId]);

  if (loading) {
    return (
      <PageLayout maxWidth="3xl">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.loading}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !player || !tournament) {
    return (
      <PageLayout maxWidth="3xl">
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
              Error
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              {error || 'Failed to load player data'}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              {t.pages.playerDetail.backButton}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Helper function for date formatting
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateRange = (start: string, end: string): string => {
    if (start === end) {
      return formatDate(start);
    }
    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);
    return `${startFormatted} - ${endFormatted}`;
  };

  // Define columns for player matches table
  const matchColumns: TableColumn<PlayerMatch>[] = [
    {
      id: 'round',
      header: t.pages.tournamentResults.roundByRound.round,
      accessor: (row) => row.round,
      align: 'left',
      noWrap: true
    },
    {
      id: 'white',
      header: t.pages.tournamentResults.roundByRound.white,
      accessor: (row) => {
        const isPlayerWhite = row.color === 'white';
        const whitePlayer = isPlayerWhite ? player : row.opponent;
        return isPlayerWhite ? (
          `${whitePlayer.firstName} ${whitePlayer.lastName}`
        ) : (
          <Link href={`/results/${tournamentId}/${groupId}/${row.opponent.id}`} color="gray">
            {whitePlayer.firstName} {whitePlayer.lastName}
          </Link>
        );
      },
      align: 'left'
    },
    {
      id: 'whiteElo',
      header: t.pages.tournamentResults.roundByRound.elo,
      accessor: (row) => {
        const whitePlayerElo = row.color === 'white' ? tournamentPlayer?.elo : row.opponent.elo;
        const { rating, ratingType } = getPlayerRatingByAlgorithm(whitePlayerElo, rankingAlgorithm);
        return formatRatingWithType(rating, ratingType, language);
      },
      align: 'center',
      noWrap: true
    },
    {
      id: 'black',
      header: t.pages.tournamentResults.roundByRound.black,
      accessor: (row) => {
        const isPlayerBlack = row.color === 'black';
        const blackPlayer = isPlayerBlack ? player : row.opponent;
        return isPlayerBlack ? (
          `${blackPlayer.firstName} ${blackPlayer.lastName}`
        ) : (
          <Link href={`/results/${tournamentId}/${groupId}/${row.opponent.id}`} color="gray">
            {blackPlayer.firstName} {blackPlayer.lastName}
          </Link>
        );
      },
      align: 'left'
    },
    {
      id: 'blackElo',
      header: t.pages.tournamentResults.roundByRound.elo,
      accessor: (row) => {
        const blackPlayerElo = row.color === 'black' ? tournamentPlayer?.elo : row.opponent.elo;
        const { rating, ratingType } = getPlayerRatingByAlgorithm(blackPlayerElo, rankingAlgorithm);
        return formatRatingWithType(rating, ratingType, language);
      },
      align: 'center',
      noWrap: true
    },
    {
      id: 'result',
      header: t.pages.tournamentResults.roundByRound.result,
      accessor: (row) => `${row.homeResult} - ${row.awayResult}`,
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' }
    },
    {
      id: 'eloChange',
      header: t.common.eloLabels.eloChange,
      accessor: (row) => {
        if (!tournamentPlayer) return '-';

        // Get appropriate ratings based on group's ranking algorithm
        const { rating: playerRating, ratingType } = getPlayerRatingByAlgorithm(tournamentPlayer.elo, rankingAlgorithm);
        const { rating: opponentRating } = getPlayerRatingByAlgorithm(row.opponent.elo, rankingAlgorithm);

        // Can't calculate if either player has no rating
        if (!playerRating || !opponentRating) {
          return '-';
        }

        // Get K-factor based on rating type (rapid/blitz use K=40, standard uses K=20)
        const kFactor = getKFactorForRating(ratingType, playerRating, tournamentPlayer.elo);

        // Calculate rating change
        const actualScore = row.result === 'win' ? 1.0 : row.result === 'draw' ? 0.5 : 0.0;
        const change = calculateRatingChange(playerRating, opponentRating, actualScore, kFactor);

        // Format with + or - sign
        return change > 0 ? `+${change}` : String(change);
      },
      align: 'center',
      noWrap: true
    }
  ];

  return (
    <PageLayout maxWidth="3xl">
      {/* Tournament Context */}
      <div className="mb-6">
        <Link
          href={`/results/${tournamentId}/${groupId}`}
          color="blue"
        >
          <span className="text-lg font-medium">{tournament.name}</span>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {groupName && <>{groupName}, </>}
          {groupStartDate && groupEndDate && formatDateRange(groupStartDate, groupEndDate)}
        </p>
      </div>

      {/* Player Matches in This Tournament */}
      {resultsLoading ? (
        <div className="mb-8 text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.loadingMatches}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
            {player.firstName} {player.lastName} - {t.pages.playerDetail.matches}
          </h2>
          <Table
            data={matches}
            columns={matchColumns}
            getRowKey={(row) => `${row.round}-${row.opponent.id}`}
            emptyMessage={t.pages.playerDetail.noMatchesFound}
          />

          {/* Tournament Summary */}
          {matches.length > 0 && (() => {
            // Calculate actual score (sum of points)
            const totalScore = matches.reduce((sum, match) => {
              const score = match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0;
              return sum + score;
            }, 0);

            // Try to calculate ELO statistics if player has rating
            let eloChange: string = '-';
            let performanceRating: string = '-';

            if (tournamentPlayer?.elo) {
              const { rating: playerRating, ratingType } = getPlayerRatingByAlgorithm(tournamentPlayer.elo, rankingAlgorithm);

              if (playerRating) {
                // Get K-factor based on rating type (rapid/blitz use K=40, standard uses K=20)
                const kFactor = getKFactorForRating(ratingType, playerRating, tournamentPlayer.elo);

                const matchResults = matches.map(match => ({
                  opponentRating: getPlayerRatingByAlgorithm(match.opponent.elo, rankingAlgorithm).rating,
                  actualScore: match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0
                }));

                const stats = calculateTournamentStats(matchResults, playerRating, kFactor);

                if (stats.gamesWithRatedOpponents > 0) {
                  eloChange = stats.totalChange > 0 ? `+${stats.totalChange}` : String(stats.totalChange);
                  performanceRating = String(stats.performanceRating);
                }
              }
            }

            return (
              <div className="mt-3 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.pages.playerDetail.total}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {totalScore} {t.pages.playerDetail.of} {matches.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.eloChange}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {eloChange}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.performanceRating}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {performanceRating}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Player Info - Compact, No Borders */}
      <div className="mb-6">
        <PlayerInfo
          player={player}
          t={t.pages.playerDetail}
        />
      </div>

      {/* ELO Rating History Chart */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
          {t.common.eloLabels.ratingHistory}
        </h2>
        {ratingHistoryLoading ? (
          <div className="flex items-center justify-center h-96 text-gray-600 dark:text-gray-400">
            {t.common.eloLabels.loadingHistory}
          </div>
        ) : (
          <EloRatingChart
            data={ratingHistory}
            labels={{
              standard: t.common.eloLabels.standard,
              rapid: t.common.eloLabels.rapid,
              blitz: t.common.eloLabels.blitz,
              lask: t.common.eloLabels.lask
            }}
          />
        )}
      </div>
      <div className="mt-4 text-center">
        <Link
            href={`/players/${memberId}`}
            color="blue"
            className="text-sm font-medium"
        >
          {t.pages.playerDetail.viewFullProfile}
        </Link>
      </div>

    </PageLayout>
  );
}
