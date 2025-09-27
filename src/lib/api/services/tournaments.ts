import { BaseApiService } from '../base';
import { SSF_LOCAL_API_BASE_URL } from '../constants';
import type { TournamentDto, TournamentSearchAnswerDto, ApiResponse } from '../types';

export class TournamentService extends BaseApiService {
  constructor(baseUrl: string = SSF_LOCAL_API_BASE_URL) {
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
  async searchTournaments(searchWord: string): Promise<ApiResponse<TournamentSearchAnswerDto[]>> {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;

    return this.get<TournamentSearchAnswerDto[]>(endpoint);
  }
}
