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
export { getPlayerRatingForTournament, getPlayerRatingByAlgorithm, formatPlayerRating, formatRatingWithType, getKFactorForRating, formatPlayerName, getRatingTypeFromRoundRated, getPlayerRatingByRoundType, isJuniorPlayer, RoundRatedType, type PlayerRating, type RatingType, type RoundRatedTypeValue } from './utils/ratingUtils';
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
  isWalkoverClub,
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
export {
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter,
  countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter
} from './utils/teamFormatting';
export {
  // Constants
  PointSystem,
  ResultCode,
  ResultDisplay,
  PointValues,
  // Types
  type PointSystemType,
  type ResultCodeType,
  type GameOutcome,
  type ParsedGameResult,
  // Functions
  getPointSystemFromResult,
  isWhiteWin,
  isBlackWin,
  isDraw,
  isWalkoverResultCode,
  isTouristBye,
  isCountableResult,
  getGameOutcome,
  calculatePoints,
  getResultDisplayString,
  parseGameResult,
  getPlayerOutcome,
  getPlayerPoints,
  getPointSystemName
} from './utils/gameResults';
