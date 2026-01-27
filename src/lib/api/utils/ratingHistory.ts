import { PlayerService } from '../services/players';
import type { ApiResponse } from '../types';
import type { RatingDataPoint } from '@/components/player/EloRatingChart';

/**
 * Fetches player rating history for a date range
 * @param playerId - The player's SSF ID
 * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
 * @param endMonth - End month in YYYY-MM format (default: current month)
 * @returns Array of rating data points sorted by date (oldest to newest)
 */
export async function getPlayerRatingHistory(
  playerId: number,
  startMonth?: string,
  endMonth?: string
): Promise<ApiResponse<RatingDataPoint[]>> {
  const playerService = new PlayerService();

  try {
    const response = await playerService.getPlayerEloHistory(playerId, startMonth, endMonth);

    if (response.status !== 200 || !response.data) {
      return {
        status: response.status,
        error: response.error || 'Failed to fetch rating history'
      };
    }

    // Map PlayerRatingHistory[] to RatingDataPoint[] for chart
    const dataPoints: RatingDataPoint[] = response.data.map(history => ({
      date: formatDateForChart(history.elo.date),
      standard: history.elo.rating || undefined,
      rapid: history.elo.rapidRating || undefined,
      blitz: history.elo.blitzRating || undefined,
      lask: history.lask?.rating || undefined
    }));

    // Reverse to get oldest first (for chart display)
    // getPlayerEloHistory returns latest first, chart wants oldest first
    dataPoints.reverse();

    return {
      status: 200,
      data: dataPoints
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to fetch rating history'
    };
  }
}

/**
 * Format date as YYYY-MM for chart display
 */
function formatDateForChart(dateString: string): string {
  // dateString is in format YYYY-MM-DD, extract YYYY-MM
  return dateString.substring(0, 7);
}