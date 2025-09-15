/**
 * Integration tests for Tournament Results API service
 * Tests real API calls with known data points
 */

import { ResultsService } from '../index';
import { TeamTournamentEndResultDto, TournamentEndResultDto, TournamentRoundResultDto } from '../types';
import { SSF_API_BASE_URL } from '../constants';
import { 
  TEST_RESULTS_GROUP_ID,
  TEST_RESULTS_TEAM_GROUP_ID,
  TEST_RESULTS_MEMBER_ID
} from './test-data';

describe('Results Service Integration Tests', () => {
  let resultsService: ResultsService;

  beforeEach(() => {
    resultsService = new ResultsService(SSF_API_BASE_URL);
  });

  describe('Tournament Results API', () => {
    test('should fetch tournament results', async () => {
      const response = await resultsService.getTournamentResults(TEST_RESULTS_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          expect(firstResult.playerInfo).toBeDefined();
          expect(typeof firstResult.playerInfo.id).toBe('number');
          expect(typeof firstResult.playerInfo.firstName).toBe('string');
        }
      }
    }, 10000);

    test('should fetch team tournament results', async () => {
      const response = await resultsService.getTeamTournamentResults(TEST_RESULTS_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TeamTournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TeamTournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          expect(typeof firstResult.teamNumber).toBe('number');
        }
      }
    }, 10000);

    test('should fetch member tournament results', async () => {
      const response = await resultsService.getMemberTournamentResults(TEST_RESULTS_MEMBER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          // playerInfo might be null for some results
          if (firstResult.playerInfo) {
            expect(typeof firstResult.playerInfo.id).toBe('number');
            expect(typeof firstResult.playerInfo.firstName).toBe('string');
          }
        }
      }
    }, 10000);
  });

  describe('Tournament Round Results API', () => {
    test('should fetch tournament round results', async () => {
      const response = await resultsService.getTournamentRoundResults(TEST_RESULTS_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);

    test('should fetch team round results', async () => {
      const response = await resultsService.getTeamRoundResults(TEST_RESULTS_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);

    test('should fetch team member round results', async () => {
      const response = await resultsService.getTeamMemberRoundResults(TEST_RESULTS_TEAM_GROUP_ID, TEST_RESULTS_MEMBER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);
  });
});
