/**
 * Utility functions for filtering tournaments by category, type, and state
 */

import { TournamentDto, TournamentType, TournamentState, isTeamTournament } from '@/lib/api';

// =============================================================================
// Types
// =============================================================================

export type TournamentCategory = 'all' | 'team' | 'individual';

export interface CategoryCounts {
  all: number;
  team: number;
  individual: number;
}

export interface StateCounts {
  all: number;
  registration: number;
  started: number;
  finished: number;
}

export type TypeCounts = Record<number | 'all', number>;

// =============================================================================
// Count Functions
// =============================================================================

/**
 * Count tournaments by category (team vs individual)
 */
export function countByCategory(tournaments: TournamentDto[]): CategoryCounts {
  const counts: CategoryCounts = { all: 0, team: 0, individual: 0 };

  tournaments.forEach(t => {
    counts.all++;
    if (isTeamTournament(t.type)) {
      counts.team++;
    } else {
      counts.individual++;
    }
  });

  return counts;
}

/**
 * Count tournaments by type
 */
export function countByType(tournaments: TournamentDto[]): TypeCounts {
  const counts: TypeCounts = { all: tournaments.length };

  tournaments.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  return counts;
}

/**
 * Count tournaments by state
 */
export function countByState(tournaments: TournamentDto[]): StateCounts {
  const counts: StateCounts = { all: 0, registration: 0, started: 0, finished: 0 };

  tournaments.forEach(t => {
    counts.all++;
    if (t.state === TournamentState.REGISTRATION) {
      counts.registration++;
    } else if (t.state === TournamentState.STARTED) {
      counts.started++;
    } else if (t.state === TournamentState.FINISHED) {
      counts.finished++;
    }
  });

  return counts;
}

// =============================================================================
// Filter Functions
// =============================================================================

/**
 * Filter tournaments by category
 */
export function filterByCategory(
  tournaments: TournamentDto[],
  category: TournamentCategory
): TournamentDto[] {
  if (category === 'all') {
    return tournaments;
  }

  return tournaments.filter(t => {
    const isTeam = isTeamTournament(t.type);
    return category === 'team' ? isTeam : !isTeam;
  });
}

/**
 * Filter tournaments by type
 * @param type - Tournament type number, or null for all types
 */
export function filterByType(
  tournaments: TournamentDto[],
  type: number | null
): TournamentDto[] {
  if (type === null) {
    return tournaments;
  }

  return tournaments.filter(t => t.type === type);
}

/**
 * Filter tournaments by state
 * @param state - Tournament state number, or null for all states
 */
export function filterByState(
  tournaments: TournamentDto[],
  state: number | null
): TournamentDto[] {
  if (state === null) {
    return tournaments;
  }

  return tournaments.filter(t => t.state === state);
}

// =============================================================================
// Tournament Type Helpers
// =============================================================================

/**
 * Get all tournament types for filter options
 */
export function getAllTournamentTypes(): number[] {
  return [
    TournamentType.ALLSVENSKAN,
    TournamentType.INDIVIDUAL,
    TournamentType.SM_TREE,
    TournamentType.SCHOOL_SM,
    TournamentType.SVENSKA_CUPEN,
    TournamentType.GRAND_PRIX,
    TournamentType.YES2CHESS,
    TournamentType.SCHACKFYRAN,
  ];
}

/**
 * Get tournament type name key for translations
 */
export function getTournamentTypeKey(type: number): string {
  switch (type) {
    case TournamentType.ALLSVENSKAN:
      return 'allsvenskan';
    case TournamentType.INDIVIDUAL:
      return 'individual';
    case TournamentType.SM_TREE:
      return 'smTree';
    case TournamentType.SCHOOL_SM:
      return 'schoolSm';
    case TournamentType.SVENSKA_CUPEN:
      return 'svenskaCupen';
    case TournamentType.GRAND_PRIX:
      return 'grandPrix';
    case TournamentType.YES2CHESS:
      return 'yes2chess';
    case TournamentType.SCHACKFYRAN:
      return 'schackfyran';
    default:
      return 'unknown';
  }
}
