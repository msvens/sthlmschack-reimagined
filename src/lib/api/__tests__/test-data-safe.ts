/**
 * Safe test data for API integration tests
 * Uses only verified IDs and provides fallbacks
 */

// VERIFIED IDs (from working tests)
export const VERIFIED_TOURNAMENT_ID = 5650; // SS 4 Springare JGP 2025
export const VERIFIED_PLAYER_ID = 642062; // Olle Svensson
export const VERIFIED_GROUP_ID = '15816'; // Team tournament group

// PLACEHOLDER IDs (need to be discovered)
export const PLACEHOLDER_FEDERATION_ID = 1; // TO BE DISCOVERED
export const PLACEHOLDER_DISTRICT_ID = 1; // TO BE DISCOVERED  
export const PLACEHOLDER_CLUB_ID = 1; // TO BE DISCOVERED

// Test configuration
export const TEST_TIMEOUT = 10000;
export const TEST_RATING_TYPE = 1; // Standard/Long game rating
export const TEST_RATING_CATEGORY = 0; // All players
export const TEST_RATING_DATE = new Date('2024-01-01');

// Expected values (from verified data)
export const EXPECTED_TOURNAMENT_NAME = 'SS 4 Springare JGP 2025';
export const EXPECTED_PLAYER_FIRST_NAME = 'Olle';
export const EXPECTED_PLAYER_LAST_NAME = 'Svensson';
export const EXPECTED_CLUB_NAME = 'SK Rockaden Sthlm';

// Test flags
export const ENABLE_DISCOVERY_TESTS = true; // Set to false when real IDs are found
export const ENABLE_PLACEHOLDER_TESTS = false; // Set to true to test with placeholders
