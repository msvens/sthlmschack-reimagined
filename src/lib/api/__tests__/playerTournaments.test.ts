/**
 * Integration tests for Player Tournaments utility function
 * Tests real API calls with known data points
 */

import { getPlayerTournaments } from '@/lib/api';
import { PlayerTournamentData } from '@/lib/api';
import { SSF_API_BASE_URL } from '../constants';
import { TEST_PLAYER_ID } from './test-data';

describe('Player Tournaments Utility Tests', () => {
  describe('getPlayerTournaments', () => {
    test('should fetch tournaments for test player', async () => {
      const response = await getPlayerTournaments(TEST_PLAYER_ID, SSF_API_BASE_URL);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        if (response.data.length > 0) {
          const playerTournamentData: PlayerTournamentData = response.data[0];

          // Test PlayerTournamentData structure
          expect(playerTournamentData.tournament).toBeDefined();
          expect(playerTournamentData.result).toBeDefined();

          // Test tournament data
          const tournament = playerTournamentData.tournament;
          expect(tournament.id).toBeDefined();
          expect(tournament.name).toBeDefined();
          expect(tournament.start).toBeDefined();
          expect(tournament.end).toBeDefined();
          expect(tournament.city).toBeDefined();

          // Test result data contains groupId
          const result = playerTournamentData.result;
          expect(result.groupId).toBeDefined();
          expect(typeof result.groupId).toBe('number');
          expect(result.groupId).toBeGreaterThan(0);
          expect(result.playerInfo).toBeDefined();
          if (result.playerInfo) {
            expect(result.playerInfo.id).toBe(TEST_PLAYER_ID);
          }
        }
      }
    }, 15000); // 15 second timeout for multiple API calls

    test('should handle invalid player ID gracefully', async () => {
      const response = await getPlayerTournaments(999999, SSF_API_BASE_URL);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, 10000);
  });
});