'use client';

import { useMemo, useState } from 'react';
import { type Language } from '@/context/LanguageContext';
import type { TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import {
  MONTH_MAX_LANES,
  tournamentsForDay,
  type PackedRow,
} from '@/lib/utils/calendarLayout';
import { DayEventsPopover } from './DayEventsPopover';
import { EventBar } from './EventBar';

interface MonthViewProps {
  rows: PackedRow[];
  tournaments: TournamentDto[];
  language: Language;
  /** Localized Mon–Sun short weekday labels. */
  weekdayLabels: string[];
}

const HEADER_H = 24; // px reserved for the date number
const LANE_H = 20; // px per bar lane
const BAR_H = 17; // px bar height
const PAD_B = 6; // px bottom padding
const MIN_ROW = 96; // px minimum row height — keeps a calendar-like grid even when sparse

export function MonthView({ rows, tournaments, language, weekdayLabels }: MonthViewProps) {
  const t = getTranslation(language);
  // `tournamentId: null` → show the whole day; otherwise show just that event.
  const [open, setOpen] = useState<{ day: number; tournamentId: number | null } | null>(null);

  const openDate = useMemo(() => {
    if (!open) return null;
    for (const row of rows) {
      const cell = row.cells.find((c) => c.dayNumber === open.day);
      if (cell) return cell.date;
    }
    return null;
  }, [open, rows]);

  const openEvents = useMemo(() => {
    if (!open) return [];
    if (open.tournamentId !== null) {
      const match = tournaments.find((tt) => tt.id === open.tournamentId);
      return match ? [match] : [];
    }
    return tournamentsForDay(tournaments, open.day);
  }, [open, tournaments]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Weekday header */}
      <div className="grid grid-cols-7 rounded-t-lg border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-1 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs dark:text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {rows.map((row, rowIndex) => {
        const shownLanes = Math.min(row.maxLanes, MONTH_MAX_LANES);
        const rowStart = row.cells[0].dayNumber;

        // Per-cell overflow: events drawn on the day minus the bars we render.
        const overflowByCol = row.cells.map((cell) => {
          const total = tournamentsForDay(tournaments, cell.dayNumber).length;
          const shown = row.segments.filter(
            (s) =>
              s.laneIndex < MONTH_MAX_LANES &&
              cell.dayNumber >= rowStart + s.colOffset &&
              cell.dayNumber < rowStart + s.colOffset + s.colSpan,
          ).length;
          return Math.max(0, total - shown);
        });
        const hasOverflow = overflowByCol.some((n) => n > 0);

        const minHeight = Math.max(
          MIN_ROW,
          HEADER_H + shownLanes * LANE_H + (hasOverflow ? LANE_H : 0) + PAD_B,
        );

        return (
          <div
            key={rowIndex}
            className="relative grid grid-cols-7"
            style={{ minHeight }}
          >
            {/* Day-cell backgrounds */}
            {row.cells.map((cell, colIndex) => {
              const dayEvents = tournamentsForDay(tournaments, cell.dayNumber);
              const clickable = dayEvents.length > 0;
              return (
                <div
                  key={cell.dayNumber}
                  onClick={clickable ? () => setOpen({ day: cell.dayNumber, tournamentId: null }) : undefined}
                  className={`relative border-b border-r border-gray-200 last:border-r-0 dark:border-gray-700 ${
                    colIndex === 6 ? 'border-r-0' : ''
                  } ${cell.inCurrentMonth ? '' : 'bg-gray-50/60 dark:bg-gray-800/30'} ${
                    clickable ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="px-1.5 pt-1">
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] sm:text-xs ${
                        cell.isToday
                          ? 'bg-blue-600 font-semibold text-white dark:bg-blue-500'
                          : cell.inCurrentMonth
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                  </div>

                  {/* "+N more" overflow affordance */}
                  {overflowByCol[colIndex] > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen({ day: cell.dayNumber, tournamentId: null });
                      }}
                      style={{ top: HEADER_H + shownLanes * LANE_H }}
                      className="absolute left-1 text-[10px] font-medium text-gray-500 hover:text-blue-600 sm:text-[11px] dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      {t.pages.calendar.moreEvents.replace('{count}', String(overflowByCol[colIndex]))}
                    </button>
                  )}

                  {/* Popover anchored to the opened cell */}
                  {open?.day === cell.dayNumber && openDate && (
                    <DayEventsPopover
                      date={openDate}
                      events={openEvents}
                      language={language}
                      onClose={() => setOpen(null)}
                    />
                  )}
                </div>
              );
            })}

            {/* Event bars overlay */}
            {row.segments
              .filter((s) => s.laneIndex < MONTH_MAX_LANES)
              .map((segment) => (
                <EventBar
                  key={`${segment.tournament.id}-${segment.colOffset}`}
                  segment={segment}
                  rowStartDayNumber={rowStart}
                  top={HEADER_H + segment.laneIndex * LANE_H}
                  height={BAR_H}
                  language={language}
                  onSelect={(tournament, dayNumber) => setOpen({ day: dayNumber, tournamentId: tournament.id })}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}
