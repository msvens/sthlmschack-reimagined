'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from '@/components/Link';
import { useOrganizations } from '@/context/OrganizationsContext';
import { type Language } from '@/context/LanguageContext';
import { parseLocalDate, type TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { getTournamentTypeKey } from '@/lib/utils/tournamentFilters';
import { getTypeSwatchClasses } from './calendarColors';

interface DayEventsPopoverProps {
  date: Date;
  events: TournamentDto[];
  language: Language;
  onClose: () => void;
}

/**
 * Lightweight popover listing a day's events with full detail. Anchored inside
 * the (relatively positioned) day cell; closes on outside-click and Escape.
 * After mount it measures itself against the viewport and flips up/left so it
 * never opens off-screen.
 */
export function DayEventsPopover({ date, events, language, onClose }: DayEventsPopoverProps) {
  const t = getTranslation(language);
  const { getOrganizerName } = useOrganizations();
  const ref = useRef<HTMLDivElement>(null);

  const locale = language === 'sv' ? 'sv-SE' : 'en-US';
  const headerFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const rangeFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const typeLabels = t.components.tournamentTypeFilter;

  // Measure against the viewport and place the popover directly on the node
  // (no React state → no cascading renders) so it never opens off-screen.
  // The decision uses the anchor's geometry + the popover's own size, so it
  // doesn't depend on the current placement (no flip ping-pong).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anchor = (el.parentElement ?? el).getBoundingClientRect();
    const margin = 8;
    const roomBelow = window.innerHeight - anchor.bottom;
    const dropUp = roomBelow < el.offsetHeight + margin && anchor.top > roomBelow;
    const pinRight = anchor.left + el.offsetWidth + margin > window.innerWidth;

    el.style.top = dropUp ? 'auto' : '100%';
    el.style.bottom = dropUp ? '100%' : 'auto';
    el.style.marginTop = dropUp ? '0' : '4px';
    el.style.marginBottom = dropUp ? '4px' : '0';
    el.style.left = pinRight ? 'auto' : '0';
    el.style.right = pinRight ? '0' : 'auto';
  }, [events, language]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  function formatRange(tournament: TournamentDto): string {
    const start = rangeFmt.format(parseLocalDate(tournament.start));
    if (!tournament.end || tournament.end === tournament.start) return start;
    return `${start} – ${rangeFmt.format(parseLocalDate(tournament.end))}`;
  }

  function typeLabel(type: number): string {
    const key = getTournamentTypeKey(type) as keyof typeof typeLabels;
    return key in typeLabels ? typeLabels[key] : '';
  }

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      style={{ top: '100%', left: 0, marginTop: 4 }}
      className="absolute z-30 w-64 max-w-[80vw] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-2 text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">
        {headerFmt.format(date)}
      </div>

      <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto">
        {events.map((tournament) => (
          <li key={tournament.id} className="flex gap-2">
            <span
              aria-hidden
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getTypeSwatchClasses(tournament.type)}`}
            />
            <div className="min-w-0 flex-1">
              <Link href={`/results/${tournament.id}`} className="block truncate text-sm font-medium">
                {tournament.name}
              </Link>
              <dl className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex gap-1">
                  <dt className="shrink-0 font-medium">{t.pages.calendar.dayDetails.organizer}:</dt>
                  <dd className="truncate">{getOrganizerName(tournament.orgType, tournament.orgNumber)}</dd>
                </div>
                {tournament.city && (
                  <div className="flex gap-1">
                    <dt className="shrink-0 font-medium">{t.pages.calendar.dayDetails.city}:</dt>
                    <dd className="truncate">{tournament.city}</dd>
                  </div>
                )}
                {typeLabel(tournament.type) && (
                  <div className="flex gap-1">
                    <dt className="shrink-0 font-medium">{t.pages.calendar.dayDetails.type}:</dt>
                    <dd className="truncate">{typeLabel(tournament.type)}</dd>
                  </div>
                )}
                <div className="flex gap-1">
                  <dt className="shrink-0 font-medium">{t.pages.calendar.dayDetails.dateRange}:</dt>
                  <dd className="truncate">{formatRange(tournament)}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
