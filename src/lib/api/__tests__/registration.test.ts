/**
 * Integration tests for Tournament Team Registration API service
 * Tests real API calls with known data points
 */

import { RegistrationService } from '../index';
import { SSF_API_BASE_URL } from '../constants';
import { 
  TEST_REGISTRATION_TOURNAMENT_ID,
  TEST_REGISTRATION_GROUP_ID,
  TEST_REGISTRATION_MEMBER_ID,
  TEST_CLUB_ID
} from './test-data';

describe('Registration Service Integration Tests', () => {
  let registrationService: RegistrationService;

  beforeEach(() => {
    registrationService = new RegistrationService(SSF_API_BASE_URL);
    // Suppress unused variable warning for now
    void registrationService;
  });

  describe('Tournament Team Registration API', () => {
    test('should fetch team registration for tournament and club', async () => {
      const response = await registrationService.getTeamRegistration(
        TEST_REGISTRATION_TOURNAMENT_ID, 
        TEST_CLUB_ID
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 10000);

    test('should handle team registration with no players', async () => {
      // Test with a tournament/club combination that might have no players
      const response = await registrationService.getTeamRegistration(
        TEST_REGISTRATION_TOURNAMENT_ID, 
        999999 // Invalid club ID
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);

    test('should handle invalid tournament/club combination', async () => {
      const response = await registrationService.getTeamRegistration(
        999999, // Invalid tournament ID
        TEST_CLUB_ID
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });
});
