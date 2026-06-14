'use client';

import { useEffect, useMemo, useState } from 'react';
import { type Language } from '@/context/LanguageContext';
import type { TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import {
  addDays,
  addMonths,
  buildMonthRows,
  buildWeekRow,
  getEventDateBounds,
  toDayNumber,
} from '@/lib/utils/calendarLayout';
import { getAllTournamentTypes } from '@/lib/utils/tournamentFilters';
import { CalendarNav } from './CalendarNav';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import {
  getSavedAnchor,
  getSavedView,
  setSavedAnchor,
  setSavedView,
  type CalendarViewMode,
} from './calendarPrefs';

interface CalendarViewProps {
  tournaments: TournamentDto[];
  language: Language;
  loading?: boolean;
  error?: string;
}

const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const weekStartNumber = (d: Date) => toDayNumber(addDays(d, -((d.getDay() + 6) % 7)));

export function CalendarView({ tournaments, language, loading, error }: CalendarViewProps) {
  const t = getTranslation(language);
  const locale = language === 'sv' ? 'sv-SE' : 'en-US';
  const [view, setView] = useState<CalendarViewMode>('month');
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  // Restore saved view + anchor on mount (default render stays SSR-safe).
  useEffect(() => {
    const restore = () => {
      const savedView = getSavedView();
      if (savedView) setView(savedView);
      const savedAnchor = getSavedAnchor();
      if (savedAnchor) setAnchor(savedAnchor);
    };
    restore();
  }, []);

  // Persist on user action (not via effects, to avoid clobbering on mount).
  const changeView = (next: CalendarViewMode) => {
    setView(next);
    setSavedView(next);
  };
  const applyAnchor = (next: Date) => {
    setAnchor(next);
    setSavedAnchor(next);
  };

  const todayDayNumber = useMemo(() => toDayNumber(new Date()), []);
  const bounds = useMemo(() => getEventDateBounds(tournaments), [tournaments]);

  // Tournament types present in the current data, in canonical order — drives
  // the colour key so it only lists colours actually on screen.
  const legendTypes = useMemo(() => {
    const present = new Set(tournaments.map((tt) => tt.type));
    return getAllTournamentTypes().filter((type) => present.has(type));
  }, [tournaments]);

  // Mon–Sun short labels derived from a known Monday (2024-01-01).
  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(monday, i)));
  }, [locale]);

  const monthRows = useMemo(
    () => (view === 'month' ? buildMonthRows(anchor, tournaments, todayDayNumber) : []),
    [view, anchor, tournaments, todayDayNumber],
  );
  const weekRow = useMemo(
    () => (view === 'week' ? buildWeekRow(anchor, tournaments, todayDayNumber) : null),
    [view, anchor, tournaments, todayDayNumber],
  );

  const title = useMemo(() => {
    if (view === 'month') {
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(anchor);
    }
    const weekStart = addDays(anchor, -((anchor.getDay() + 6) % 7));
    const weekEnd = addDays(weekStart, 6);
    const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    const full = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dayMonth.format(weekStart)} – ${full.format(weekEnd)}`;
  }, [view, anchor, locale]);

  let canGoPrev = false;
  let canGoNext = false;
  if (bounds) {
    if (view === 'month') {
      canGoPrev = monthKey(anchor) > monthKey(bounds.earliest);
      canGoNext = monthKey(anchor) < monthKey(bounds.latest);
    } else {
      canGoPrev = weekStartNumber(anchor) > weekStartNumber(bounds.earliest);
      canGoNext = weekStartNumber(anchor) < weekStartNumber(bounds.latest);
    }
  }

  const goPrev = () => applyAnchor(view === 'month' ? addMonths(anchor, -1) : addDays(anchor, -7));
  const goNext = () => applyAnchor(view === 'month' ? addMonths(anchor, 1) : addDays(anchor, 7));
  const goToday = () => applyAnchor(new Date());
  const goEarliest = () => bounds && applyAnchor(bounds.earliest);
  const goLatest = () => bounds && applyAnchor(bounds.latest);

  return (
    <div>
      <CalendarNav
        title={title}
        language={language}
        view={view}
        onViewChange={changeView}
        legendTypes={legendTypes}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onEarliest={goEarliest}
        onLatest={goLatest}
      />

      {loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          {t.pages.calendar.tournamentList.loading}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-600 dark:text-red-400">{error}</div>
      ) : view === 'month' ? (
        <MonthView rows={monthRows} tournaments={tournaments} language={language} weekdayLabels={weekdayLabels} />
      ) : weekRow ? (
        <WeekView row={weekRow} language={language} weekdayLabels={weekdayLabels} />
      ) : null}
    </div>
  );
}
