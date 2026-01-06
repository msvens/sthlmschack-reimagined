// Main API exports
export { BaseApiService } from './base';

// Export all types
export * from './types';

// Export domain services
export { PlayerService } from './services/players';
export { OrganizationService } from './services/organizations';
export { TournamentService } from './services/tournaments';
export { ResultsService } from './services/results';
export { RatingsService } from './services/ratings';
export { RegistrationService } from './services/registration';

// Export utility functions
export { getPlayerTournaments, type PlayerTournamentData } from './utils/playerTournaments';
export { getPlayerRatingHistory } from './utils/ratingHistory';
export { sortTournamentResultsByDate, sortTournamentEndResultsByPlace, sortTournamentsByDate } from './utils/sortingUtils';
export { getPlayerRatingForTournament, formatPlayerRating, type PlayerRating } from './utils/ratingUtils';
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
