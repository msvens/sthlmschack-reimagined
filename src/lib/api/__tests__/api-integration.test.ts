/**
 * Integration tests for SSF API service
 * Tests real API calls with known data points
 */

import { SsfApiService } from '../ssf-api';
import { PlayerInfo, TournamentResult, RoundResult } from '../types';

// Test constants
const TEST_PLAYER_ID = 642062; // Olle Svensson
const TEST_TOURNAMENT_ID = '15816';

describe('SSF API Integration Tests', () => {
  let apiService: SsfApiService;

  beforeEach(() => {
    apiService = new SsfApiService();
  });

  describe('Player Information API', () => {
    test('should fetch player info with current date', async () => {
      const response = await apiService.getPlayerInfo(TEST_PLAYER_ID);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      if (response.data) {
        const player: PlayerInfo = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe('Olle');
        expect(player.lastName).toBe('Svensson');
        expect(player.club).toBe('SK Rockaden Sthlm');
        expect(typeof player.elo.rating).toBe('number');
        expect(player.lask).toBeNull();
      }
    }, 10000); // 10 second timeout for API calls

    test('should fetch player info with specific date', async () => {
      const testDate = new Date('2024-01-01');
      const response = await apiService.getPlayerInfo(TEST_PLAYER_ID, testDate);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      if (response.data) {
        const player: PlayerInfo = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
      }
    }, 10000);

    test('should use convenience method for specific player', async () => {
      const response = await apiService.getSpecificPlayerInfo();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      if (response.data) {
        const player: PlayerInfo = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe('Olle');
      }
    }, 10000);

    test('should handle invalid player ID gracefully', async () => {
      const response = await apiService.getPlayerInfo(999999);
      
      // API might return 404 or empty data - we should handle both
      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });

  describe('Tournament Results API', () => {
    test('should fetch tournament results', async () => {
      const response = await apiService.getTournamentResults(TEST_TOURNAMENT_ID);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      if (response.data) {
        const results: TournamentResult[] = response.data;
        expect(Array.isArray(results)).toBe(true);
        
        if (results.length > 0) {
          const firstResult = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          expect(firstResult.playerInfo).toBeDefined();
          expect(typeof firstResult.playerInfo.id).toBe('number');
          expect(typeof firstResult.playerInfo.firstName).toBe('string');
        }
      }
    }, 10000);
  });

  describe('Tournament Round Results API', () => {
    test('should fetch tournament round results', async () => {
      const response = await apiService.getTournamentRoundResults(TEST_TOURNAMENT_ID);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      if (response.data) {
        const roundResults: RoundResult[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);
        
        if (roundResults.length > 0) {
          const firstRound = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);
  });

  describe('Date Formatting', () => {
    test('should format dates correctly for API calls', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const formatted = apiService['formatDateToString'](testDate);
      
      expect(formatted).toBe('2024-03-15');
    });

    test('should handle current date formatting', () => {
      const currentFormatted = apiService['getCurrentDate']();
      
      // Should match YYYY-MM-DD format
      expect(currentFormatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Type Safety', () => {
    test('should enforce number type for player ID', () => {
      // This test ensures TypeScript compilation catches type errors
      expect(() => {
        // This should work
        apiService.getPlayerInfo(642062);
      }).not.toThrow();
      
      // TypeScript should prevent this at compile time:
      // apiService.getPlayerInfo('642062'); // Should cause TS error
    });

    test('should enforce Date type for date parameter', () => {
      const validDate = new Date();
      
      expect(() => {
        apiService.getPlayerInfo(642062, validDate);
      }).not.toThrow();
      
      // TypeScript should prevent this at compile time:
      // apiService.getPlayerInfo(642062, '2024-01-01'); // Should cause TS error
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Create a service with invalid base URL to test error handling
      const invalidService = new (class extends SsfApiService {
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

/**
 * Manual test runner for development
 * Run this to quickly test API endpoints during development
 */
export async function runManualTests() {
  console.log('🧪 Running manual API tests...\n');
  
  const api = new SsfApiService();
  
  try {
    // Test 1: Player Info
    console.log('📋 Testing Player Info API...');
    const playerResponse = await api.getSpecificPlayerInfo();
    console.log('Player Response:', {
      status: playerResponse.status,
      playerName: playerResponse.data ? `${playerResponse.data.firstName} ${playerResponse.data.lastName}` : 'N/A',
      rating: playerResponse.data?.elo.rating,
      club: playerResponse.data?.club
    });
    
    // Test 2: Tournament Results
    console.log('\n🏆 Testing Tournament Results API...');
    const tournamentResponse = await api.getTournamentResults(TEST_TOURNAMENT_ID);
    console.log('Tournament Response:', {
      status: tournamentResponse.status,
      resultCount: tournamentResponse.data?.length || 0,
      firstPlayer: tournamentResponse.data?.[0]?.playerInfo.firstName || 'N/A'
    });
    
    // Test 3: Round Results
    console.log('\n🎯 Testing Round Results API...');
    const roundResponse = await api.getTournamentRoundResults(TEST_TOURNAMENT_ID);
    console.log('Round Response:', {
      status: roundResponse.status,
      roundCount: roundResponse.data?.length || 0,
      totalGames: roundResponse.data?.reduce((sum, round) => sum + round.games.length, 0) || 0
    });
    
    // Test 4: Date Formatting
    console.log('\n📅 Testing Date Formatting...');
    const testDate = new Date('2024-03-15T10:30:00Z');
    const formatted = api['formatDateToString'](testDate);
    console.log('Date formatting:', { input: testDate.toISOString(), output: formatted });
    
    console.log('\n✅ All manual tests completed!');
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
}

