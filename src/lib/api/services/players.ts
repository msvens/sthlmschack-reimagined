import { BaseApiService } from '../base';
import { SSF_LOCAL_API_BASE_URL } from '../constants';
import type { PlayerInfoDto, ApiResponse } from '../types';

export class PlayerService extends BaseApiService {
  constructor(baseUrl: string = SSF_LOCAL_API_BASE_URL) {
    super(baseUrl);
  }

  // Player API methods

  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
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
}
