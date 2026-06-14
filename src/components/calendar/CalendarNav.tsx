'use client';

import { type Language } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { CalendarLegend } from './CalendarLegend';

interface CalendarNavProps {
  title: string;
  language: Language;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  /** Tournament type values present in the data, for the colour key. */
  legendTypes: number[];
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onEarliest: () => void;
  onLatest: () => void;
}

const iconBtn =
  'flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800';

export function CalendarNav({
  title,
  language,
  view,
  onViewChange,
  legendTypes,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onToday,
  onEarliest,
  onLatest,
}: CalendarNavProps) {
  const t = getTranslation(language);
  const nav = t.pages.calendar.nav;
  const views = t.pages.calendar.views;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      {/* Navigation cluster */}
      <div className="flex items-center gap-1">
        <button type="button" onClick={onEarliest} disabled={!canGoPrev} title={nav.earliest} aria-label={nav.earliest} className={iconBtn}>
          «
        </button>
        <button type="button" onClick={onPrev} disabled={!canGoPrev} title={nav.prev} aria-label={nav.prev} className={iconBtn}>
          ‹
        </button>
        <button
          type="button"
          onClick={onToday}
          className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {nav.today}
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext} title={nav.next} aria-label={nav.next} className={iconBtn}>
          ›
        </button>
        <button type="button" onClick={onLatest} disabled={!canGoNext} title={nav.latest} aria-label={nav.latest} className={iconBtn}>
          »
        </button>
      </div>

      {/* Period title */}
      <h2 className="order-last w-full truncate text-center text-sm font-semibold capitalize text-gray-900 sm:order-none sm:w-auto sm:flex-1 sm:text-base dark:text-gray-100">
        {title}
      </h2>

      {/* Colour key + view selector */}
      <div className="flex shrink-0 items-center gap-1.5">
        <CalendarLegend types={legendTypes} language={language} />
        <select
          value={view}
          onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
          aria-label={views.month}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <option value="week">{views.week}</option>
          <option value="month">{views.month}</option>
        </select>
      </div>
    </div>
  );
}
