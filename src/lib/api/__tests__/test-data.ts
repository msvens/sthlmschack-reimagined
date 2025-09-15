import { PlayerCategory, RatingType } from "../types";

/**
 * Centralized test data for API integration tests
 * Contains real IDs and test constants for the Swedish Chess Federation API
 */

// Tournament test data
export const TEST_TOURNAMENT_ID = 5650; // SS 4 Springare JGP 2025
export const TEST_TOURNAMENT_GROUP_ID = 16046; // SS 4 Springare JGP 2025, grupp C
export const TEST_TOURNAMENT_CLASS_ID = 6451; // SS 4 Springare JGP 2025 class
export const TEST_TEAM_TOURNAMENT_GROUP_ID = 15816; // Team tournament group
export const TEST_SEARCH_TERM = 'Stockholm';
export const TEST_LOCATION_TERM = 'Stockholm';

// Player test data
export const TEST_PLAYER_ID = 642062; // Olle Svensson
export const TEST_PLAYER_FIDE_ID = 1786741; //Olle Svensson
export const TEST_PLAYER_NAME = 'Olle Svensson';
export const TEST_PLAYER_CLUB = 'SK Rockaden Sthlm';
export const TEST_PLAYER_DATE = new Date('2024-01-01');

// Organization test data
export const TEST_FEDERATION_ID = 1; // Swedish Chess Federation
export const TEST_DISTRICT_ID = 1; // Example district ID
export const TEST_CLUB_ID = 38464;
export const TEST_CLUB_NAME = 'SK Rockaden Sthlm';
export const TEST_ORGANIZATION_ID = 5821; // From tournament data

// Rating test data
export const TEST_RATING_TYPE = RatingType.STANDARD; // Standard/Long game rating
export const TEST_RATING_CATEGORY = PlayerCategory.JUNIORS; // Juniorer
export const TEST_RATING_DATE = new Date('2024-01-01');

// Registration test data
export const TEST_REGISTRATION_TOURNAMENT_ID = 5650;
export const TEST_REGISTRATION_GROUP_ID = 16044; // SS 4 Springare JGP 2025, grupp A
export const TEST_REGISTRATION_MEMBER_ID = 642062;

// Results test data
export const TEST_RESULTS_GROUP_ID = 15816;
export const TEST_RESULTS_MEMBER_ID = 642062;
export const TEST_RESULTS_TEAM_GROUP_ID = 15667; //Skollags SM 2025
export const TEST_RESULTS_ROUND_NUMBER = 1;

// Search and filter test data
export const TEST_SEARCH_QUERY = 'Stockholm';
export const TEST_DATE_FROM = new Date('2024-01-01');
export const TEST_DATE_TO = new Date('2024-12-31');
export const TEST_CITY = 'Stockholm';
export const TEST_ARENA = 'Stockholms Schacksalonger';

// Expected values for assertions
export const EXPECTED_TOURNAMENT_NAME = 'SS 4 Springare JGP 2025';
export const EXPECTED_PLAYER_FIRST_NAME = 'Olle';
export const EXPECTED_PLAYER_LAST_NAME = 'Svensson';
export const EXPECTED_CLUB_NAME = 'SK Rockaden Sthlm';
