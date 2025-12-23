'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { PlayerTournamentList } from '@/components/player/PlayerTournamentList';
import { Table, TableColumn } from '@/components/Table';
import { Link } from '@/components/Link';
import { PlayerService, TournamentService, getPlayerTournaments, PlayerTournamentData, formatPlayerRating, getPlayerRatingForTournament, calculateRatingChange, calculateTournamentStats } from '@/lib/api';
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
  const { roundResults, playerMap, loading: resultsLoading } = useGroupResults();

  const [player, setPlayer] = useState<PlayerInfoDto | null>(null); // Current player info for display
  const [tournamentPlayer, setTournamentPlayer] = useState<PlayerInfoDto | null>(null); // Historical player info for calculations
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tournament history state
  const [tournaments, setTournaments] = useState<PlayerTournamentData[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);

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

  // Extract player's matches from context roundResults once available
  useEffect(() => {
    if (!memberId || !tournamentPlayer || resultsLoading || roundResults.length === 0) {
      return;
    }

    // Filter matches for this player using data from context
    const playerMatches: PlayerMatch[] = [];

    for (const roundResult of roundResults) {
      if (roundResult.homeId === memberId || roundResult.awayId === memberId) {
        const isHome = roundResult.homeId === memberId;
        const opponentId = isHome ? roundResult.awayId : roundResult.homeId;
        const playerResult = isHome ? roundResult.homeResult : roundResult.awayResult;

        // Get opponent info from playerMap (no API call needed!)
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

    // Sort by round number
    playerMatches.sort((a, b) => a.round - b.round);

    setMatches(playerMatches);
  }, [memberId, tournamentPlayer, roundResults, playerMap, resultsLoading]);

  // Fetch tournament history after player data is loaded
  useEffect(() => {
    if (!player || !memberId) return;

    const fetchTournaments = async () => {
      try {
        setTournamentsLoading(true);
        setTournamentsError(null);

        const response = await getPlayerTournaments(memberId);

        if (response.status !== 200) {
          throw new Error(response.error || 'Failed to fetch tournament data');
        }

        setTournaments(response.data || []);
      } catch (err) {
        setTournamentsError('Failed to load tournament history');
        console.error('Error fetching tournaments:', err);
      } finally {
        setTournamentsLoading(false);
      }
    };

    fetchTournaments();
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
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
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

  // Helper function to get K-factor with fallback
  const getKFactor = (playerData: PlayerInfoDto): number => {
    if (playerData.elo?.k) {
      return playerData.elo.k;
    }
    // Default K-factor based on rating (FIDE rules approximation)
    // K=10 for 2400+, K=20 for adults <2400, K=40 for juniors/new players
    const rating = playerData.elo?.rating || playerData.elo?.rapidRating || playerData.elo?.blitzRating;
    if (rating && rating >= 2400) return 10;
    return 20; // Default for most adult players
  };

  // Define columns for player matches table
  const matchColumns: TableColumn<PlayerMatch>[] = [
    {
      id: 'round',
      header: language === 'sv' ? 'Rond' : 'Round',
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
        return formatPlayerRating(whitePlayerElo, tournament.thinkingTime);
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
        return formatPlayerRating(blackPlayerElo, tournament.thinkingTime);
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
      header: language === 'sv' ? 'ELO +/-' : 'ELO +/-',
      accessor: (row) => {
        if (!tournamentPlayer) return '-';

        // Get appropriate ratings based on tournament type (historical ratings from tournament)
        const { rating: playerRating } = getPlayerRatingForTournament(tournamentPlayer.elo, tournament.thinkingTime);
        const { rating: opponentRating } = getPlayerRatingForTournament(row.opponent.elo, tournament.thinkingTime);
        const kFactor = getKFactor(tournamentPlayer);

        // Can't calculate if either player has no rating
        if (!playerRating || !opponentRating) {
          return '-';
        }

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
          {new Date(tournament.start).toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {tournament.start !== tournament.end && (
            <> - {new Date(tournament.end).toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</>
          )}
        </p>
      </div>

      {/* Player Matches in This Tournament */}
      {resultsLoading ? (
        <div className="mb-8 text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading matches...
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {player.firstName} {player.lastName} - {language === 'sv' ? 'Partier' : 'Matches'}
          </h2>
          <Table
            data={matches}
            columns={matchColumns}
            getRowKey={(row) => `${row.round}-${row.opponent.id}`}
            emptyMessage={language === 'sv' ? 'Inga partier hittades' : 'No matches found'}
          />

          {/* Tournament Summary */}
          {(() => {
            // Calculate tournament statistics using historical ratings
            if (!tournamentPlayer?.elo || matches.length === 0) {
              return null;
            }

            const { rating: playerRating } = getPlayerRatingForTournament(tournamentPlayer.elo, tournament.thinkingTime);
            if (!playerRating) {
              return null;
            }

            const kFactor = getKFactor(tournamentPlayer);

            const matchResults = matches.map(match => ({
              opponentRating: getPlayerRatingForTournament(match.opponent.elo, tournament.thinkingTime).rating,
              actualScore: match.result === 'win' ? 1.0 : match.result === 'draw' ? 0.5 : 0.0
            }));

            const stats = calculateTournamentStats(matchResults, playerRating, kFactor);

            if (stats.gamesWithRatedOpponents === 0) {
              return null;
            }

            return (
              <div className="mt-3 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {language === 'sv' ? 'Totalt' : 'Total'}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {matches.length} {language === 'sv' ? 'av' : 'of'} {matches.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {language === 'sv' ? 'ELO +/-' : 'ELO +/-'}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.totalChange > 0 ? `+${stats.totalChange}` : stats.totalChange}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {language === 'sv' ? 'ELO prestation' : 'Performance Rating'}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.performanceRating}
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

      {/* Tournament History - Compact List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t.pages.playerDetail.tournamentHistory.title}
        </h2>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <PlayerTournamentList
            tournaments={tournaments}
            loading={tournamentsLoading}
            error={tournamentsError || undefined}
            t={{
              loading: t.pages.playerDetail.tournamentHistory.loading,
              error: t.pages.playerDetail.tournamentHistory.error,
              noTournaments: t.pages.playerDetail.tournamentHistory.noTournaments,
              place: t.pages.playerDetail.tournamentHistory.place,
              points: t.pages.playerDetail.tournamentHistory.points
            }}
            language={language}
          />
        </div>
      </div>
    </PageLayout>
  );
}
