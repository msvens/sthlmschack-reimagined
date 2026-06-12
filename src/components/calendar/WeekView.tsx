'use client';

import { useState } from 'react';
import { Link } from '@/components/Link';
import { type Language } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { useIsMobile } from '@/hooks';
import { parseLocalDate, type TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { getTournamentTypeKey } from '@/lib/utils/tournamentFilters';
import { type PackedRow } from '@/lib/utils/calendarLayout';
import { getTypeBarClasses } from './calendarColors';
import { DayEventsPopover } from './DayEventsPopover';

interface WeekViewProps {
  row: PackedRow;
  language: Language;
  /** Localized Mon–Sun short weekday labels. */
  weekdayLabels: string[];
}

export function WeekView({ row, weekdayLabels, language }: WeekViewProps) {
  const t = getTranslation(language);
  const { getOrganizerName } = useOrganizations();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<{ tournamentId: number; colOffset: number } | null>(null);

  const locale = language === 'sv' ? 'sv-SE' : 'en-US';
  const rangeFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const typeLabels = t.components.tournamentTypeFilter;

  // Keep a calendar-like minimum height; any leftover space sits below the
  // events (not inside the cards, which are now content-height).
  const minBand = isMobile ? 220 : 300;
  const rowStart = row.cells[0].dayNumber;

  function typeLabel(type: number): string {
    const key = getTournamentTypeKey(type) as keyof typeof typeLabels;
    return key in typeLabels ? typeLabels[key] : '';
  }

  function formatRange(tournament: TournamentDto): string {
    const start = rangeFmt.format(parseLocalDate(tournament.start));
    if (!tournament.end || tournament.end === tournament.start) return start;
    return `${start} – ${rangeFmt.format(parseLocalDate(tournament.end))}`;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Day headers */}
      <div className="grid grid-cols-7 rounded-t-lg border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        {row.cells.map((cell, i) => (
          <div
            key={cell.dayNumber}
            className={`px-1 py-2 text-center ${i === 6 ? '' : 'border-r border-gray-200 dark:border-gray-700'}`}
          >
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs dark:text-gray-400">
              {weekdayLabels[i]}
            </div>
            <span
              className={`mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs sm:text-sm ${
                cell.isToday
                  ? 'bg-blue-600 font-semibold text-white dark:bg-blue-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {cell.date.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* All-day band */}
      <div className="relative">
        {/* Column separators (+ today highlight) */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
          {row.cells.map((cell, colIndex) => (
            <div
              key={cell.dayNumber}
              className={`${colIndex === 6 ? '' : 'border-r border-gray-200 dark:border-gray-700'} ${
                cell.isToday ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
              }`}
            />
          ))}
        </div>

        {/* Event cards — grid columns = days, grid rows = lanes (auto-height) */}
        <div
          className="relative grid grid-cols-7 gap-1 p-1"
          style={{ minHeight: minBand, gridAutoRows: 'min-content' }}
        >
          {row.segments.map((segment) => {
            const { tournament, colOffset, colSpan, continuesLeft, continuesRight } = segment;
            const meta = [tournament.city, typeLabel(tournament.type)].filter(Boolean).join(' · ');
            const isOpen = open?.tournamentId === tournament.id && open?.colOffset === colOffset;
            const popoverDate =
              row.cells.find((c) => c.dayNumber === rowStart + colOffset)?.date ?? row.cells[0].date;

            return (
              <div
                key={`${tournament.id}-${colOffset}`}
                onClick={() => setOpen({ tournamentId: tournament.id, colOffset })}
                title={tournament.name}
                style={{
                  gridColumn: `${colOffset + 1} / span ${colSpan}`,
                  gridRow: segment.laneIndex + 1,
                  zIndex: isOpen ? 20 : undefined,
                }}
                className={`relative cursor-pointer self-start rounded-md border px-1.5 py-1 transition-opacity hover:opacity-90 ${getTypeBarClasses(
                  tournament.type,
                )}`}
              >
                <span className="flex items-start gap-0.5 text-[11px] font-semibold leading-tight sm:text-xs">
                  {continuesLeft && <span aria-hidden className="shrink-0">◀</span>}
                  {isMobile ? (
                    <span className="truncate">{tournament.name}</span>
                  ) : (
                    <Link
                      href={`/results/${tournament.id}`}
                      color="blue"
                      underline="always"
                      onClick={(e) => e.stopPropagation()}
                      className="line-clamp-2"
                    >
                      {tournament.name}
                    </Link>
                  )}
                  {continuesRight && <span aria-hidden className="ml-auto shrink-0">▶</span>}
                </span>
                {!isMobile && meta && (
                  <span className="mt-0.5 block truncate text-[10px] leading-tight opacity-80">{meta}</span>
                )}
                {!isMobile && (
                  <span className="block truncate text-[10px] leading-tight opacity-75">
                    {getOrganizerName(tournament.orgType, tournament.orgNumber)}
                  </span>
                )}
                {!isMobile && (
                  <span className="block truncate text-[10px] leading-tight opacity-70">{formatRange(tournament)}</span>
                )}

                {isOpen && (
                  <DayEventsPopover
                    date={popoverDate}
                    events={[tournament]}
                    language={language}
                    onClose={() => setOpen(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
