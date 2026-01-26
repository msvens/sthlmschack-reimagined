'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/components/Link';
import { TournamentParticipation } from '@/context/PlayerContext';

export type TournamentListDensity = 'compact' | 'normal' | 'comfortable';

export interface DensityThresholds {
  /** Row count threshold for comfortable density (below this) */
  comfortable: number;
  /** Row count threshold for normal density (below this, above comfortable) */
  normal: number;
  /** Above normal threshold = compact */
}

export interface PlayerTournamentListProps {
  /** Tournament participation data to display */
  tournaments: TournamentParticipation[];
  /** Optional loading state */
  loading?: boolean;
  /** Translations object */
  t: {
    loading?: string;
    error?: string;
    noTournaments?: string;
    place: string;
    points: string;
    outcome: string;
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
  /** Whether this is for team tournaments (minor display variations) */
  isTeam?: boolean;
}

export function PlayerTournamentList({
  tournaments,
  loading = false,
  t,
  language = 'sv',
  density,
  densityThresholds = {
    comfortable: 10,
    normal: 25
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isTeam = false
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

  const formatCompactDate = (dateString: string): string => {
    try {
      // Use ISO format but remove leading zeros: "2025-06-27" → "2025-6-27"
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  const formatCompactDateRange = (start: string, end: string): string => {
    if (start === end) {
      return formatCompactDate(start);
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endMonth = endDate.getMonth() + 1;
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();

      // Same year: "6-27 - 7-6 2025"
      if (startYear === endYear) {
        return `${startMonth}-${startDay} - ${endMonth}-${endDay} ${endYear}`;
      } else {
        // Different years: "2024-12-27 - 2025-1-6"
        return `${startYear}-${startMonth}-${startDay} - ${endYear}-${endMonth}-${endDay}`;
      }
    } catch {
      return `${start} - ${end}`;
    }
  };

  const formatFullDate = (dateString: string) => {
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

  const formatFullDateRange = (start: string, end: string) => {
    if (start === end) {
      return formatFullDate(start);
    }
    const startFormatted = formatFullDate(start);
    const endFormatted = formatFullDate(end);
    return `${startFormatted} - ${endFormatted}`;
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
      {tournaments.map((tournamentData, index) => {
        // Group info is pre-computed in TournamentParticipation
        const { groupId, tournament, groupName, groupStartDate, groupEndDate, className, hasMultipleClasses } = tournamentData;
        const shouldShowClassName = hasMultipleClasses && className;

        return (
          <Link
            key={`${tournament.id}-${groupId}`}
            href={`/results/${tournament.id}/${groupId}`}
            color="inherit"
            underline="never"
            className={`block ${classes.padding} px-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
              index < tournaments.length - 1 ? 'border-b border-gray-900 dark:border-gray-200' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`flex-1 flex flex-col ${classes.gap}`}>
                <h3 className={`font-medium text-gray-900 dark:text-gray-200 ${classes.titleSize}`}>
                  {tournament.name}
                </h3>
                {/* Mobile: Class name (if applicable), group name, and compact date */}
                <div className={`md:hidden flex flex-wrap gap-x-2 ${classes.metaSize} text-gray-600 dark:text-gray-400`}>
                  {shouldShowClassName ? (
                    <span>{className}, {groupName}</span>
                  ) : (
                    groupName && <span>{groupName}</span>
                  )}
                  <span>•</span>
                  <span>{formatCompactDateRange(groupStartDate, groupEndDate)}</span>
                </div>
                {/* Desktop: Class name (if applicable), group name, full date, and city */}
                <div className={`hidden md:flex flex-wrap gap-x-4 gap-y-0.5 ${classes.metaSize} text-gray-600 dark:text-gray-400`}>
                  {shouldShowClassName ? (
                    <span>{className}, {groupName}</span>
                  ) : (
                    groupName && <span>{groupName}</span>
                  )}
                  <span>{formatFullDateRange(groupStartDate, groupEndDate)}</span>
                  {tournament.city && <span>{tournament.city}</span>}
                </div>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                {/* Total points and outcome (W/D/L) */}
                <div className={`${classes.fontSize} font-medium text-gray-900 dark:text-gray-200`}>
                  {t.points}: {tournamentData.totalPoints}
                </div>
                <div className={`${classes.metaSize} text-gray-600 dark:text-gray-400`}>
                  {t.outcome}: {tournamentData.wins}/{tournamentData.draws}/{tournamentData.losses}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}