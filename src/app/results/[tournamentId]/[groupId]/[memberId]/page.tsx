'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { PlayerTournamentList } from '@/components/player/PlayerTournamentList';
import { Table, TableColumn } from '@/components/Table';
import { Link } from '@/components/Link';
import { PlayerService, TournamentService, getPlayerTournaments, PlayerTournamentData } from '@/lib/api';
import { PlayerInfoDto, TournamentDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults } from '@/context/GroupResultsContext';

interface PlayerMatch {
  round: number;
  opponent: PlayerInfoDto;
  result: 'win' | 'draw' | 'loss';
  color: 'white' | 'black';
  opponentRating: number | null;
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

  const [player, setPlayer] = useState<PlayerInfoDto | null>(null);
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

  // Extract player's matches from context roundResults once available
  useEffect(() => {
    if (!memberId || !player || resultsLoading || roundResults.length === 0) {
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
            opponentRating: opponent.elo?.rating || null,
            homeResult: roundResult.homeResult,
            awayResult: roundResult.awayResult
          });
        }
      }
    }

    // Sort by round number
    playerMatches.sort((a, b) => a.round - b.round);

    setMatches(playerMatches);
  }, [memberId, player, roundResults, playerMap, resultsLoading]);

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
          <Link href={`/players/${row.opponent.id}`} color="gray">
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
        const rating = row.color === 'white' ? player.elo?.rating : row.opponentRating;
        return rating || '-';
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
          <Link href={`/players/${row.opponent.id}`} color="gray">
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
        const rating = row.color === 'black' ? player.elo?.rating : row.opponentRating;
        return rating || '-';
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
          <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <Table
              data={matches}
              columns={matchColumns}
              getRowKey={(row) => `${row.round}-${row.opponent.id}`}
              emptyMessage={language === 'sv' ? 'Inga partier hittades' : 'No matches found'}
            />
          </div>
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
