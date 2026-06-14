'use client';

import { useEffect, useRef, useState } from 'react';
import { type Language } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { getTournamentTypeKey } from '@/lib/utils/tournamentFilters';
import { getTypeSwatchClasses } from './calendarColors';

interface CalendarLegendProps {
  /** Tournament type values present in the current data, in display order. */
  types: number[];
  language: Language;
}

/**
 * On-demand colour key for the calendar. A small "Colors" button that opens a
 * compact swatch + type-name list — showing only the types actually present in
 * the current (filtered) data. Closes on outside-click and Escape.
 */
export function CalendarLegend({ types, language }: CalendarLegendProps) {
  const t = getTranslation(language);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const typeLabels = t.components.tournamentTypeFilter;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (types.length === 0) return null;

  const typeLabel = (type: number): string => {
    const key = getTournamentTypeKey(type) as keyof typeof typeLabels;
    return key in typeLabels ? typeLabels[key] : `${type}`;
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.pages.calendar.colors}
        aria-expanded={open}
        className="flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span aria-hidden className="flex gap-0.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        </span>
        <span className="hidden sm:inline">{t.pages.calendar.colors}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul className="flex flex-col gap-1.5">
            {types.map((type) => (
              <li key={type} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${getTypeSwatchClasses(type)}`} />
                <span className="truncate">{typeLabel(type)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
