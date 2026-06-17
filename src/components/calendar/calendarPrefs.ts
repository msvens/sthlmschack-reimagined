/**
 * Small localStorage-backed preferences for the calendar page: which top tab
 * (list/calendar) was last active, which calendar view (week/month), and the
 * anchor date last viewed. All reads/writes guard against SSR and storage
 * being unavailable.
 */
import { parseLocalDate } from '@/lib/api';

const TAB_KEY = 'calendar-active-tab';
const VIEW_KEY = 'calendar-view-mode';
const ANCHOR_KEY = 'calendar-anchor';

export type CalendarTab = 'calendar' | 'list' | 'map';
export type CalendarViewMode = 'week' | 'month';

function read(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getSavedTab(): CalendarTab | null {
  const v = read(TAB_KEY);
  return v === 'calendar' || v === 'list' || v === 'map' ? v : null;
}

export function setSavedTab(tab: CalendarTab): void {
  write(TAB_KEY, tab);
}

export function getSavedView(): CalendarViewMode | null {
  const v = read(VIEW_KEY);
  return v === 'week' || v === 'month' ? v : null;
}

export function setSavedView(view: CalendarViewMode): void {
  write(VIEW_KEY, view);
}

/** Stored as a YYYY-MM-DD local date key. */
export function getSavedAnchor(): Date | null {
  const v = read(ANCHOR_KEY);
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const date = parseLocalDate(v);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function setSavedAnchor(date: Date): void {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  write(ANCHOR_KEY, `${y}-${m}-${d}`);
}
