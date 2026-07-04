/**
 * localStorage-backed preferences for the Junior/JGP page (selected division and
 * season year). Mirrors organizationsPrefs; guards SSR and unavailable storage.
 */
import type { JgpDivision } from '@/data/jgp/types';

const DIVISION_KEY = 'junior-jgp-division';
const YEAR_KEY = 'junior-jgp-year';

const DIVISIONS: readonly JgpDivision[] = ['open', 'girls'];

export function isDivision(v: string | null | undefined): v is JgpDivision {
  return !!v && (DIVISIONS as readonly string[]).includes(v);
}

export function getSavedDivision(): JgpDivision | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(DIVISION_KEY);
    return isDivision(v) ? v : null;
  } catch {
    return null;
  }
}

export function setSavedDivision(division: JgpDivision): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DIVISION_KEY, division);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getSavedYear(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(YEAR_KEY);
    const n = v ? Number.parseInt(v, 10) : Number.NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setSavedYear(year: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(YEAR_KEY, String(year));
  } catch {
    /* storage unavailable — ignore */
  }
}
