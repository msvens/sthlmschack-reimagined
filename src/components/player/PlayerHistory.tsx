'use client';

import React, { useState, ReactNode } from 'react';
import { PlayerTournamentList } from './PlayerTournamentList';
import { PlayerTournamentData } from '@/lib/api/utils/playerTournaments';
import { getTranslation } from '@/lib/translations';

export type PlayerTabType = 'individual' | 'team' | 'opponents';

export interface PlayerHistoryProps {
  /** Individual tournament data */
  tournaments: PlayerTournamentData[];
  /** Optional loading state for tournaments */
  loading?: boolean;
  /** Optional error message */
  error?: string;
  /** Translations for tournament list */
  t: {
    loading?: string;
    error?: string;
    noTournaments?: string;
    place: string;
    points: string;
  };
  /** Tab labels from translations */
  tabLabels: {
    individual: string;
    team: string;
    opponents: string;
  };
  /** Language for date formatting */
  language?: 'sv' | 'en';
  /** Optional content to prepend to Individual tab (e.g., tournament-specific matches) */
  prependToIndividual?: ReactNode;
}

export function PlayerHistory({
  tournaments,
  loading = false,
  error,
  t,
  tabLabels,
  language = 'sv',
  prependToIndividual
}: PlayerHistoryProps) {
  const [selectedTab, setSelectedTab] = useState<PlayerTabType>('individual');
  const translations = getTranslation(language);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setSelectedTab('individual')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'individual'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.individual}
        </button>
        <button
          onClick={() => setSelectedTab('team')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'team'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.team}
        </button>
        <button
          onClick={() => setSelectedTab('opponents')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'opponents'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.opponents}
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'individual' && (
        <div>
          {prependToIndividual && <div className="mb-6">{prependToIndividual}</div>}
          <PlayerTournamentList
            tournaments={tournaments}
            loading={loading}
            error={error}
            t={t}
            language={language}
          />
        </div>
      )}

      {selectedTab === 'team' && (
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          {translations.components.playerHistory.teamTournamentHistory}
        </div>
      )}

      {selectedTab === 'opponents' && (
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          {translations.components.playerHistory.opponentStatistics}
        </div>
      )}
    </div>
  );
}