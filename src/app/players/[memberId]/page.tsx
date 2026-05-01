'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get current player and tournaments from context (fetched by layout)
  const {
    currentPlayer: player,
    currentPlayerLoading: loading,
    gamesError,
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

      {/* Elo Rating History Chart */}
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
          error={gamesError}
          t={{
            loading: t.pages.playerDetail.tournamentHistory.loading,
            error: t.pages.playerDetail.tournamentHistory.error,
            noTournaments: t.pages.playerDetail.tournamentHistory.noTournaments,
            place: t.pages.playerDetail.tournamentHistory.place,
            points: t.pages.playerDetail.tournamentHistory.points,
            outcome: t.pages.playerDetail.tournamentHistory.outcome,
            registered: t.pages.playerDetail.tournamentHistory.registered
          }}
          tabLabels={t.pages.playerDetail.tabs}
          language={language}
        />
      </div>
    </PageLayout>
  );
}