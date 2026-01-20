/**
 * Utility functions for formatting tournament results
 */

/**
 * Check if a player ID represents a walkover (missing player)
 * Negative IDs indicate walkovers: -1 is standard, but other negative values
 * like -200 are also used in some tournaments
 */
export function isWalkoverPlayer(playerId: number): boolean {
  return playerId < 0;
}

/**
 * Check if a club/organization ID represents a walkover (missing team)
 * Negative IDs like -100 indicate walkovers
 */
export function isWalkoverClub(clubId: number): boolean {
  return clubId < 0;
}

/**
 * Check if a game result indicates a walkover
 * @param result Game result value
 * @returns true if result indicates W.O (walkover)
 */
export function isWalkoverResult(result: number): boolean {
  return Math.abs(result) === 2;
}

/**
 * Check if a match has walkover conditions
 * @param homeId Home player/team ID
 * @param awayId Away player/team ID
 * @param result Game result (optional, for team tournaments)
 * @returns true if either player is missing or result indicates W.O
 */
export function isWalkover(homeId: number, awayId: number, result?: number): boolean {
  return isWalkoverPlayer(homeId) || isWalkoverPlayer(awayId) || (result !== undefined && isWalkoverResult(result));
}

/**
 * Format a game result from white's perspective
 * Used in team tournaments where games have result field
 * @param result Game result (1 = white wins, -1 = black wins, 0 = draw, 2 = white wins W.O, -2 = black wins W.O)
 * @param whiteId White player ID
 * @param blackId Black player ID
 * @returns Formatted result string
 */
export function formatGameResult(result: number, whiteId?: number, blackId?: number): string {
  const hasWalkover = (whiteId !== undefined && isWalkoverPlayer(whiteId)) ||
                      (blackId !== undefined && isWalkoverPlayer(blackId)) ||
                      isWalkoverResult(result);

  if (result === 2) {
    // White wins on W.O
    return '1 - 0 w.o';
  } else if (result === -2) {
    // Black wins on W.O
    return '0 - 1 w.o';
  } else if (result === 1) {
    // White wins
    return hasWalkover ? '1 - 0 w.o' : '1 - 0';
  } else if (result === -1) {
    // Black wins
    return hasWalkover ? '0 - 1 w.o' : '0 - 1';
  } else if (result === 0) {
    // Draw
    return '½ - ½';
  }
  return '-';
}

/**
 * Format a match result from home team's perspective
 * Used in individual tournaments where results have homeResult/awayResult
 * @param homeResult Home player/team result
 * @param awayResult Away player/team result
 * @param homeId Home player/team ID (optional, to check for W.O)
 * @param awayId Away player/team ID (optional, to check for W.O)
 * @returns Formatted result string
 */
export function formatMatchResult(
  homeResult: number | undefined,
  awayResult: number | undefined,
  homeId?: number,
  awayId?: number
): string {
  if (homeResult === undefined || awayResult === undefined) {
    return '-';
  }

  const hasWalkover = (homeId !== undefined && isWalkoverPlayer(homeId)) ||
                      (awayId !== undefined && isWalkoverPlayer(awayId));

  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}