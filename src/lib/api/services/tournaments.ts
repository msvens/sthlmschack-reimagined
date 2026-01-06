import { BaseApiService } from '../base';
import type { TournamentDto, TournamentSearchAnswerDto, ApiResponse } from '../types';

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
  async searchTournaments(searchWord: string): Promise<ApiResponse<TournamentSearchAnswerDto[]>> {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;

    return this.get<TournamentSearchAnswerDto[]>(endpoint);
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
  async searchUpdatedTournamentsByTournament(
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
  async searchUpdatedTournaments(
    startDate: string,
    endDate: string,
    districtId?: number
  ): Promise<ApiResponse<TournamentSearchAnswerDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<TournamentSearchAnswerDto[]>(endpoint);
  }
}
