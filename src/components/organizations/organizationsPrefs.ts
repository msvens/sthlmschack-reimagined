/**
 * localStorage-backed tab preference for the organizations page, mirroring
 * calendarPrefs. Guards against SSR and unavailable storage.
 */
const TAB_KEY = 'organizations-active-tab';

export type OrganizationsTab = 'clubs' | 'map' | 'districts' | 'ssf';

const TABS: readonly OrganizationsTab[] = ['clubs', 'map', 'districts', 'ssf'];

export function isOrganizationsTab(v: string | null | undefined): v is OrganizationsTab {
  return !!v && (TABS as readonly string[]).includes(v);
}

export function getSavedTab(): OrganizationsTab | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(TAB_KEY);
    return isOrganizationsTab(v) ? v : null;
  } catch {
    return null;
  }
}

export function setSavedTab(tab: OrganizationsTab): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TAB_KEY, tab);
  } catch {
    /* storage unavailable — ignore */
  }
}
