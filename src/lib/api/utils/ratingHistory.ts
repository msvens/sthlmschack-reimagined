import { PlayerService } from '../services/players';
import type { PlayerInfoDto, ApiResponse } from '../types';
import type { RatingDataPoint } from '@/components/player/EloRatingChart';

/**
 * Fetches player rating history for the past N months
 * @param playerId - The player's SSF ID
 * @param monthsBack - Number of months to look back (default: 12)
 * @returns Array of rating data points sorted by date (oldest to newest)
 */
export async function getPlayerRatingHistory(
  playerId: number,
  monthsBack: number = 12
): Promise<ApiResponse<RatingDataPoint[]>> {
  const playerService = new PlayerService();
  const dataPoints: RatingDataPoint[] = [];

  try {
    // Generate all dates
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < monthsBack; i++) {
      dates.push(new Date(today.getFullYear(), today.getMonth() - i, 1));
    }

    // Fetch all player info in parallel for better performance
    const responses = await Promise.all(
      dates.map(date => playerService.getPlayerInfo(playerId, date))
    );

    // Process responses from newest to oldest
    // Stop collecting once we hit a date with no ratings
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const date = dates[i];

      if (response.status === 200 && response.data?.elo) {
        const elo = response.data.elo;
        const hasAnyRating = elo.rating || elo.rapidRating || elo.blitzRating || response.data.lask?.rating;

        if (hasAnyRating) {
          dataPoints.push({
            date: formatDateForChart(date),
            standard: elo.rating || undefined,
            rapid: elo.rapidRating || undefined,
            blitz: elo.blitzRating || undefined,
            lask: response.data.lask?.rating || undefined
          });
        } else {
          // No ratings at this date - player likely didn't exist yet
          // Stop collecting earlier dates
          break;
        }
      } else {
        // Failed to fetch or no ELO data - stop here
        break;
      }
    }

    // Reverse to get oldest first (for chart display)
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
function formatDateForChart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}