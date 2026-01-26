/**
 * ELO rating calculation utilities based on FIDE formulas
 *
 * These are approximations used for display purposes only.
 * Official ratings are calculated by FIDE monthly.
 */

/**
 * Calculate expected score for a player against an opponent
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @returns Expected score (0.0 to 1.0)
 *
 * Formula: E = 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate rating change for a single game
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param actualScore - Actual game result (1.0 = win, 0.5 = draw, 0.0 = loss)
 * @param kFactor - K-factor for rating calculation (typically 40 for juniors, 20 for adults, 10 for 2400+)
 * @returns Rating change (can be positive or negative)
 *
 * Formula: ΔR = K × (ActualScore - ExpectedScore)
 */
export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  actualScore: number,
  kFactor: number
): number {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const ratingChange = kFactor * (actualScore - expectedScore);
  return Math.round(ratingChange * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate performance rating for a tournament
 *
 * Uses the inverse ELO formula to calculate performance rating.
 *
 * @param opponentRatings - Array of opponent ratings
 * @param score - Total score (wins + 0.5 × draws)
 * @returns Performance rating
 *
 * Formula: Performance = Average opponent rating + d
 * where d = -400 × log10((1/p) - 1) and p is the score percentage
 *
 * Special cases:
 * - 100% score: Use average opponent rating + 800
 * - 0% score: Use average opponent rating - 800
 */
export function calculatePerformanceRating(
  opponentRatings: number[],
  score: number
): number {
  if (opponentRatings.length === 0) {
    return 0;
  }

  const averageOpponentRating = opponentRatings.reduce((sum, rating) => sum + rating, 0) / opponentRatings.length;
  const scorePercentage = score / opponentRatings.length;

  // Special cases for 100% and 0%
  if (scorePercentage === 1.0) {
    return Math.round(averageOpponentRating + 800);
  }
  if (scorePercentage === 0.0) {
    return Math.round(averageOpponentRating - 800);
  }

  // Use inverse ELO formula: d = -400 * log10((1/p) - 1)
  // This is derived by solving the expected score formula for rating difference
  const ratingDifference = -400 * Math.log10((1 / scorePercentage) - 1);
  const performanceRating = averageOpponentRating + ratingDifference;

  return Math.round(performanceRating);
}

/**
 * Calculate total rating change and performance rating for a tournament
 *
 * @param matches - Array of match results
 * @returns Object containing total rating change and performance rating
 */
export interface MatchResult {
  opponentRating: number | null;
  actualScore: number; // 1.0 = win, 0.5 = draw, 0.0 = loss
}

export interface TournamentRatingStats {
  totalChange: number;
  performanceRating: number;
  gamesWithRatedOpponents: number;
}

export function calculateTournamentStats(
  matches: MatchResult[],
  playerRating: number,
  kFactor: number
): TournamentRatingStats {
  let totalChange = 0;
  const ratedOpponentRatings: number[] = [];
  let totalScore = 0;

  for (const match of matches) {
    // Only include matches where opponent has a valid rating (not null, undefined, 0, or NaN)
    if (match.opponentRating && match.opponentRating > 0) {
      // Calculate rating change for this match
      const change = calculateRatingChange(
        playerRating,
        match.opponentRating,
        match.actualScore,
        kFactor
      );
      totalChange += change;

      // Track for performance rating calculation
      ratedOpponentRatings.push(match.opponentRating);
      totalScore += match.actualScore;
    }
  }

  const performanceRating = calculatePerformanceRating(ratedOpponentRatings, totalScore);

  return {
    totalChange: Math.round(totalChange * 10) / 10, // Round to 1 decimal
    performanceRating,
    gamesWithRatedOpponents: ratedOpponentRatings.length
  };
}