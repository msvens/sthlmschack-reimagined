/**
 * Utility functions for filtering tournaments by category, type, and status.
 *
 * Status note: the API `state` field is unreliable — organizers routinely never
 * flip it from "registration" once an event has happened, so old finished
 * tournaments still report state=1. We therefore derive status from DATES
 * (`getTournamentStatus`) and treat `state` only as a weak hint. The detail
 * view uses the same helper, so list and detail agree.
 */

import { TournamentDto, TournamentType, TournamentState, isTeamTournament, parseLocalDate } from '@/lib/api';

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

/** Derived tournament status (from dates, not the unreliable API `state`). */
export type TournamentStatus = 'upcoming' | 'ongoing' | 'finished' | 'unknown';

export interface TournamentStatusInput {
  /** YYYY-MM-DD start date (tournament- or group-level). */
  start?: string | null;
  /** YYYY-MM-DD end date (tournament- or group-level). */
  end?: string | null;
  /** Raw API state — used only as a weak hint when dates can't decide. */
  state?: number | null;
  /** True if any round results exist — proves the event has started. */
  hasRoundResults?: boolean;
}

/**
 * Derive a tournament's status, trusting DATES over the API `state` field.
 *
 * Order matters: a past end date wins over `state` (that's what fixes the
 * stale-"registration" bug). Round results, when known, prove the event has
 * started. `state` is consulted only inside the date window or when no dates
 * are available at all (e.g. text-search stubs → `unknown`).
 */
export function getTournamentStatus(t: TournamentStatusInput, now: Date = new Date()): TournamentStatus {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const toMs = (d?: string | null): number | null => {
    if (!d) return null;
    const parsed = parseLocalDate(d).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  };
  const startMs = toMs(t.start);
  const endMs = toMs(t.end);

  // Results exist → it has started; finished only once past the end date.
  if (t.hasRoundResults) {
    return endMs !== null && todayMs > endMs ? 'finished' : 'ongoing';
  }
  // Past the end date → finished, regardless of the (unreliable) state field.
  if (endMs !== null && todayMs > endMs) return 'finished';
  // Before the start date → upcoming.
  if (startMs !== null && todayMs < startMs) return 'upcoming';
  // Inside the date window: honour an explicit registration state if present.
  if (t.state === TournamentState.REGISTRATION) return 'upcoming';
  if (startMs !== null || endMs !== null) return 'ongoing';
  // No dates at all: fall back to the raw state, else unknown.
  if (t.state === TournamentState.STARTED) return 'ongoing';
  if (t.state === TournamentState.FINISHED) return 'finished';
  return 'unknown';
}

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
 * Count tournaments by derived status. The bucket names are kept for the
 * existing filter UI: registration = upcoming, started = ongoing, finished =
 * finished. (`unknown` contributes only to `all`.)
 */
export function countByState(tournaments: TournamentDto[]): StateCounts {
  const counts: StateCounts = { all: 0, registration: 0, started: 0, finished: 0 };

  tournaments.forEach(t => {
    counts.all++;
    const status = getTournamentStatus(t);
    if (status === 'upcoming') {
      counts.registration++;
    } else if (status === 'ongoing') {
      counts.started++;
    } else if (status === 'finished') {
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
 * Filter tournaments by derived status. The `state` argument keeps the existing
 * filter-UI contract (the TournamentState enum values), but matching is done on
 * the date-derived status: REGISTRATION→upcoming, STARTED→ongoing,
 * FINISHED→finished. `null` returns everything.
 */
export function filterByState(
  tournaments: TournamentDto[],
  state: number | null
): TournamentDto[] {
  if (state === null) {
    return tournaments;
  }

  const target: TournamentStatus =
    state === TournamentState.REGISTRATION
      ? 'upcoming'
      : state === TournamentState.STARTED
        ? 'ongoing'
        : state === TournamentState.FINISHED
          ? 'finished'
          : 'unknown';

  return tournaments.filter(t => getTournamentStatus(t) === target);
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
