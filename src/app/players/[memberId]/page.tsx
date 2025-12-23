'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { PlayerHistory } from '@/components/player/PlayerHistory';
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

  if (error) {
    return (
      <PageLayout maxWidth="3xl">
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
      <PageLayout maxWidth="3xl">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.notFound}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="3xl">
      {/* Player Info - Compact, No Borders */}
      <div className="mb-6">
        <PlayerInfo
          player={player}
          t={t.pages.playerDetail}
        />
      </div>

      {/* Player History with Tabs */}
      <div className="mt-8">
        <PlayerHistory
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
          tabLabels={t.pages.playerDetail.tabs}
          language={language}
        />
      </div>
    </PageLayout>
  );
}
