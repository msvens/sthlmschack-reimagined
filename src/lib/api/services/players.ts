import { BaseApiService } from '../base';
import type { PlayerInfoDto, ApiResponse } from '../types';
import { deduplicateIds, chunkArray } from '../utils/batchUtils';

/**
 * Options for batch processing
 */
export interface BatchOptions {
  /** Number of parallel requests to execute at once (default: 10) */
  concurrency?: number;
}

/**
 * Result of a batch operation
 */
export interface BatchResult<T> {
  /** Successfully fetched items */
  data: T[];
  /** Failed fetches with error details */
  errors: Array<{ id: number; error: string }>;
}

export class PlayerService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Player API methods

  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   *
   * @returns Player information
   */
  async getPlayerInfo(
    playerId: number,
    date?: Date
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint);
  }

  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @returns Player information
   */
  async getPlayerByFIDEId(
    fideId: number,
    date?: Date
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint);
  }

  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: förnamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @returns Array of matching players
   */
  async searchPlayer(
    fornamn: string,
    efternamn: string
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;

    return this.get<PlayerInfoDto[]>(endpoint);
  }

  /**
   * Fetch player information for multiple player IDs in batches
   *
   * @param playerIds - Array of player IDs to fetch
   * @param date - Optional date filter (defaults to current date)
   * @param options - Batch processing options
   * @returns BatchResult containing successfully fetched players and any errors
   *
   * @remarks
   * - **Deduplicates input IDs** - Duplicate IDs are removed before making API calls
   * - Results may not be in the same order as input IDs
   * - Failed fetches are returned in the errors array
   * - Processes requests in batches to avoid overwhelming the API
   *
   * @example
   * ```typescript
   * // Input: [1, 2, 2, 3, 3, 3] -> Deduped: [1, 2, 3] -> 3 API calls
   * const result = await playerService.getPlayerInfoBatch([1, 2, 2, 3, 3, 3]);
   * console.log(`Fetched ${result.data.length} players`);
   * ```
   */
  async getPlayerInfoBatch(
    playerIds: number[],
    date?: Date,
    options: BatchOptions = {}
  ): Promise<BatchResult<PlayerInfoDto>> {
    const { concurrency = 10 } = options;

    // Deduplicate IDs before processing
    const uniqueIds = deduplicateIds(playerIds);
    const chunks = chunkArray(uniqueIds, concurrency);

    const data: PlayerInfoDto[] = [];
    const errors: Array<{ id: number; error: string }> = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const results = await Promise.allSettled(
        chunk.map(id => this.getPlayerInfo(id, date))
      );

      // Collect results and errors
      results.forEach((result, index) => {
        const playerId = chunk[index];
        if (result.status === 'fulfilled' && result.value.data) {
          data.push(result.value.data);
        } else if (result.status === 'fulfilled' && result.value.error) {
          errors.push({ id: playerId, error: result.value.error });
        } else if (result.status === 'rejected') {
          errors.push({
            id: playerId,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
    }

    return { data, errors };
  }
}
