/**
 * Utility functions for handling chess ratings based on tournament types
 */

import { MemberFIDERatingDTO } from '@/lib/api';
import { RatingAlgorithm } from '@/lib/api/types/ratingAlgorithm';

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
export function parseTimeControl(thinkingTime: string | null | undefined): 'standard' | 'rapid' | 'blitz' {
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
 * Type of rating used
 */
export type RatingType = 'standard' | 'rapid' | 'blitz' | 'lask';

/**
 * Result of getting a player's rating for a tournament
 */
export interface PlayerRating {
  /** The rating value, or null if no rating available */
  rating: number | null;
  /** Whether this is a fallback to standard rating (marked with *) */
  isFallback: boolean;
  /** The type of rating that was used */
  ratingType: RatingType | null;
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
    return { rating: null, isFallback: false, ratingType: null };
  }

  const timeControl = parseTimeControl(thinkingTime);

  switch (timeControl) {
    case 'standard':
      // Standard tournament: only show standard rating
      return {
        rating: elo.rating || null,
        isFallback: false,
        ratingType: elo.rating ? 'standard' : null
      };

    case 'rapid':
      // Rapid tournament: prefer rapid, fallback to standard
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: 'rapid' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case 'blitz':
      // Blitz tournament: prefer blitz, fallback to standard
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: 'blitz' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };
  }
}

/**
 * Format a player's rating for display based on tournament time control
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Formatted rating string (e.g., "2100", "1950 S", "-")
 *
 * @example
 * ```ts
 * const displayRating = formatPlayerRating(player.elo, "10 min + 5 sek/drag");
 * // Returns: "1416" (rapid rating for rapid tournament)
 * // or "1950 S" (standard rating as fallback if no rapid rating)
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

  // Option 2: Clean display for matching rating type, suffix " S" for standard fallback
  return `${rating}${isFallback ? ' S' : ''}`;
}

/**
 * Format a player's rating with language-sensitive suffix based on rating type
 *
 * Always shows rating type suffix for clarity:
 * - Standard: no suffix
 * - Rapid: " S" (Swedish - Snabb) / " R" (English - Rapid)
 * - Blitz: " B" (both languages - Blixt/Blitz)
 * - LASK: " L" (both languages)
 *
 * @param rating - The rating value
 * @param ratingType - The type of rating ('standard' | 'rapid' | 'blitz' | 'lask')
 * @param language - Language for suffix ('sv' | 'en')
 * @returns Formatted rating string with appropriate suffix
 *
 * @example
 * ```ts
 * formatRatingWithType(1638, 'rapid', 'sv') // "1638 S"
 * formatRatingWithType(1638, 'rapid', 'en') // "1638 R"
 * formatRatingWithType(1638, 'standard', 'sv') // "1638"
 * formatRatingWithType(1638, 'blitz', 'en') // "1638 B"
 * ```
 */
export function formatRatingWithType(
  rating: number | null,
  ratingType: RatingType | null,
  language: 'sv' | 'en' = 'sv'
): string {
  if (rating === null) {
    return '-';
  }

  // Determine suffix based on rating type and language
  let suffix = '';
  if (ratingType) {
    switch (ratingType) {
      case 'standard':
        // No suffix for standard
        suffix = '';
        break;
      case 'rapid':
        // S (Snabb) in Swedish, R (Rapid) in English
        suffix = language === 'sv' ? ' S' : ' R';
        break;
      case 'blitz':
        // B (Blixt/Blitz) in both languages
        suffix = ' B';
        break;
      case 'lask':
        // L for LASK in both languages
        suffix = ' L';
        break;
    }
  }

  return `${rating}${suffix}`;
}

/**
 * Get the appropriate rating for a player based on the tournament's ranking algorithm
 *
 * This uses the group-level rankingAlgorithm field which explicitly specifies
 * which rating system to use and in what priority order.
 *
 * @param elo - Player's FIDE rating information
 * @param rankingAlgorithm - The ranking algorithm from TournamentClassGroupDto
 * @returns Object with rating value and fallback flag
 */
/**
 * Get the appropriate K-factor for ELO calculations based on rating type
 *
 * FIDE K-factor rules:
 * - Rapid/Blitz: K=40 (always, regardless of rating level)
 * - Standard: K=20 for <2400, K=10 for 2400+
 * - LASK: K=20 (treating it like standard)
 *
 * @param ratingType - The type of rating being used
 * @param playerRating - The player's rating value
 * @param playerElo - Optional player ELO data (contains k-factor if available)
 * @returns K-factor to use for calculations
 */
export function getKFactorForRating(
  ratingType: RatingType | null,
  playerRating: number | null,
  playerElo?: MemberFIDERatingDTO | null
): number {
  // First check if player has a specific K-factor in their data
  if (playerElo?.k) {
    return playerElo.k;
  }

  // If no rating or rating type, default to standard K=20
  if (!ratingType || !playerRating) {
    return 20;
  }

  // Apply FIDE K-factor rules based on rating type
  switch (ratingType) {
    case 'rapid':
    case 'blitz':
      // Rapid and Blitz always use K=40
      return 40;

    case 'standard':
    case 'lask':
      // Standard and LASK use K=20 for <2400, K=10 for 2400+
      return playerRating >= 2400 ? 10 : 20;

    default:
      return 20;
  }
}

export function getPlayerRatingByAlgorithm(
  elo: MemberFIDERatingDTO | null | undefined,
  rankingAlgorithm: number | null | undefined
): PlayerRating {
  if (!elo) {
    return { rating: null, isFallback: false, ratingType: null };
  }

  if (!rankingAlgorithm) {
    // Fallback to standard if no algorithm specified
    return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
  }

  switch (rankingAlgorithm) {
    case RatingAlgorithm.STANDARD_ELO:
      // Standard ELO only
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };

    case RatingAlgorithm.RAPID_ELO:
      // Rapid ELO only
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? 'rapid' : null };

    case RatingAlgorithm.BLITZ_ELO:
      // Blitz ELO only
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? 'blitz' : null };

    case RatingAlgorithm.IF_ELO_THEN_ELO_OTHERWISE_LASK:
      // Use standard ELO if available, otherwise LASK
      // Note: LASK ratings not available through elo parameter, only returns standard ELO
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.LASK:
      // LASK rating only
      // Note: LASK ratings not available through elo parameter (requires separate lask object)
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.MAX_ELO_LASK:
      // Maximum of ELO and LASK
      // Note: LASK ratings not available through elo parameter, only returns standard ELO
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };

    case RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO:
      // Priority: Blitz > Standard > Rapid
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: 'blitz' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: 'rapid' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO:
      // Priority: Standard > Rapid > Blitz
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: 'standard' };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: 'rapid' };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: 'blitz' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO:
      // Priority: Rapid > Standard > Blitz
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: 'rapid' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: 'blitz' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.NO_RATING:
      // No rating calculation
      return { rating: null, isFallback: false, ratingType: null };

    default:
      // Unknown algorithm, fall back to standard
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
  }
}