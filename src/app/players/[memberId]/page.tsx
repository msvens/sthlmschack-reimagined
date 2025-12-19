'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerService, getPlayerTournaments, PlayerTournamentData } from '@/lib/api';
import { PlayerInfoDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [player, setPlayer] = useState<PlayerInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tournament state
  const [tournaments, setTournaments] = useState<PlayerTournamentData[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  
  const memberId = params.memberId ? parseInt(params.memberId as string) : null;

  useEffect(() => {
    if (!memberId || isNaN(memberId)) {
      setError('Invalid member ID');
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use PlayerService instead of direct API call
        const playerService = new PlayerService();
        const response = await playerService.getPlayerInfo(memberId);
        
        if (response.status !== 200) {
          throw new Error(response.error || 'Failed to fetch player data');
        }
        
        if (!response.data) {
          throw new Error('Player not found');
        }
        
        setPlayer(response.data);
      } catch (err) {
        setError('Failed to load player information');
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [memberId]);

  // Fetch tournaments after player data is loaded
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

  const formatRating = (rating: number | null | undefined) => {
    return rating ? rating.toString() : 'N/A';
  };

  const formatTournamentDate = (dateString: string) => {
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

  const formatDateRange = (start: string, end: string) => {
    const startFormatted = formatTournamentDate(start);
    const endFormatted = formatTournamentDate(end);
    return start === end ? startFormatted : `${startFormatted} - ${endFormatted}`;
  };

  if (loading) {
    return (
      <PageLayout fullScreen maxWidth="4xl">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.loading}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout fullScreen maxWidth="4xl">
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t.pages.playerDetail.error}
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => router.push('/players')}
              className="px-6 py-2 rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              {t.pages.playerDetail.backButton}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!player) {
    return (
      <PageLayout fullScreen maxWidth="4xl">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.notFound}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout fullScreen maxWidth="4xl">
      {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/players')}
              className="flex items-center text-sm transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← {t.pages.playerDetail.backButton}
            </button>
          </div>

          {/* Player Header */}
          <div className="p-4 md:p-6 rounded-lg border mb-4 md:mb-6 bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-light mb-2 text-gray-900 dark:text-white">
                  {player.firstName} {player.lastName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t.pages.playerDetail.playerInfo.memberId}: {player.id}
                </p>
                {player.club && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {t.pages.playerDetail.playerInfo.club}: {player.club}
                  </p>
                )}
              </div>

              {/* Ratings */}
              <div className="mt-4 md:mt-0">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatRating(player.elo?.rating)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.pages.playerDetail.eloRating.title}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatRating(player.lask?.rating)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.pages.playerDetail.laskRating.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Details */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* ELO Rating Details */}
            <div className="p-4 md:p-5 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {t.pages.playerDetail.eloRating.title}
              </h2>
              {player.elo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.standardRating}:</span>
                    <span className="text-gray-900 dark:text-white">
                      {player.elo.rating && player.elo.rating > 0 ? player.elo.rating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.rapidRating}:</span>
                    <span className="text-gray-900 dark:text-white">
                      {player.elo.rapidRating && player.elo.rapidRating > 0 ? player.elo.rapidRating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.blitzRating}:</span>
                    <span className="text-gray-900 dark:text-white">
                      {player.elo.blitzRating && player.elo.blitzRating > 0 ? player.elo.blitzRating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.fideTitle}:</span>
                    <span className="text-gray-900 dark:text-white">{player.elo.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.date}:</span>
                    <span className="text-gray-900 dark:text-white">{player.elo.date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.kFactor}:</span>
                    <span className="text-gray-900 dark:text-white">{player.elo.k || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.eloRating.noData}</p>
              )}
            </div>

            {/* Additional Information */}
            <div className="p-4 md:p-5 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {t.pages.playerDetail.additionalInfo.title}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.additionalInfo.fideId}:</span>
                  <span className="text-gray-900 dark:text-white">
                    {player.fideid ? (
                      <a
                        href={`https://ratings.fide.com/profile/${player.fideid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {player.fideid}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t.pages.playerDetail.additionalInfo.birthDate}:</span>
                  <span className="text-gray-900 dark:text-white">
                    {player.birthdate || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Tournament History */}
          <div className="p-4 md:p-5 rounded-lg border mt-4 md:mt-6 bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {t.pages.playerDetail.tournamentHistory.title}
            </h2>

            {tournamentsLoading && (
              <div className="text-center py-4">
                <div className="text-gray-600 dark:text-gray-400">
                  {t.pages.playerDetail.tournamentHistory.loading}
                </div>
              </div>
            )}

            {tournamentsError && (
              <div className="text-center py-4">
                <div className="text-red-600 dark:text-red-400">
                  {t.pages.playerDetail.tournamentHistory.error}
                </div>
              </div>
            )}

            {!tournamentsLoading && !tournamentsError && tournaments.length === 0 && (
              <div className="text-center py-4">
                <div className="text-gray-600 dark:text-gray-400">
                  {t.pages.playerDetail.tournamentHistory.noTournaments}
                </div>
              </div>
            )}

            {!tournamentsLoading && !tournamentsError && tournaments.length > 0 && (
              <div className="space-y-0">
                {tournaments.map((tournamentData, index) => (
                  <Link
                    key={`${tournamentData.tournament.id}-${tournamentData.result.groupId}`}
                    href={`/results/${tournamentData.tournament.id}?groupId=${tournamentData.result.groupId}`}
                    className="block py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{
                      borderBottom: index < tournaments.length - 1 ? '1px solid' : 'none'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1 text-gray-900 dark:text-white">
                          {tournamentData.tournament.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDateRange(tournamentData.tournament.start, tournamentData.tournament.end)}</span>
                          {tournamentData.tournament.city && <span>{tournamentData.tournament.city}</span>}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        {tournamentData.result.place && (
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {t.pages.playerDetail.tournamentHistory.place}: {tournamentData.result.place}
                          </div>
                        )}
                        {tournamentData.result.points !== undefined && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t.pages.playerDetail.tournamentHistory.points}: {tournamentData.result.points}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
    </PageLayout>
  );
}
