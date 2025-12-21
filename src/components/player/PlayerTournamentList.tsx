'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayerTournamentData } from '@/lib/api/utils/playerTournaments';

export type TournamentListDensity = 'compact' | 'normal' | 'comfortable';

export interface DensityThresholds {
  /** Row count threshold for comfortable density (below this) */
  comfortable: number;
  /** Row count threshold for normal density (below this, above comfortable) */
  normal: number;
  /** Above normal threshold = compact */
}

export interface PlayerTournamentListProps {
  /** Tournament data to display */
  tournaments: PlayerTournamentData[];
  /** Optional loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
  /** Translations object */
  t: {
    loading?: string;
    error?: string;
    noTournaments?: string;
    place: string;
    points: string;
  };
  /** Language for date formatting */
  language?: 'sv' | 'en';
  /**
   * List density - controls padding and font size.
   * If not provided, auto-density is enabled (compact on mobile, row-count based on desktop)
   */
  density?: TournamentListDensity;
  /**
   * Thresholds for auto-density selection on desktop.
   * Default: comfortable <= 10 rows, normal <= 25 rows, compact > 25 rows
   */
  densityThresholds?: DensityThresholds;
}

export function PlayerTournamentList({
  tournaments,
  loading = false,
  error,
  t,
  language = 'sv',
  density,
  densityThresholds = {
    comfortable: 10,
    normal: 25
  }
}: PlayerTournamentListProps) {
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine effective density
  const getEffectiveDensity = (): TournamentListDensity => {
    // If density is explicitly set, use it
    if (density) {
      return density;
    }

    // Mobile is always compact
    if (isMobile) {
      return 'compact';
    }

    // Desktop: auto-density based on row count
    const rowCount = tournaments.length;
    if (rowCount <= densityThresholds.comfortable) {
      return 'comfortable';
    } else if (rowCount <= densityThresholds.normal) {
      return 'normal';
    } else {
      return 'compact';
    }
  };

  const effectiveDensity = getEffectiveDensity();

  // Map density to classes
  const densityClasses = {
    compact: {
      padding: 'py-1.5',
      fontSize: 'text-xs',
      titleSize: 'text-xs',
      metaSize: 'text-xs',
      gap: 'gap-0'
    },
    normal: {
      padding: 'py-3',
      fontSize: 'text-sm',
      titleSize: 'text-base',
      metaSize: 'text-sm',
      gap: 'gap-1'
    },
    comfortable: {
      padding: 'py-4',
      fontSize: 'text-base',
      titleSize: 'text-lg',
      metaSize: 'text-sm',
      gap: 'gap-1'
    }
  };

  const classes = densityClasses[effectiveDensity];

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

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 dark:text-gray-400">
          {t.loading || 'Loading...'}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 dark:text-gray-400">
          {t.noTournaments || 'No tournaments found'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes.fontSize}`}>
      {tournaments.map((tournamentData, index) => (
        <Link
          key={`${tournamentData.tournament.id}-${tournamentData.result.groupId}`}
          href={`/results/${tournamentData.tournament.id}?groupId=${tournamentData.result.groupId}`}
          className={`block ${classes.padding} px-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
          style={{
            borderBottom: index < tournaments.length - 1 ? '1px solid' : 'none',
            borderColor: 'inherit'
          }}
        >
          <div className="flex justify-between items-start">
            <div className={`flex-1 flex flex-col ${classes.gap}`}>
              <h3 className={`font-medium text-gray-900 dark:text-white ${classes.titleSize}`}>
                {tournamentData.tournament.name}
              </h3>
              <div className={`flex flex-wrap gap-x-4 gap-y-0.5 ${classes.metaSize} text-gray-600 dark:text-gray-400`}>
                <span>{formatDateRange(tournamentData.tournament.start, tournamentData.tournament.end)}</span>
                {tournamentData.tournament.city && <span>{tournamentData.tournament.city}</span>}
              </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              {tournamentData.result.place && (
                <div className={`${classes.fontSize} font-medium text-gray-900 dark:text-white`}>
                  {t.place}: {tournamentData.result.place}
                </div>
              )}
              {tournamentData.result.points !== undefined && (
                <div className={`${classes.metaSize} text-gray-600 dark:text-gray-400`}>
                  {t.points}: {tournamentData.result.points}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}