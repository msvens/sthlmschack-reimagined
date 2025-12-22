/**
 * Utility functions for handling chess ratings based on tournament types
 */

import { MemberFIDERatingDTO } from '@/lib/api';

/**
 * Parse thinkingTime string to determine tournament time control type
 *
 * Examples:
 * - "10 min + 5 sek/drag" → Rapid (10 min)
 * - "3 min + 2 sek/drag" → Blitz (3 min)
 * - "90+15 min +30 sek/drag" → Standard (105 min)
 *
 * FIDE time control rules:
 * - Blitz: < 10 minutes
 * - Rapid: 10-60 minutes
 * - Standard: > 60 minutes or unspecified
 */
function parseTimeControl(thinkingTime: string | null | undefined): 'standard' | 'rapid' | 'blitz' {
  if (!thinkingTime) {
    return 'standard'; // Default to standard if no time control specified
  }

  // Extract all numbers before "min" in the string
  // Handles formats like "10 min", "90+15 min", "3 min"
  const minutesMatch = thinkingTime.match(/(\d+)(?:\+(\d+))?\s*min/i);

  if (!minutesMatch) {
    return 'standard'; // Can't parse, assume standard
  }

  // Calculate total base time in minutes
  const baseMinutes = parseInt(minutesMatch[1], 10);
  const additionalMinutes = minutesMatch[2] ? parseInt(minutesMatch[2], 10) : 0;
  const totalMinutes = baseMinutes + additionalMinutes;

  // Apply FIDE time control classification
  if (totalMinutes < 10) {
    return 'blitz';
  } else if (totalMinutes <= 60) {
    return 'rapid';
  } else {
    return 'standard';
  }
}

/**
 * Result of getting a player's rating for a tournament
 */
export interface PlayerRating {
  /** The rating value, or null if no rating available */
  rating: number | null;
  /** Whether this is a fallback to standard rating (marked with *) */
  isFallback: boolean;
}

/**
 * Get the appropriate FIDE rating for a player based on tournament time control
 *
 * Logic:
 * - Standard tournament: Show standard rating, or null if not available
 * - Rapid tournament: Show rapid rating, or standard rating (marked as fallback), or null
 * - Blitz tournament: Show blitz rating, or standard rating (marked as fallback), or null
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Object with rating value and fallback flag
 *
 * @example
 * ```ts
 * const { rating, isFallback } = getPlayerRatingForTournament(player.elo, "10 min + 5 sek/drag");
 * const displayRating = rating ? `${rating}${isFallback ? '*' : ''}` : '-';
 * ```
 */
export function getPlayerRatingForTournament(
  elo: MemberFIDERatingDTO | null | undefined,
  thinkingTime: string | null | undefined
): PlayerRating {
  if (!elo) {
    return { rating: null, isFallback: false };
  }

  const timeControl = parseTimeControl(thinkingTime);

  switch (timeControl) {
    case 'standard':
      // Standard tournament: only show standard rating
      return {
        rating: elo.rating || null,
        isFallback: false
      };

    case 'rapid':
      // Rapid tournament: prefer rapid, fallback to standard
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true };
      }
      return { rating: null, isFallback: false };

    case 'blitz':
      // Blitz tournament: prefer blitz, fallback to standard
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true };
      }
      return { rating: null, isFallback: false };
  }
}

/**
 * Format a player's rating for display based on tournament time control
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Formatted rating string (e.g., "2100", "1950*", "-")
 *
 * @example
 * ```ts
 * const displayRating = formatPlayerRating(player.elo, "10 min + 5 sek/drag");
 * // Returns: "1416" (rapid rating for rapid tournament)
 * // or "1950*" (standard rating as fallback if no rapid rating)
 * // or "-" (no rating available)
 * ```
 */
export function formatPlayerRating(
  elo: MemberFIDERatingDTO | null | undefined,
  thinkingTime: string | null | undefined
): string {
  const { rating, isFallback } = getPlayerRatingForTournament(elo, thinkingTime);

  if (rating === null) {
    return '-';
  }

  return `${rating}${isFallback ? '*' : ''}`;
}