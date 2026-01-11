import { GameDto, PlayerInfoDto, TournamentDto } from '../types';
import { parseTimeControl, formatPlayerRating } from './ratingUtils';

export interface TournamentInfo {
  groupId: number;
  tournamentId: number;
  name: string;
  timeControl: 'standard' | 'rapid' | 'blitz';
}

export interface OpponentStats {
  opponentId: number;
  opponentName: string;
  opponentRating: string;
  wins: number;
  draws: number;
  losses: number;
  totalGames: number;
  tournamentCount: number;
  tournaments: TournamentInfo[];
}

export interface GameDisplay {
  gameId: number;
  whiteId: number;
  whiteName: string;
  blackId: number;
  blackName: string;
  result: string;  // "1-0", "½-½", "0-1"
  groupId: number;
  tournamentId: number;
  tournamentName: string;
  date?: string;  // Optional for future use
}

export interface ColorStats {
  wins: number;
  draws: number;
  losses: number;
}

/**
 * Calculate game result from player's perspective
 * @param game - The game data
 * @param playerId - The player ID to calculate result for
 * @returns 'win', 'draw', or 'loss' from the player's perspective
 */
export function calculatePlayerResult(
  game: GameDto,
  playerId: number
): 'win' | 'draw' | 'loss' {
  const isWhite = game.whiteId === playerId;

  // game.result is from white's perspective: 1=white win, 0=draw, -1=black win
  if (game.result === 0) return 'draw';

  if (isWhite) {
    return game.result === 1 ? 'win' : 'loss';  // 1=win, -1=loss
  } else {
    return game.result === -1 ? 'win' : 'loss';  // -1=win, 1=loss
  }
}

/**
 * Filter games by time control
 * @param games - Array of games
 * @param tournamentMap - Map of group ID to tournament data
 * @param timeControl - Time control to filter by ('all' returns all games)
 * @returns Filtered array of games
 */
export function filterGamesByTimeControl(
  games: GameDto[],
  tournamentMap: Map<number, TournamentDto>,
  timeControl: 'all' | 'standard' | 'rapid' | 'blitz'
): GameDto[] {
  if (timeControl === 'all') {
    return games;
  }

  return games.filter(game => {
    const tournament = tournamentMap.get(game.groupiD);
    const tournamentTimeControl = parseTimeControl(tournament?.thinkingTime) || 'standard';
    return tournamentTimeControl === timeControl;
  });
}

/**
 * Calculate statistics split by color (all, white, black)
 *
 * Note: Only counts games with standard results (-1, 0, 1).
 * Other result codes found in data but excluded:
 *  - 2: W.O. win (walkover win for white)
 *  - -2: W.O. loss (walkover loss for white)
 *  - 3: Possibly not played/cancelled
 *  - -4: Possibly forfeit loss
 *  - 10: Unknown status
 *
 * These special cases are excluded from statistics as they don't represent
 * actual played head-to-head matches.
 *
 * TODO: Verify exact meaning of non-standard result codes with schack.se:
 *  - Confirm if result codes 2/-2/3/-4/10 should always be excluded
 *  - Check if there's official documentation for these codes
 *  - Consider if any should be included in stats (e.g., 2/-2 as W.O. wins/losses)
 *  - Stats now match old UI after filtering (minor rounding differences may remain)
 *
 * @param games - Array of games
 * @param playerId - The player ID
 * @returns Statistics object with all, white, and black breakdown
 */
export function calculateStatsByColor(
  games: GameDto[],
  playerId: number
): {
  all: ColorStats;
  white: ColorStats;
  black: ColorStats;
} {
  const all: ColorStats = { wins: 0, draws: 0, losses: 0 };
  const white: ColorStats = { wins: 0, draws: 0, losses: 0 };
  const black: ColorStats = { wins: 0, draws: 0, losses: 0 };

  games.forEach(game => {
    // Only process games with standard results (actual played games)
    // Skip W.O., forfeits, cancelled games, etc.
    if (game.result !== -1 && game.result !== 0 && game.result !== 1) {
      return; // Skip non-standard results
    }

    const result = calculatePlayerResult(game, playerId);
    const isWhite = game.whiteId === playerId;

    // Update all stats
    if (result === 'win') all.wins++;
    else if (result === 'draw') all.draws++;
    else all.losses++;

    // Update color-specific stats
    if (isWhite) {
      if (result === 'win') white.wins++;
      else if (result === 'draw') white.draws++;
      else white.losses++;
    } else {
      if (result === 'win') black.wins++;
      else if (result === 'draw') black.draws++;
      else black.losses++;
    }
  });

  return { all, white, black };
}

/**
 * Aggregate games into opponent statistics
 * @param games - Array of games
 * @param playerId - The player ID
 * @param playerMap - Map of player ID to player info
 * @param tournamentMap - Map of group ID to tournament data
 * @returns Array of opponent statistics
 */
