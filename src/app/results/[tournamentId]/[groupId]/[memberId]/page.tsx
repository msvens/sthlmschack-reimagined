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
import { TournamentService, formatRatingWithType, getPlayerRatingByAlgorithm, getPlayerRatingByRoundType, getKFactorForRating, calculateRatingChange, isWalkoverResultCode, isCountableResult, getResultDisplayString, formatPlayerName, RoundRatedType } from '@/lib/api';
import { PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults } from '@/context/GroupResultsContext';
import { useGlobalPlayerCache } from '@/context/GlobalPlayerCacheContext';

interface PlayerMatch {
  round: number;
  roundDate: number; // Unix timestamp for historical ELO lookup
  opponent: PlayerInfoDto;
  result: 'win' | 'draw' | 'loss';
  color: 'white' | 'black';
  homeResult: number;
  awayResult: number;
  isWalkover: boolean;
  isCountable: boolean; // Whether result should be counted in statistics (false for NOT_SET, POSTPONED, etc.)
  gameResultCode?: number; // Original result code from games array
  roundRatedType?: number; // The rated type for this round (0=unrated, 1=standard, 2=rapid, 3=blitz)
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
    getPlayerByDate,
    getRoundRatedType
  } = useGroupResults();

  const globalCache = useGlobalPlayerCache();

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

        // Fetch player info (via global cache) and tournament info in parallel
        const tournamentService = new TournamentService();

        const [playerData, tournamentResponse] = await Promise.all([
          globalCache.getOrFetchPlayer(memberId),
          tournamentService.getTournament(tournamentId)
        ]);

        if (!playerData) {
          throw new Error('Failed to fetch player data');
        }

        if (tournamentResponse.status !== 200 || !tournamentResponse.data) {
          throw new Error('Failed to fetch tournament data');
        }

        setPlayer(playerData);
        setTournament(tournamentResponse.data);

      } catch (err) {
        setError('Failed to load tournament player data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, memberId, groupId, globalCache]);

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
        // Get the rated type for this round
        const roundRatedType = getRoundRatedType(roundResult.roundNr);

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

              // Check for walkover and countability in team games
              const isWalkover = isWalkoverResultCode(game.result);
              const isCountable = isCountableResult(game.result);

              playerMatches.push({
                round: roundResult.roundNr,
                roundDate,
                opponent,
                result,
                color: isWhite ? 'white' : 'black',
                homeResult,
                awayResult,
                isWalkover,
                isCountable,
                gameResultCode: game.result,
                roundRatedType
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
          // Get the rated type for this round
          const roundRatedType = getRoundRatedType(roundResult.roundNr);

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

            // Check games array for walkover and countability - the result code is in games[0].result
            const gameResultCode = roundResult.games?.[0]?.result;
            const isWalkover = gameResultCode !== undefined && isWalkoverResultCode(gameResultCode);
            // Result is countable only if we have a valid result code that's not NOT_SET, POSTPONED, etc.
            const isCountable = gameResultCode !== undefined && isCountableResult(gameResultCode);

            playerMatches.push({
              round: roundResult.roundNr,
              roundDate,
              opponent,
              result,
              color: isHome ? 'white' : 'black',
              homeResult: roundResult.homeResult,
              awayResult: roundResult.awayResult,
              isWalkover,
              isCountable,
              gameResultCode,
              roundRatedType
            });
          }
        }
      }
    }

    // Sort by round number
    playerMatches.sort((a, b) => a.round - b.round);

    setMatches(playerMatches);
  }, [memberId, tournamentPlayer, isTeamTournament, individualRoundResults, teamRoundResults, playerMap, resultsLoading, historicalDataFetched, getPlayerByDate, getRoundRatedType]);


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
        // Get historical title for time-sensitive display
        const whiteTitle = isPlayerWhite
          ? getPlayerByDate(memberId!, row.roundDate)?.elo?.title
          : row.opponent.elo?.title;
        const displayName = formatPlayerName(whitePlayer.firstName, whitePlayer.lastName, whiteTitle);
        return isPlayerWhite ? (
          displayName
        ) : (
          <Link href={`/results/${tournamentId}/${groupId}/${row.opponent.id}`} color="gray">
            {displayName}
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

        // Use round-specific rating type if available
        if (row.roundRatedType !== undefined && row.roundRatedType !== RoundRatedType.UNRATED) {
          const { rating, ratingType } = getPlayerRatingByRoundType(whitePlayerElo, row.roundRatedType);
          return formatRatingWithType(rating, ratingType, language);
        }

        // Fallback to group-level ranking algorithm
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
        // Get historical title for time-sensitive display
        const blackTitle = isPlayerBlack
          ? getPlayerByDate(memberId!, row.roundDate)?.elo?.title
          : row.opponent.elo?.title;
        const displayName = formatPlayerName(blackPlayer.firstName, blackPlayer.lastName, blackTitle);
        return isPlayerBlack ? (
          displayName
        ) : (
          <Link href={`/results/${tournamentId}/${groupId}/${row.opponent.id}`} color="gray">
            {displayName}
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

        // Use round-specific rating type if available
        if (row.roundRatedType !== undefined && row.roundRatedType !== RoundRatedType.UNRATED) {
          const { rating, ratingType } = getPlayerRatingByRoundType(blackPlayerElo, row.roundRatedType);
          return formatRatingWithType(rating, ratingType, language);
        }

        // Fallback to group-level ranking algorithm
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
        // Non-countable results (walkovers, not set, postponed, etc.) don't count for ELO
        if (row.isWalkover || !row.isCountable) return '-';

        // Skip ELO calculation for unrated rounds
        if (row.roundRatedType === RoundRatedType.UNRATED) return '-';

        // Use historical player data at round date for both tournament types
        const playerData = getPlayerByDate(memberId!, row.roundDate);

        if (!playerData) return '-';

        // Get appropriate ratings - use round-specific type if available
        let playerRating: number | null;
        let ratingType: ReturnType<typeof getPlayerRatingByRoundType>['ratingType'];
        let opponentRating: number | null;

        if (row.roundRatedType !== undefined && row.roundRatedType !== RoundRatedType.UNRATED) {
          // Use round-specific rating type
          const playerResult = getPlayerRatingByRoundType(playerData.elo, row.roundRatedType);
          const opponentResult = getPlayerRatingByRoundType(row.opponent.elo, row.roundRatedType);
          playerRating = playerResult.rating;
          ratingType = playerResult.ratingType;
          opponentRating = opponentResult.rating;
        } else {
          // Fallback to group-level ranking algorithm
          const playerResult = getPlayerRatingByAlgorithm(playerData.elo, rankingAlgorithm);
          const opponentResult = getPlayerRatingByAlgorithm(row.opponent.elo, rankingAlgorithm);
          playerRating = playerResult.rating;
          ratingType = playerResult.ratingType;
          opponentRating = opponentResult.rating;
        }

        // Can't calculate if either player has no rating
        if (!playerRating || !opponentRating) {
          return '-';
        }

        // Get K-factor based on rating type and player age (juniors under 18 with rating <2300 get K=40)
        const kFactor = getKFactorForRating(ratingType, playerRating, playerData.elo, playerData.birthdate, row.roundDate);

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
            {formatPlayerName(player.firstName, player.lastName, player.elo?.title)} - {t.pages.playerDetail.matches}
          </h2>
          <Table
            data={matches}
            columns={matchColumns}
            getRowKey={(row) => `${row.round}-${row.opponent.id}`}
            emptyMessage={t.pages.playerDetail.noMatchesFound}
          />

          {/* Tournament Summary */}
          {matches.length > 0 && (() => {
            // Filter out walkovers and non-countable results (NOT_SET, POSTPONED, etc.) for calculations
            const playedMatches = matches.filter(m => !m.isWalkover && m.isCountable);

            // Calculate actual score (sum of points) - only from played games
            const totalScore = playedMatches.reduce((sum, match) => {
              const score = match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0;
              return sum + score;
            }, 0);

            // Group matches by rating type for separate ELO calculations
            type RatingStats = {
              totalChange: number;
              opponentRatings: number[];
              score: number;
              gameCount: number;
            };

            const statsByType: Record<string, RatingStats> = {
              standard: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
              rapid: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
              blitz: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
            };

            if (playedMatches.length > 0) {
              for (const match of playedMatches) {
                // Skip unrated rounds
                if (match.roundRatedType === RoundRatedType.UNRATED) continue;

                // Get player rating at this round's date
                const playerData = getPlayerByDate(memberId!, match.roundDate);

                // Use round-specific rating type if available
                let playerRating: number | null;
                let ratingType: ReturnType<typeof getPlayerRatingByRoundType>['ratingType'];
                let opponentRating: number | null;

                if (match.roundRatedType !== undefined && match.roundRatedType !== RoundRatedType.UNRATED) {
                  const playerResult = getPlayerRatingByRoundType(playerData?.elo, match.roundRatedType);
                  const opponentResult = getPlayerRatingByRoundType(match.opponent.elo, match.roundRatedType);
                  playerRating = playerResult.rating;
                  ratingType = playerResult.ratingType;
                  opponentRating = opponentResult.rating;
                } else {
                  const playerResult = getPlayerRatingByAlgorithm(playerData?.elo, rankingAlgorithm);
                  const opponentResult = getPlayerRatingByAlgorithm(match.opponent.elo, rankingAlgorithm);
                  playerRating = playerResult.rating;
                  ratingType = playerResult.ratingType;
                  opponentRating = opponentResult.rating;
                }

                // Only include matches where both players have valid ratings
                if (playerRating && playerRating > 0 && opponentRating && opponentRating > 0 && ratingType) {
                  const kFactor = getKFactorForRating(ratingType, playerRating, playerData?.elo, playerData?.birthdate, match.roundDate);
                  const actualScore = match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0;
                  const change = calculateRatingChange(playerRating, opponentRating, actualScore, kFactor);

                  const stats = statsByType[ratingType];
                  if (stats) {
                    stats.totalChange += change;
                    stats.opponentRatings.push(opponentRating);
                    stats.score += actualScore;
                    stats.gameCount++;
                  }
                }
              }
            }

            // Calculate performance rating for a given stats object
            const calcPerformance = (stats: RatingStats): string => {
              if (stats.opponentRatings.length === 0) return '-';
              const avgOpponent = stats.opponentRatings.reduce((a, b) => a + b, 0) / stats.opponentRatings.length;
              const scorePct = stats.score / stats.opponentRatings.length;
              if (scorePct === 1.0) return String(Math.round(avgOpponent + 800));
              if (scorePct === 0.0) return String(Math.round(avgOpponent - 800));
              const ratingDiff = -400 * Math.log10((1 / scorePct) - 1);
              return String(Math.round(avgOpponent + ratingDiff));
            };

            // Format ELO change
            const formatChange = (stats: RatingStats): string => {
              if (stats.gameCount === 0) return '-';
              const rounded = Math.round(stats.totalChange * 10) / 10;
              return rounded > 0 ? `+${rounded}` : String(rounded);
            };

            // Determine which rating types have games
            const hasStandard = statsByType.standard.gameCount > 0;
            const hasRapid = statsByType.rapid.gameCount > 0;
            const hasBlitz = statsByType.blitz.gameCount > 0;
            const ratingTypeCount = [hasStandard, hasRapid, hasBlitz].filter(Boolean).length;

            return (
              <div className="mt-3 p-3">
                {/* Always show total score */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t.pages.playerDetail.total}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {totalScore} {t.pages.playerDetail.of} {playedMatches.length}
                  </div>
                </div>

                {/* Show stats per rating type when there are multiple types, or combined if single type */}
                {ratingTypeCount === 0 ? (
                  // No rated games
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t.common.eloLabels.eloChange}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">-</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t.common.eloLabels.performanceRating}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">-</div>
                    </div>
                  </div>
                ) : ratingTypeCount === 1 ? (
                  // Single rating type - show simple view
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {hasRapid ? t.common.eloLabels.rapidEloChange :
                         hasBlitz ? t.common.eloLabels.blitzEloChange :
                         t.common.eloLabels.eloChange}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {formatChange(hasStandard ? statsByType.standard : hasRapid ? statsByType.rapid : statsByType.blitz)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {hasRapid ? t.common.eloLabels.rapidPerformance :
                         hasBlitz ? t.common.eloLabels.blitzPerformance :
                         t.common.eloLabels.performanceRating}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {calcPerformance(hasStandard ? statsByType.standard : hasRapid ? statsByType.rapid : statsByType.blitz)}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Multiple rating types - show separate stats for each
                  <div className="space-y-2">
                    {hasStandard && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.eloChange}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {formatChange(statsByType.standard)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.performanceRating}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {calcPerformance(statsByType.standard)}
                          </div>
                        </div>
                      </div>
                    )}
                    {hasRapid && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.rapidEloChange}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {formatChange(statsByType.rapid)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.rapidPerformance}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {calcPerformance(statsByType.rapid)}
                          </div>
                        </div>
                      </div>
                    )}
                    {hasBlitz && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.blitzEloChange}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {formatChange(statsByType.blitz)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t.common.eloLabels.blitzPerformance}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            {calcPerformance(statsByType.blitz)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
