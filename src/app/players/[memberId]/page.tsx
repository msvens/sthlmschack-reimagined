'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageSpacing } from '@/components/layout/PageSpacing';
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
        <>
      <PageSpacing />
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
              {t.pages.playerDetail.loading}
            </div>
          </div>
        </div>
        </>
    );
  }

  if (error) {
    return (
        <>
      <PageSpacing/>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="p-8 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.playerDetail.error}
              </h1>
              <p className="text-lg mb-6" style={{ color: 'var(--color-mui-text-secondary)' }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/players')}
                className="px-6 py-2 rounded font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-mui-primary-main)',
                  color: 'var(--color-mui-primary-contrast)'
                }}
              >
{t.pages.playerDetail.backButton}
              </button>
            </div>
          </div>
        </div>
      
      </>
    );
  }

  if (!player) {
    return (
        <>
      <PageSpacing/>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
              {t.pages.playerDetail.notFound}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
    <PageSpacing/>
      <div className="min-h-screen py-4 md:py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/players')}
              className="flex items-center text-sm transition-colors"
              style={{ color: 'var(--color-mui-text-secondary)' }}
            >
              ← {t.pages.playerDetail.backButton}
            </button>
          </div>

          {/* Player Header */}
          <div
            className="p-4 md:p-6 rounded-lg border mb-4 md:mb-6"
            style={{
              backgroundColor: 'var(--color-mui-background-paper)',
              borderColor: 'var(--color-mui-divider)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--color-mui-text-primary)' }}>
                  {player.firstName} {player.lastName}
                </h1>
                <p className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
                  {t.pages.playerDetail.playerInfo.memberId}: {player.id}
                </p>
                {player.club && (
                  <p className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
                    {t.pages.playerDetail.playerInfo.club}: {player.club}
                  </p>
                )}
              </div>
              
              {/* Ratings */}
              <div className="mt-4 md:mt-0">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: 'var(--color-mui-text-primary)' }}>
                      {formatRating(player.elo?.rating)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-mui-text-secondary)' }}>
                      {t.pages.playerDetail.eloRating.title}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: 'var(--color-mui-text-primary)' }}>
                      {formatRating(player.lask?.rating)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-mui-text-secondary)' }}>
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
            <div
              className="p-4 md:p-5 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h2 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.playerDetail.eloRating.title}
              </h2>
              {player.elo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.standardRating}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>
                      {player.elo.rating && player.elo.rating > 0 ? player.elo.rating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.rapidRating}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>
                      {player.elo.rapidRating && player.elo.rapidRating > 0 ? player.elo.rapidRating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.blitzRating}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>
                      {player.elo.blitzRating && player.elo.blitzRating > 0 ? player.elo.blitzRating : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.fideTitle}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>{player.elo.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.date}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>{player.elo.date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.kFactor}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>{player.elo.k || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.eloRating.noData}</p>
              )}
            </div>

            {/* Additional Information */}
            <div
              className="p-4 md:p-5 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h2 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.playerDetail.additionalInfo.title}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.additionalInfo.fideId}:</span>
                  <span style={{ color: 'var(--color-mui-text-primary)' }}>
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
                  <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.additionalInfo.birthDate}:</span>
                  <span style={{ color: 'var(--color-mui-text-primary)' }}>
                    {player.birthdate || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Tournament History */}
          <div
            className="p-4 md:p-5 rounded-lg border mt-4 md:mt-6"
            style={{
              backgroundColor: 'var(--color-mui-background-paper)',
              borderColor: 'var(--color-mui-divider)'
            }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--color-mui-text-primary)' }}>
              {t.pages.playerDetail.tournamentHistory.title}
            </h2>

            {tournamentsLoading && (
              <div className="text-center py-4">
                <div style={{ color: 'var(--color-mui-text-secondary)' }}>
                  {t.pages.playerDetail.tournamentHistory.loading}
                </div>
              </div>
            )}

            {tournamentsError && (
              <div className="text-center py-4">
                <div style={{ color: 'var(--color-mui-error-main)' }}>
                  {t.pages.playerDetail.tournamentHistory.error}
                </div>
              </div>
            )}

            {!tournamentsLoading && !tournamentsError && tournaments.length === 0 && (
              <div className="text-center py-4">
                <div style={{ color: 'var(--color-mui-text-secondary)' }}>
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
                    className="block py-3 transition-colors hover:bg-opacity-50"
                    style={{
                      borderBottom: index < tournaments.length - 1 ? `1px solid var(--color-mui-divider)` : 'none'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1" style={{ color: 'var(--color-mui-text-primary)' }}>
                          {tournamentData.tournament.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--color-mui-text-secondary)' }}>
                          <span>{formatDateRange(tournamentData.tournament.start, tournamentData.tournament.end)}</span>
                          {tournamentData.tournament.city && <span>{tournamentData.tournament.city}</span>}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        {tournamentData.result.place && (
                          <div className="text-sm font-medium" style={{ color: 'var(--color-mui-text-primary)' }}>
                            {t.pages.playerDetail.tournamentHistory.place}: {tournamentData.result.place}
                          </div>
                        )}
                        {tournamentData.result.points !== undefined && (
                          <div className="text-sm" style={{ color: 'var(--color-mui-text-secondary)' }}>
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
        </div>
      </div>
    </>
  );
}
