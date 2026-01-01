/**
 * Utility for managing recent player searches in localStorage
 */

const STORAGE_KEY = 'recent-players';
const MAX_RECENT_PLAYERS = 10;

export interface RecentPlayer {
  id: number;
  name: string;
  club?: string;
}

/**
 * Get recent players from localStorage
 */
export function getRecentPlayers(): RecentPlayer[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const players = JSON.parse(stored);
    return Array.isArray(players) ? players : [];
  } catch (error) {
    console.error('Error reading recent players from localStorage:', error);
    return [];
  }
}

/**
 * Add a player to recent players list
 * Deduplicates by id and keeps last 10 unique players
 */
export function addRecentPlayer(player: RecentPlayer): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentPlayers();

    // Remove existing entry with same id (deduplicate)
    const filtered = recent.filter(p => p.id !== player.id);

    // Add new player to front
    const updated = [player, ...filtered].slice(0, MAX_RECENT_PLAYERS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent player to localStorage:', error);
  }
}

/**
 * Clear all recent players
 */
export function clearRecentPlayers(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recent players from localStorage:', error);
  }
}