/**
 * Integration tests for Tournament Structure API service
 * Tests real API calls with known data points
 */

import {ApiResponse, TournamentDto, TournamentService} from '../index';
import { CURRENT_TEST_API_URL } from '../constants';
import {
  TEST_TOURNAMENT_ID,
  TEST_TOURNAMENT_GROUP_ID,
  TEST_TOURNAMENT_CLASS_ID,
  TEST_SEARCH_TERM,
  TEST_LOCATION_TERM,
  EXPECTED_TOURNAMENT_NAME
} from './test-data';


describe('Tournament Service Integration Tests', () => {
  let tournamentService: TournamentService;

  beforeEach(() => {
    tournamentService = new TournamentService(CURRENT_TEST_API_URL);
    // Suppress unused variable warning for now
    void tournamentService;
  });

  describe('Tournament Structure API', () => {
    test('should fetch tournament by ID', async () => {
        const response = await tournamentService.getTournament(TEST_TOURNAMENT_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
        expect(response.data?.name).toBe(EXPECTED_TOURNAMENT_NAME);
    }, 10000);

    test('should fetch tournament by group ID', async () => {
        const response = await tournamentService.getTournamentFromGroup(TEST_TOURNAMENT_GROUP_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);

    }, 10000);

    test('should fetch tournament by class ID', async () => {
      const response = await tournamentService.getTournamentFromClass(TEST_TOURNAMENT_CLASS_ID);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
    }, 10000);
  });

  describe('Tournament Search API', () => {
    test('should search tournaments by name', async () => {
      const response = await tournamentService.searchTournaments(TEST_SEARCH_TERM);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.length).toBeGreaterThan(0);
      expect(response.data?.[0].name).toBe("SM-gruppen");
    
    }, 10000);

    test('should search tournaments by location', async () => {
      // TODO: Implement when test location terms are available
      expect(true).toBe(true); // Placeholder
    }, 10000);
  });
});
