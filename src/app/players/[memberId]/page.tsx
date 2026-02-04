'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlayerInfo } from '@/components/player/PlayerInfo';
import { PlayerHistory } from '@/components/player/PlayerHistory';
import { EloRatingChart } from '@/components/player/EloRatingChart';
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

  const memberId = params.memberId ? parseInt(params.memberId as string) : null;

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
      <PageLayout maxWidth="4xl">
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
      <PageLayout maxWidth="4xl">
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
      <PageLayout maxWidth="4xl">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.playerDetail.notFound}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="4xl">
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