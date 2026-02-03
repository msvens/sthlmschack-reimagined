'use client';

import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { PlayerTournamentList } from './PlayerTournamentList';
import { OpponentsTab } from './OpponentsTab';
import { HeadToHeadTab } from './HeadToHeadTab';
import { TournamentParticipation, usePlayer } from '@/context/PlayerContext';

export type PlayerTabType = 'individual' | 'team' | 'opponents' | 'h2h';

export interface PlayerHistoryProps {
  /** Tournament participation data (unified list, will be filtered by isTeam) */
  tournaments: TournamentParticipation[];
  /** Optional loading state for tournaments */
  loading?: boolean;
  /** Translations for tournament list */
  t: {
    loading?: string;
    error?: string;
    noTournaments?: string;
    place: string;
    points: string;
    outcome: string;
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
  t,
  tabLabels,
  language = 'sv',
  prependToIndividual
}: PlayerHistoryProps) {
  const [selectedTab, setSelectedTab] = useState<PlayerTabType>('individual');
  const { selectedOpponentId, selectedOpponentName } = usePlayer();

  // Handle tab change - keep H2H tab available until different opponent selected
  const handleTabChange = (tab: PlayerTabType) => {
    setSelectedTab(tab);
  };

  // Auto-switch to H2H tab when opponent is selected
  useEffect(() => {
    if (selectedOpponentId && selectedOpponentName) {
      setSelectedTab('h2h');
    }
  }, [selectedOpponentId, selectedOpponentName]);

  // Filter tournaments by type
  const individualTournaments = useMemo(
    () => tournaments.filter(t => !t.isTeam),
    [tournaments]
  );
  const teamTournaments = useMemo(
    () => tournaments.filter(t => t.isTeam),
    [tournaments]
  );

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => handleTabChange('individual')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'individual'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.individual}
        </button>
        <button
          onClick={() => handleTabChange('team')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'team'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.team}
        </button>
        <button
          onClick={() => handleTabChange('opponents')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedTab === 'opponents'
              ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {tabLabels.opponents}
        </button>
        {/* Dynamic H2H tab - only shown when opponent is selected */}
        {selectedOpponentId && selectedOpponentName && (
          <button
            onClick={() => handleTabChange('h2h')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTab === 'h2h'
                ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {selectedOpponentName}
          </button>
        )}
      </div>

      {/* Tab Content */}
      {selectedTab === 'individual' && (
        <div>
          {prependToIndividual && <div className="mb-6">{prependToIndividual}</div>}
          <PlayerTournamentList
            tournaments={individualTournaments}
            loading={loading}
            t={t}
            language={language}
            density="compact"
          />
        </div>
      )}

      {selectedTab === 'team' && (
        <PlayerTournamentList
          tournaments={teamTournaments}
          loading={loading}
          t={t}
          language={language}
          density="compact"
          isTeam
        />
      )}

      {selectedTab === 'opponents' && (
        <OpponentsTab language={language} />
      )}

      {selectedTab === 'h2h' && selectedOpponentId && selectedOpponentName && (
        <HeadToHeadTab
          opponentId={selectedOpponentId}
          language={language}
        />
      )}
    </div>
  );
}