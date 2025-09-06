/**
 * Integration tests for Player API service
 * Tests real API calls with known data points
 */

import { PlayerService } from '../index';
import { PlayerInfoDto } from '../types';

// Test constants
const TEST_PLAYER_ID = 642062; // Olle Svensson

describe('Player Service Integration Tests', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
  });

  describe('Player Information API', () => {
    test('should fetch player info with current date', async () => {
      const response = await playerService.getPlayerInfo(TEST_PLAYER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe('Olle');
        expect(player.lastName).toBe('Svensson');
        expect(player.club).toBe('SK Rockaden Sthlm');
        expect(typeof player.elo.rating).toBe('number');
        expect(player.lask).toBeDefined(); // Now returns MemberLASKRatingDTO, not null
      }
    }, 10000); // 10 second timeout for API calls

    test('should fetch player info with specific date', async () => {
      const testDate = new Date('2024-01-01');
      const response = await playerService.getPlayerInfo(TEST_PLAYER_ID, testDate);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
      }
    }, 10000);

    test('should get player info by FIDE ID', async () => {
      // TODO: Add test with known FIDE ID
      expect(true).toBe(true); // Placeholder
    }, 10000);

    test('should handle invalid player ID gracefully', async () => {
      const response = await playerService.getPlayerInfo(999999);

      // API might return 404 or empty data - we should handle both
      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });

  describe('Date Formatting', () => {
    test('should format dates correctly for API calls', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const formatted = playerService['formatDateToString'](testDate);

      expect(formatted).toBe('2024-03-15');
    });

    test('should handle current date formatting', () => {
      const currentFormatted = playerService['getCurrentDate']();

      // Should match YYYY-MM-DD format
      expect(currentFormatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Create a service with invalid base URL to test error handling
      const invalidService = new (class extends PlayerService {
        constructor() {
          super();
          this['baseUrl'] = 'https://invalid-url-that-does-not-exist.com/api';
        }
      })();

      const response = await invalidService.getPlayerInfo(TEST_PLAYER_ID);

      expect(response.error).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 10000);
  });
});
