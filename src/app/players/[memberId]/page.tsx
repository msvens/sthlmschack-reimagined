'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageSpacing } from '@/components/layout/PageSpacing';
import { PlayerService } from '@/lib/api';
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

  const formatRating = (rating: number | null | undefined) => {
    return rating ? rating.toString() : 'N/A';
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
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
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
            className="p-8 rounded-lg border mb-8"
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
          <div className="grid md:grid-cols-2 gap-8">
            {/* ELO Rating Details */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
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

            {/* LASK Rating Details */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.playerDetail.laskRating.title}
              </h2>
              {player.lask ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.laskRating.rating}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>{player.lask.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.laskRating.date}:</span>
                    <span style={{ color: 'var(--color-mui-text-primary)' }}>{player.lask.date || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.laskRating.noData}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div 
            className="p-6 rounded-lg border mt-8"
            style={{ 
              backgroundColor: 'var(--color-mui-background-paper)',
              borderColor: 'var(--color-mui-divider)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
              {t.pages.playerDetail.additionalInfo.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium" style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.additionalInfo.fideId}:</span>
                <span className="ml-2" style={{ color: 'var(--color-mui-text-primary)' }}>
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
              <div>
                <span className="font-medium" style={{ color: 'var(--color-mui-text-secondary)' }}>{t.pages.playerDetail.additionalInfo.birthDate}:</span>
                <span className="ml-2" style={{ color: 'var(--color-mui-text-primary)' }}>
                  {player.birthdate || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
