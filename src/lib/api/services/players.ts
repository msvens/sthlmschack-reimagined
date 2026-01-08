import { BaseApiService } from '../base';
import type { PlayerInfoDto, ApiResponse } from '../types';
import { chunkArray } from '../utils/batchUtils';

/**
 * Options for batch processing
 */
export interface BatchOptions {
  /** Number of parallel requests to execute at once (default: 10, use Infinity for unlimited) */
  concurrency?: number;
}

/**
 * Result of a single batch item
 * Either contains data or an error, never both
 */
export type BatchItemResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

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
   * @param playerIds - Array of player IDs to fetch (duplicates allowed, order preserved)
   * @param date - Optional date filter (defaults to current date)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   *
   * @remarks
   * - **Preserves input order** - results[i] corresponds to playerIds[i]
   * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
   * - Processes requests in batches to avoid overwhelming the API
   * - Use concurrency: Infinity for maximum parallelism
   *
   * @example
   * ```typescript
   * const results = await playerService.getPlayerInfoBatch([1, 2, 2, 3]);
   * results.forEach((result, i) => {
   *   if (result.data) {
   *     console.log(`Player ${playerIds[i]}:`, result.data);
   *   } else {
   *     console.error(`Player ${playerIds[i]} failed:`, result.error);
   *   }
   * });
   * ```
   */
  async getPlayerInfoBatch(
    playerIds: number[],
    date?: Date,
    options: BatchOptions = {}
  ): Promise<BatchItemResult<PlayerInfoDto>[]> {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(playerIds, concurrency);

    const results: BatchItemResult<PlayerInfoDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getPlayerInfo(id, date))
      );

      // Collect results in order
      responses.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === 'fulfilled' && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === 'rejected') {
          results.push({
            data: null,
            error: response.reason?.message || 'Unknown error'
          });
        }
      });
    }

    return results;
  }
}
