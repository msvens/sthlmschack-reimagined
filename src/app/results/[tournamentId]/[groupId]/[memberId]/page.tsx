'use client';

// TODO: Verify rating algorithm implementation against schack.se's actual code
// Current implementation is based on constant names and educated guesses
// Waiting for official implementation details from schack.se

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { EloRatingChart } from '@/components/player/EloRatingChart';
import { Table, TableColumn } from '@/components/Table';
import { Link } from '@/components/Link';
import { PlayerService, TournamentService, formatRatingWithType, getPlayerRatingByAlgorithm, getKFactorForRating, calculateRatingChange, isWalkoverResultCode, getResultDisplayString } from '@/lib/api';
import { PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults } from '@/context/GroupResultsContext';

interface PlayerMatch {
  round: number;
  roundDate: number; // Unix timestamp for historical ELO lookup
  opponent: PlayerInfoDto;
  result: 'win' | 'draw' | 'loss';
  color: 'white' | 'black';
  homeResult: number;
  awayResult: number;
  isWalkover: boolean;
  gameResultCode?: number; // Original result code from games array
}

export default function TournamentPlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get group-level data from context
  const {
    isTeamTournament,
    individualRoundResults,
    teamRoundResults,
    playerMap,
    groupName,
    groupStartDate,
    groupEndDate,
    rankingAlgorithm,
    loading: resultsLoading,
    fetchPlayersByDate,
    getPlayerByDate
  } = useGroupResults();

  const [player, setPlayer] = useState<PlayerInfoDto | null>(null); // Current player info for display
  const [tournamentPlayer, setTournamentPlayer] = useState<PlayerInfoDto | null>(null); // Historical player info for calculations
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rating history loading tracked by EloRatingChart internally

  // Track when historical player data has been fetched (for team tournaments)
  const [historicalDataFetched, setHistoricalDataFetched] = useState(false);

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

  // Get historical tournament player info
  useEffect(() => {
    if (!memberId || resultsLoading || !historicalDataFetched) {
      return;
    }

    // For both tournament types, get player from historical data using group start date
    if (groupStartDate) {
      const startDate = new Date(groupStartDate).getTime();
      const historicalPlayer = getPlayerByDate(memberId, startDate);
      if (historicalPlayer) {
        setTournamentPlayer(historicalPlayer);
        return;
      }
    }

    // Fallback to playerMap if historical data not available
    const fallbackPlayer = playerMap.get(memberId);
    if (fallbackPlayer) {
      setTournamentPlayer(fallbackPlayer);
    }
  }, [memberId, playerMap, resultsLoading, historicalDataFetched, groupStartDate, getPlayerByDate]);

  // Fetch historical player data for the player and all opponents
  // This applies to both team tournaments and multi-month individual tournaments
  useEffect(() => {
    if (!memberId || resultsLoading) {
      return;
    }

    // Collect all (playerId, roundDate) pairs needed
    const requests: { playerId: number; date: number }[] = [];

    if (isTeamTournament) {
      // Team tournament: extract from teamRoundResults
      if (teamRoundResults.length === 0) return;

      for (const roundResult of teamRoundResults) {
        const roundDate = parseDateToTimestamp(roundResult.date);
        if (isNaN(roundDate) || roundDate <= 0) continue;

        roundResult.games?.forEach(game => {
          if (game.whiteId === memberId || game.blackId === memberId) {
            // Add the player at this round's date
            requests.push({ playerId: memberId, date: roundDate });

            // Add the opponent at this round's date
            const opponentId = game.whiteId === memberId ? game.blackId : game.whiteId;
            if (opponentId > 0) { // Skip walkover IDs
              requests.push({ playerId: opponentId, date: roundDate });
            }
          }
        });
      }
    } else {
      // Individual tournament: extract from individualRoundResults
      if (individualRoundResults.length === 0) return;

      for (const roundResult of individualRoundResults) {
        if (roundResult.homeId === memberId || roundResult.awayId === memberId) {
          const roundDate = parseDateToTimestamp(roundResult.date);
          if (isNaN(roundDate) || roundDate <= 0) continue;

          // Add the player at this round's date
          requests.push({ playerId: memberId, date: roundDate });

          // Add the opponent at this round's date
          const opponentId = roundResult.homeId === memberId ? roundResult.awayId : roundResult.homeId;
          if (opponentId > 0) { // Skip walkover IDs
            requests.push({ playerId: opponentId, date: roundDate });
          }
        }
      }
    }

    if (requests.length === 0) {
      setHistoricalDataFetched(true);
      return;
    }

    // Fetch all historical player data (function will skip already cached entries)
    fetchPlayersByDate(requests).then(() => {
      setHistoricalDataFetched(true);
    });
  }, [isTeamTournament, memberId, teamRoundResults, individualRoundResults, resultsLoading, fetchPlayersByDate]);

  // Helper to parse date string to timestamp
  function parseDateToTimestamp(dateStr: string): number {
    const asNumber = Number(dateStr);
    if (!isNaN(asNumber) && asNumber > 0) return asNumber;
    return new Date(dateStr).getTime();
  }

  // Extract player's matches from context round results once available
  useEffect(() => {
    if (!memberId || resultsLoading) {
      return;
    }

    // Wait for historical data to be fetched (applies to both tournament types)
    if (!historicalDataFetched) {
      return;
    }

    const playerMatches: PlayerMatch[] = [];

    if (isTeamTournament) {
      // Team tournament: extract games from teamRoundResults
      if (teamRoundResults.length === 0) return;

      for (const roundResult of teamRoundResults) {
        const roundDate = parseDateToTimestamp(roundResult.date);

        // Look through all games in this round result
        roundResult.games?.forEach(game => {
          if (game.whiteId === memberId || game.blackId === memberId) {
            const isWhite = game.whiteId === memberId;
            const opponentId = isWhite ? game.blackId : game.whiteId;

            // Get opponent info using historical date lookup
            const opponent = getPlayerByDate(opponentId, roundDate);
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

              // Check for walkover in team games
              const isWalkover = isWalkoverResultCode(game.result);

              playerMatches.push({
                round: roundResult.roundNr,
                roundDate,
                opponent,
                result,
                color: isWhite ? 'white' : 'black',
                homeResult,
                awayResult,
                isWalkover,
                gameResultCode: game.result
              });
            }
          }
        });
      }
    } else {
      // Individual tournament: check games array for walkover detection
      if (individualRoundResults.length === 0) return;

      for (const roundResult of individualRoundResults) {
        if (roundResult.homeId === memberId || roundResult.awayId === memberId) {
          const isHome = roundResult.homeId === memberId;
          const opponentId = isHome ? roundResult.awayId : roundResult.homeId;
          const playerResult = isHome ? roundResult.homeResult : roundResult.awayResult;
          const roundDate = parseDateToTimestamp(roundResult.date);

          // Get opponent info using historical date lookup
          const opponent = getPlayerByDate(opponentId, roundDate);
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

            // Check games array for walkover - the result code is in games[0].result
            const gameResultCode = roundResult.games?.[0]?.result;
            const isWalkover = gameResultCode !== undefined && isWalkoverResultCode(gameResultCode);

            playerMatches.push({
              round: roundResult.roundNr,
              roundDate,
              opponent,
              result,
              color: isHome ? 'white' : 'black',
              homeResult: roundResult.homeResult,
              awayResult: roundResult.awayResult,
              isWalkover,
              gameResultCode
            });
          }
        }
      }
    }

    // Sort by round number
    playerMatches.sort((a, b) => a.round - b.round);

    setMatches(playerMatches);
  }, [memberId, tournamentPlayer, isTeamTournament, individualRoundResults, teamRoundResults, playerMap, resultsLoading, historicalDataFetched, getPlayerByDate]);


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
        // Use historical ELO at round date for both tournament types
        const whitePlayerElo = row.color === 'white'
          ? getPlayerByDate(memberId!, row.roundDate)?.elo
          : row.opponent.elo;
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
        // Use historical ELO at round date for both tournament types
        const blackPlayerElo = row.color === 'black'
          ? getPlayerByDate(memberId!, row.roundDate)?.elo
          : row.opponent.elo;
        const { rating, ratingType } = getPlayerRatingByAlgorithm(blackPlayerElo, rankingAlgorithm);
        return formatRatingWithType(rating, ratingType, language);
      },
      align: 'center',
      noWrap: true
    },
    {
      id: 'result',
      header: t.pages.tournamentResults.roundByRound.result,
      accessor: (row) => {
        // Use the display string from gameResultCode if available, otherwise format manually
        if (row.gameResultCode !== undefined) {
          return getResultDisplayString(row.gameResultCode);
        }
        return `${row.homeResult} - ${row.awayResult}`;
      },
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' }
    },
    {
      id: 'eloChange',
      header: t.common.eloLabels.eloChange,
      accessor: (row) => {
        // Walkovers don't count for ELO
        if (row.isWalkover) return '-';

        // Use historical player data at round date for both tournament types
        const playerData = getPlayerByDate(memberId!, row.roundDate);

        if (!playerData) return '-';

        // Get appropriate ratings based on group's ranking algorithm
        const { rating: playerRating, ratingType } = getPlayerRatingByAlgorithm(playerData.elo, rankingAlgorithm);
        const { rating: opponentRating } = getPlayerRatingByAlgorithm(row.opponent.elo, rankingAlgorithm);

        // Can't calculate if either player has no rating
        if (!playerRating || !opponentRating) {
          return '-';
        }

        // Get K-factor based on rating type (rapid/blitz use K=40, standard uses K=20)
        const kFactor = getKFactorForRating(ratingType, playerRating, playerData.elo);

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
            // Filter out walkovers for calculations
            const playedMatches = matches.filter(m => !m.isWalkover);

            // Calculate actual score (sum of points) - only from played games
            const totalScore = playedMatches.reduce((sum, match) => {
              const score = match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0;
              return sum + score;
            }, 0);

            // Try to calculate ELO statistics if player has rating
            let eloChange: string = '-';
            let performanceRating: string = '-';

            if (playedMatches.length > 0) {
              // Use historical per-round data for consistency with per-row display
              // This applies to both team and individual tournaments
              const matchResults = playedMatches.map(match => {
                // Get player rating at this round's date
                const playerData = getPlayerByDate(memberId!, match.roundDate);

                const { rating: playerRating, ratingType } = getPlayerRatingByAlgorithm(playerData?.elo, rankingAlgorithm);
                const { rating: opponentRating } = getPlayerRatingByAlgorithm(match.opponent.elo, rankingAlgorithm);

                return {
                  playerRating,
                  ratingType,
                  playerElo: playerData?.elo,
                  opponentRating,
                  actualScore: match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0
                };
              });

              // Calculate total ELO change by summing per-match changes
              let totalChange = 0;
              const ratedOpponentRatings: number[] = [];
              let ratedScore = 0;

              for (const result of matchResults) {
                // Only include matches where both players have valid ratings
                if (result.playerRating && result.playerRating > 0 &&
                    result.opponentRating && result.opponentRating > 0) {
                  const kFactor = getKFactorForRating(result.ratingType, result.playerRating, result.playerElo);
                  const change = calculateRatingChange(result.playerRating, result.opponentRating, result.actualScore, kFactor);
                  totalChange += change;
                  ratedOpponentRatings.push(result.opponentRating);
                  ratedScore += result.actualScore;
                }
              }

              if (ratedOpponentRatings.length > 0) {
                totalChange = Math.round(totalChange * 10) / 10;
                eloChange = totalChange > 0 ? `+${totalChange}` : String(totalChange);

                // Calculate performance rating
                const avgOpponentRating = ratedOpponentRatings.reduce((sum, r) => sum + r, 0) / ratedOpponentRatings.length;
                const scorePercentage = ratedScore / ratedOpponentRatings.length;

                if (scorePercentage === 1.0) {
                  performanceRating = String(Math.round(avgOpponentRating + 800));
                } else if (scorePercentage === 0.0) {
                  performanceRating = String(Math.round(avgOpponentRating - 800));
                } else {
                  const ratingDiff = -400 * Math.log10((1 / scorePercentage) - 1);
                  performanceRating = String(Math.round(avgOpponentRating + ratingDiff));
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
                      {totalScore} {t.pages.playerDetail.of} {playedMatches.length}
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
        <EloRatingChart
          memberId={memberId!}
          language={language}
          labels={{
            standard: t.common.eloLabels.standard,
            rapid: t.common.eloLabels.rapid,
            blitz: t.common.eloLabels.blitz,
            lask: t.common.eloLabels.lask
          }}
        />
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
