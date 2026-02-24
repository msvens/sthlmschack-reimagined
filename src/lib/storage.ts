/**
 * Safe localStorage wrapper that gracefully handles unavailable storage
 * (private browsing, disabled cookies, storage quota exceeded, etc.)
 */

let storageAvailableCache: boolean | null = null;

/** Test whether localStorage is available and writable */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  if (storageAvailableCache != null) return storageAvailableCache;

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    storageAvailableCache = true;
  } catch {
    storageAvailableCache = false;
  }
  return storageAvailableCache;
}

/** Safe localStorage.getItem — returns null if storage is unavailable */
export function safeGetItem(key: string): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage.setItem — silently fails if storage is unavailable */
export function safeSetItem(key: string, value: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or blocked — ignore
  }
}

/** Safe localStorage.removeItem — silently fails if storage is unavailable */
export function safeRemoveItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Blocked — ignore
  }
}