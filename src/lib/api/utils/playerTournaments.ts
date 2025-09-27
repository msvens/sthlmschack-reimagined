/**
 * Utility functions for fetching player tournament data
 * Combines multiple API services to provide comprehensive tournament information
 */

import { ResultsService } from '@/lib/api';
import { TournamentService } from '@/lib/api';
import type { TournamentDto, TournamentEndResultDto, ApiResponse } from '../types';
import { sortTournamentResultsByDate } from './sortingUtils';

/**
 * Player tournament data combining tournament info with player result
 */
export interface PlayerTournamentData {
  /** Tournament information */
  tournament: TournamentDto;
  /** Player's result in this tournament */
  result: TournamentEndResultDto;
}

/**
 * Get all tournaments that a player has participated in
 * @param memberId - The Swedish Chess Federation member ID
 * @param baseUrl - Optional base URL for API services (defaults to local API)
 * @returns Array of tournaments the player has participated in
 */
export async function getPlayerTournaments(
  memberId: number,
  baseUrl?: string
): Promise<ApiResponse<PlayerTournamentData[]>> {
  try {
    // Initialize services
    const resultsService = new ResultsService(baseUrl);
    const tournamentService = new TournamentService(baseUrl);

    // Step 1: Get member's tournament results
    const resultsResponse = await resultsService.getMemberTournamentResults(memberId);

    if (resultsResponse.status !== 200 || !resultsResponse.data) {
      return {
        data: [],
        status: resultsResponse.status,
        message: resultsResponse.error || 'Failed to fetch member tournament results',
        error: resultsResponse.error
      };
    }

    const memberResults: TournamentEndResultDto[] = resultsResponse.data;

    // If no results found, return empty array
    if (memberResults.length === 0) {
      return {
        data: [],
        status: 200,
        message: 'No tournament results found for member'
      };
    }

    // Step 2: Extract unique group IDs
    const groupIds = memberResults.map(result => result.groupId);

    // Step 3: Fetch tournament details for each group (parallel requests)
    const tournamentPromises = groupIds.map(groupId =>
      tournamentService.getTournamentFromGroup(groupId)
    );

    const tournamentResponses = await Promise.allSettled(tournamentPromises);

    // Step 4: Process results and combine with player results
    const playerTournamentData: PlayerTournamentData[] = [];
    const errors: string[] = [];

    tournamentResponses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        const apiResponse = response.value;
        if (apiResponse.status === 200 && apiResponse.data) {
          const tournament = apiResponse.data;
          const result = memberResults[index];

          playerTournamentData.push({
            tournament,
            result
          });
        } else {
          errors.push(`Failed to fetch tournament for group ${groupIds[index]}: ${apiResponse.error || 'Unknown error'}`);
        }
      } else {
        errors.push(`Request failed for group ${groupIds[index]}: ${response.reason}`);
      }
    });

    // Return results
    if (playerTournamentData.length === 0) {
      return {
        data: [],
        status: 404,
        message: 'No tournament details could be retrieved',
        error: errors.length > 0 ? errors.join('; ') : 'All tournament detail requests failed'
      };
    }

    // If some tournaments failed but others succeeded, log warnings but return successful ones
    if (errors.length > 0) {
      console.warn('Some tournament details could not be retrieved:', errors);
    }

    // Step 5: Sort tournaments by date (latest first)
    const sortedTournamentData = sortTournamentResultsByDate(playerTournamentData);

    return {
      data: sortedTournamentData,
      status: 200,
      message: `Successfully retrieved ${sortedTournamentData.length} tournament${sortedTournamentData.length === 1 ? '' : 's'}`
    };

  } catch (error) {
    return {
      data: [],
      status: 500,
      message: 'Internal error while fetching player tournaments',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

