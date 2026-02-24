/**
 * Utility for managing recent player searches in localStorage
 */

import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';

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
  try {
    const stored = safeGetItem(STORAGE_KEY);
    if (!stored) return [];

    const players = JSON.parse(stored);
    return Array.isArray(players) ? players : [];
  } catch {
    return [];
  }
}

/**
 * Add a player to recent players list
 * Deduplicates by id and keeps last 10 unique players
 */
export function addRecentPlayer(player: RecentPlayer): void {
  try {
    const recent = getRecentPlayers();

    // Remove existing entry with same id (deduplicate)
    const filtered = recent.filter(p => p.id !== player.id);

    // Add new player to front
    const updated = [player, ...filtered].slice(0, MAX_RECENT_PLAYERS);

    safeSetItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore — storage unavailable
  }
}

/**
 * Clear all recent players
 */
export function clearRecentPlayers(): void {
  safeRemoveItem(STORAGE_KEY);
}