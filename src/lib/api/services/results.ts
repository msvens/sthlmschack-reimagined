import { BaseApiService } from '../base';
import { SSF_API_BASE_URL, SSF_LOCAL_API_BASE_URL } from '../constants';
import type { TournamentEndResultDto, TournamentRoundResultDto, TeamTournamentEndResultDto, ApiResponse } from '../types';

export class ResultsService extends BaseApiService {
  constructor(baseUrl: string = SSF_LOCAL_API_BASE_URL) {
    super(baseUrl);
  }

  // Tournament Results API methods

  /**
   * Get individual tournament results by group ID
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament results with player standings
   */
  async getTournamentResults(groupId: number): Promise<ApiResponse<TournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/table/id/${groupId}`;

    return this.get<TournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get tournament round results by group ID
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament round results with individual games
   */
  async getTournamentRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/roundresults/id/${groupId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }

  /**
   * Get team tournament results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament results with club standings
   */
  async getTeamTournamentResults(groupId: number): Promise<ApiResponse<TeamTournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/team/table/id/${groupId}`;

    return this.get<TeamTournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get team tournament round results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament round results
   */
  async getTeamRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }

  /**
   * Get individual tournament results for a specific member
   * @param memberId - Member ID
   * @returns Array of tournament results for the member
   */
  async getMemberTournamentResults(memberId: number): Promise<ApiResponse<TournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/table/memberid/${memberId}`;

    return this.get<TournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get team tournament round results for a specific member
   * @param groupId - Tournament group ID
   * @param memberId - Member ID
   * @returns Team tournament round results for the specific member
   */
  async getTeamMemberRoundResults(groupId: number, memberId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}/memberid/${memberId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }
}
