'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { PlayerHistory } from '@/components/player/PlayerHistory';
import { EloRatingChart, RatingDataPoint } from '@/components/player/EloRatingChart';
import { DatePicker } from '@/components/DatePicker';
import { getPlayerRatingHistory } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { addRecentPlayer } from '@/lib/recentPlayers';
import { usePlayer } from '@/context/PlayerContext';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get current player and tournaments from context (fetched by layout)
  const {
    currentPlayer: player,
    currentPlayerLoading: loading,
    gamesError: error,
    tournaments,
    tournamentsLoading,
  } = usePlayer();

  // Rating history state
  const [ratingHistory, setRatingHistory] = useState<RatingDataPoint[]>([]);
  const [ratingHistoryLoading, setRatingHistoryLoading] = useState(false);

  // Date range for ELO history (YYYY-MM format)
  const getDefaultDateRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return {
      start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      end: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    };
  };
  const defaultRange = getDefaultDateRange();
  const [startMonth, setStartMonth] = useState(defaultRange.start);
  const [endMonth, setEndMonth] = useState(defaultRange.end);

  const memberId = params.memberId ? parseInt(params.memberId as string) : null;

  // Fetch rating history after player data is loaded or date range changes
  useEffect(() => {
    if (!player || !memberId) return;

    const fetchRatingHistory = async () => {
      try {
        setRatingHistoryLoading(true);

        const response = await getPlayerRatingHistory(memberId, startMonth, endMonth);

        if (response.status === 200 && response.data) {
          setRatingHistory(response.data);
        }
      } catch (err) {
        console.error('Error fetching rating history:', err);
      } finally {
        setRatingHistoryLoading(false);
      }
    };

    fetchRatingHistory();
  }, [player, memberId, startMonth, endMonth]);

  // Save to recent players when player data is loaded
  useEffect(() => {
    if (player && memberId) {
      addRecentPlayer({
        id: memberId,
        name: `${player.firstName} ${player.lastName}`,
        club: player.club || undefined
      });
    }
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
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
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

      {/* ELO Rating History Chart */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
          {t.common.eloLabels.ratingHistory}
        </h2>
        <div className="flex gap-3 mb-4">
          <DatePicker
            value={startMonth}
            onChange={setStartMonth}
            mode="month"
            compact
            language={language}
          />
          <DatePicker
            value={endMonth}
            onChange={setEndMonth}
            mode="month"
            compact
            language={language}
          />
        </div>
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

      {/* Player History with Tabs */}
      <div className="mt-8">
        <PlayerHistory
          tournaments={tournaments}
          loading={tournamentsLoading}
          t={{
            loading: t.pages.playerDetail.tournamentHistory.loading,
            error: t.pages.playerDetail.tournamentHistory.error,
            noTournaments: t.pages.playerDetail.tournamentHistory.noTournaments,
            place: t.pages.playerDetail.tournamentHistory.place,
            points: t.pages.playerDetail.tournamentHistory.points,
            outcome: t.pages.playerDetail.tournamentHistory.outcome
          }}
          tabLabels={t.pages.playerDetail.tabs}
          language={language}
        />
      </div>
    </PageLayout>
  );
}