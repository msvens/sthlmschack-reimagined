import { BaseApiService } from './base';
import { PlayerInfo, TournamentResult, RoundResult, ApiResponse } from './types';

export class SsfApiService extends BaseApiService {
  constructor() {
    super('https://member.schack.se/public/api/v1');
  }

  /**
   * Get player information by SSF ID and date
   * @param ssfId - The Swedish Chess Federation player ID
   * @param date - Optional date (defaults to current date)
   * @returns Player information
   */
  async getPlayerInfo(
    ssfId: string,
    date?: string
  ): Promise<ApiResponse<PlayerInfo>> {
    const targetDate = date || this.getCurrentDate();
    const endpoint = `/player/${ssfId}/date/${targetDate}`;
    
    return this.get<PlayerInfo>(endpoint);
  }

  /**
   * Get player information for a specific player (using the SSF ID you provided)
   * @param date - Optional date (defaults to current date)
   * @returns Player information for SSF ID 642062
   */
  async getSpecificPlayerInfo(date?: string): Promise<ApiResponse<PlayerInfo>> {
    return this.getPlayerInfo('642062', date);
  }

  /**
   * Get tournament results by tournament ID
   * @param tournamentId - Tournament ID (e.g., 15816)
   * @returns Tournament results with player standings
   */
  async getTournamentResults(tournamentId: string): Promise<ApiResponse<TournamentResult[]>> {
    const endpoint = `/tournamentresults/table/id/${tournamentId}`;
    
    return this.get<TournamentResult[]>(endpoint);
  }

  /**
   * Get tournament round results by tournament ID
   * @param tournamentId - Tournament ID (e.g., 15816)
   * @returns Tournament round results with individual games
   */
  async getTournamentRoundResults(tournamentId: string): Promise<ApiResponse<RoundResult[]>> {
    const endpoint = `/tournamentresults/roundresults/id/${tournamentId}`;
    
    return this.get<RoundResult[]>(endpoint);
  }
}