export function aggregateOpponentStats(
  games: GameDto[],
  playerId: number,
  playerMap: Map<number, PlayerInfoDto>,
  tournamentMap: Map<number, TournamentDto>
): OpponentStats[] {
  // Group games by opponent
  const opponentRecords = new Map<number, {
    wins: number;
    draws: number;
    losses: number;
    groupIds: Set<number>;
  }>();

  games.forEach(game => {
    // Determine opponent ID (skip W.O games with opponent ID -1)
    const opponentId = game.whiteId === playerId ? game.blackId : game.whiteId;
    if (opponentId === -1) return;  // Skip W.O games

    const result = calculatePlayerResult(game, playerId);
    const record = opponentRecords.get(opponentId) || {
      wins: 0,
      draws: 0,
      losses: 0,
      groupIds: new Set<number>()
    };

    // Increment W/D/L
    if (result === 'win') record.wins++;
    else if (result === 'draw') record.draws++;
    else record.losses++;

    // Add tournament (Set deduplicates)
    record.groupIds.add(game.groupiD);

    opponentRecords.set(opponentId, record);
  });

  // Build OpponentStats array
  const stats: OpponentStats[] = [];

  opponentRecords.forEach((record, opponentId) => {
    const opponent = playerMap.get(opponentId);
    const opponentName = opponent
      ? `${opponent.firstName} ${opponent.lastName}`
      : `Unknown Player (${opponentId})`;

    const opponentRating = opponent && opponent.elo
      ? formatPlayerRating(opponent.elo, null)
      : '-';

    // Build tournament list
    const tournaments: TournamentInfo[] = Array.from(record.groupIds).map(groupId => {
      const tournament = tournamentMap.get(groupId);
      const timeControl = parseTimeControl(tournament?.thinkingTime) || 'standard';
      return {
        groupId,
        tournamentId: tournament?.id || 0,
        name: tournament?.name || `Group ${groupId}`,
        timeControl
      };
    });

    stats.push({
      opponentId,
      opponentName,
      opponentRating,
      wins: record.wins,
      draws: record.draws,
      losses: record.losses,
      totalGames: record.wins + record.draws + record.losses,
      tournamentCount: record.groupIds.size,
      tournaments
    });
  });

  return stats;
}

/**
 * Sort opponent stats by various criteria
 * @param stats - Array of opponent statistics
 * @param sortBy - Sort criteria ('games', 'name', 'winRate')
 * @returns Sorted array of opponent statistics
 */
export function sortOpponentStats(
  stats: OpponentStats[],
  sortBy: 'games' | 'name' | 'winRate'
): OpponentStats[] {
  const sorted = [...stats];

  switch (sortBy) {
    case 'games':
      sorted.sort((a, b) => b.totalGames - a.totalGames);
      break;
    case 'name':
      sorted.sort((a, b) => a.opponentName.localeCompare(b.opponentName));
      break;
    case 'winRate':
      sorted.sort((a, b) => {
        const aRate = a.totalGames > 0 ? a.wins / a.totalGames : 0;
        const bRate = b.totalGames > 0 ? b.wins / b.totalGames : 0;
        return bRate - aRate;
      });
      break;
  }

  return sorted;
}

/**
 * Format game result as string (e.g., "1-0", "0.5-0.5", "0-1")
 * @param result - Game result (1=white win, 0=draw, -1=black win from white's perspective)
 * @returns Formatted result string
 */
export function formatGameResult(result: number): string {
  if (result === 1) return '1-0';
  if (result === 0) return '0.5-0.5';
  if (result === -1) return '0-1';
  return '-';
}

/**
 * Convert filtered games to display format with player names
 *
 * Note: Only displays games with standard results (-1, 0, 1).
 * Filters out W.O., forfeits, cancelled games (result codes: 2, -2, 3, -4, 10).
 *
 * @param games - Array of games (oldest-first from API)
 * @param playerId - Current player ID
 * @param playerMap - Map of player info
 * @param tournamentMap - Map of tournament info
 * @param currentPlayerName - Current player's full name
 * @returns Array of games ready for display (latest-first order)
 */
export function gamesToDisplayFormat(
  games: GameDto[],
  playerId: number,
  playerMap: Map<number, PlayerInfoDto>,
  tournamentMap: Map<number, TournamentDto>,
  currentPlayerName: string
): GameDisplay[] {
  const displayGames: GameDisplay[] = [];

  games.forEach(game => {
    // Skip games with non-standard results (W.O., forfeits, cancelled, etc.)
    if (game.result !== -1 && game.result !== 0 && game.result !== 1) return;

    // Skip W.O games with missing players
    if (game.whiteId === -1 || game.blackId === -1) return;

    // Get player names
    const whitePlayer = game.whiteId === playerId
      ? null
      : playerMap.get(game.whiteId);
    const blackPlayer = game.blackId === playerId
      ? null
      : playerMap.get(game.blackId);

    const whiteName = game.whiteId === playerId
      ? currentPlayerName
      : whitePlayer
        ? `${whitePlayer.firstName} ${whitePlayer.lastName}`
        : `Unknown (${game.whiteId})`;

    const blackName = game.blackId === playerId
      ? currentPlayerName
      : blackPlayer
        ? `${blackPlayer.firstName} ${blackPlayer.lastName}`
        : `Unknown (${game.blackId})`;

    // Get tournament info
    const tournament = tournamentMap.get(game.groupiD);

    displayGames.push({
      gameId: game.id,
      whiteId: game.whiteId,
      whiteName,
      blackId: game.blackId,
      blackName,
      result: formatGameResult(game.result),
      groupId: game.groupiD,
      tournamentId: tournament?.id || 0,
      tournamentName: tournament?.name || `Group ${game.groupiD}`
    });
  });

  // Reverse to show latest games first (API returns oldest-first)
  return displayGames.reverse();
}