// Main API exports
export { BaseApiService } from './base';

// Export all types
export * from './types';

// Export domain services
export { PlayerService, type BatchOptions, type BatchItemResult } from './services/players';
export { OrganizationService } from './services/organizations';
export { TournamentService } from './services/tournaments';
export { ResultsService } from './services/results';
export { RatingsService } from './services/ratings';
export { RegistrationService } from './services/registration';

// Export utility functions
export { getPlayerRatingHistory } from './utils/ratingHistory';
export { sortTournamentEndResultsByPlace, sortTournamentsByDate } from './utils/sortingUtils';
export { getPlayerRatingForTournament, getPlayerRatingByAlgorithm, formatPlayerRating, formatRatingWithType, getKFactorForRating, type PlayerRating, type RatingType } from './utils/ratingUtils';
export { RatingAlgorithm, type RatingAlgorithmType } from './types/ratingAlgorithm';
export {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats,
  type MatchResult,
  type TournamentRatingStats
} from './utils/eloCalculations';
export {
  isWalkoverPlayer,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult
} from './utils/resultFormatting';
export {
  findTournamentGroup,
  getGroupName,
  type TournamentGroupResult
} from './utils/tournamentGroupUtils';
