/**
 * Rating-related types for the Swedish Chess Federation API
 */

import { PlayerInfoDto } from "./player";

/**
 * Rating type constants for API queries
 * Used in rating list endpoints
 */
export enum RatingType {
    /** Long games (classical time control) */
    LONG_GAME = 1,
    /** Standard games (alias for LONG_GAME) */
    STANDARD = 1,
    /** Rapid games */
    RAPID = 6,
    /** Blitz games */
    BLITZ = 7
}

/**
 * Member category constants for API queries
 * Used to filter rating lists by member category
 */
export enum MemberCategory {
    /** All members */
    ALL = 0,
    /** Juniors */
    JUNIORS = 1,
    /** Cadets */
    CADETS = 2,
    /** Veterans */
    VETERANS = 4,
    /** Women */
    WOMEN = 5,
    /** Minors */
    MINORS = 6,
    /** Kids (Knattar) */
    KIDS = 7
}

/**
 * Player category constants (alias for MemberCategory)
 * Maintained for backward compatibility
 */
export enum PlayerCategory {
    /** All members */
    ALL = 0,
    /** Juniors */
    JUNIORS = 1,
    /** Cadets */
    CADETS = 2,
    /** Veterans */
    VETERANS = 4,
    /** Women */
    WOMEN = 5,
    /** Minors */
    MINORS = 6,
    /** Kids (Knattar) */
    KIDS = 7
}

/**
 * Type alias for rating list responses
 * Rating lists return arrays of PlayerInfoDto
 */
export type RatingListResponse = PlayerInfoDto[];
