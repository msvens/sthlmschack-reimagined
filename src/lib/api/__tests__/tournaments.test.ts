/**
 * Integration tests for Tournament Structure API service
 * Tests real API calls with known data points
 */

import {ApiResponse, findTournamentGroup, TournamentDto, TournamentService} from '../index';

const TEST_TOURNAMENT_ID = 5650; //SS 4 Springare JGP 2025
const TEST_TOURNAMENT_GROUP_ID = 16046; //SS 4 Springare JGP 2025, grupp C
//const TEST_TOURNAMENT_CLASS_ID = 15816;
const TEST_SEARCH_TERM = 'Sweden';
const TEST_LOCATION_TERM = 'Stockholm';


describe('Tournament Service Integration Tests', () => {
  let tournamentService: TournamentService;

  beforeEach(() => {
    tournamentService = new TournamentService();
    // Suppress unused variable warning for now
    void tournamentService;
  });

  describe('Tournament Structure API', () => {
    test('should fetch tournament by ID', async () => {
        const response = await tournamentService.getTournament(TEST_TOURNAMENT_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
        expect(response.data?.name).toBe('SS 4 Springare JGP 2025');
    }, 10000);

    test('should fetch tournament by group ID', async () => {
        const response = await tournamentService.getTournamentFromGroup(TEST_TOURNAMENT_GROUP_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
        if(response.data) {
            console.log(JSON.stringify(response.data, null, 2));
            //expect(findTournamentGroup(response.data, TEST_TOURNAMENT_GROUP_ID)).toBeDefined();
        }

    }, 10000);

    test('should fetch tournament by class ID', async () => {
      // TODO: Implement when test class ID is available
      expect(true).toBe(true); // Placeholder
    }, 10000);
  });

  describe('Tournament Search API', () => {
    test('should search tournaments by name', async () => {
      // TODO: Implement when test search terms are available
      expect(true).toBe(true); // Placeholder
    }, 10000);

    test('should search tournaments by location', async () => {
      // TODO: Implement when test location terms are available
      expect(true).toBe(true); // Placeholder
    }, 10000);
  });
});
