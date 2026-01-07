import { BaseApiService } from '../base';
import type { TournamentDto, GroupSearchAnswerDto, ApiResponse } from '../types';
import type { BatchOptions, BatchResult } from './players';
import { deduplicateIds, chunkArray } from '../utils/batchUtils';

export class TournamentService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Tournament Structure API methods

  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/group/id/${groupId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/class/id/${classId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Search for tournament groups by name or location
   * @param searchWord - Search term for tournament/group name or location
   * @returns Array of matching tournament groups with basic information
   */
  async searchGroups(searchWord: string): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint);
  }

  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId?: number): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/coming/${districtId}`
      : '/tournament/group/coming';

    return this.get<TournamentDto[]>(endpoint);
  }

  /**
   * Search for tournaments with results updated within a date range
   * Returns complete tournament objects (not just groups).
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournaments with results updated within the date range
   * @example
   * // Find tournaments with updated results in December 2024
   * searchUpdatedTournamentsByTournament('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   */
  async searchUpdatedTournaments(
    startDate: string,
    endDate: string,
    districtId?: number
  ): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<TournamentDto[]>(endpoint);
  }

  /**
   * Search for tournament groups with results updated within a date range
   * @deprecated Use searchUpdatedTournamentsByTournament() instead - returns full TournamentDto[] instead of group summaries
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournament groups that started within the date range
   * @example
   * // Find tournaments that started in December 2024 (may still be running)
   * searchUpdatedTournaments('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   */
  async searchUpdatedGroups(
    startDate: string,
    endDate: string,
    districtId?: number
  ): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint);
  }

  /**
   * Fetch tournament information for multiple tournament IDs in batches
   *
   * @param tournamentIds - Array of tournament IDs to fetch
   * @param options - Batch processing options
   * @returns BatchResult containing successfully fetched tournaments and any errors
   *
   * @remarks
   * - **Deduplicates input IDs** - Duplicate IDs are removed before making API calls
   * - Results may not be in the same order as input IDs
   * - Failed fetches are returned in the errors array
   * - Processes requests in batches to avoid overwhelming the API
   *
   * @example
   * ```typescript
   * // Input: [1, 2, 2, 3] -> Deduped: [1, 2, 3] -> 3 API calls
   * const result = await tournamentService.getTournamentsBatch([1, 2, 2, 3]);
   * console.log(`Fetched ${result.data.length} tournaments`);
   * ```
   */
  async getTournamentsBatch(
    tournamentIds: number[],
    options: BatchOptions = {}
  ): Promise<BatchResult<TournamentDto>> {
    const { concurrency = 10 } = options;

    // Deduplicate IDs before processing
    const uniqueIds = deduplicateIds(tournamentIds);
    const chunks = chunkArray(uniqueIds, concurrency);

    const data: TournamentDto[] = [];
    const errors: Array<{ id: number; error: string }> = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const results = await Promise.allSettled(
        chunk.map(id => this.getTournament(id))
      );

      // Collect results and errors
      results.forEach((result, index) => {
        const tournamentId = chunk[index];
        if (result.status === 'fulfilled' && result.value.data) {
          data.push(result.value.data);
        } else if (result.status === 'fulfilled' && result.value.error) {
          errors.push({ id: tournamentId, error: result.value.error });
        } else if (result.status === 'rejected') {
          errors.push({
            id: tournamentId,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
    }

    return { data, errors };
  }

  /**
   * Fetch tournament information for multiple group IDs in batches
   * Note: This fetches the tournament that contains each group
   *
   * @param groupIds - Array of group IDs to fetch tournaments for
   * @param options - Batch processing options
   * @returns BatchResult containing successfully fetched tournaments and any errors
   *
   * @remarks
   * - **Deduplicates input IDs** - Duplicate IDs are removed before making API calls
   * - Results may not be in the same order as input IDs
   * - Failed fetches are returned in the errors array
   * - Processes requests in batches to avoid overwhelming the API
   * - May return duplicate tournaments if multiple groups belong to same tournament
   *
   * @example
   * ```typescript
   * // Input: [1, 2, 2, 3] -> Deduped: [1, 2, 3] -> 3 API calls
   * const result = await tournamentService.getGroupsBatch([1, 2, 2, 3]);
   * console.log(`Fetched ${result.data.length} tournaments`);
   * ```
   */
  async getGroupsBatch(
    groupIds: number[],
    options: BatchOptions = {}
  ): Promise<BatchResult<TournamentDto>> {
    const { concurrency = 10 } = options;

    // Deduplicate IDs before processing
    const uniqueIds = deduplicateIds(groupIds);
    const chunks = chunkArray(uniqueIds, concurrency);

    const data: TournamentDto[] = [];
    const errors: Array<{ id: number; error: string }> = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const results = await Promise.allSettled(
        chunk.map(id => this.getTournamentFromGroup(id))
      );

      // Collect results and errors
      results.forEach((result, index) => {
        const groupId = chunk[index];
        if (result.status === 'fulfilled' && result.value.data) {
          data.push(result.value.data);
        } else if (result.status === 'fulfilled' && result.value.error) {
          errors.push({ id: groupId, error: result.value.error });
        } else if (result.status === 'rejected') {
          errors.push({
            id: groupId,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
    }

    return { data, errors };
  }
}
