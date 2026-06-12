'use client';

import type { TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import type { PositionedSegment } from '@/lib/utils/calendarLayout';
import { getTypeBarClasses } from './calendarColors';

interface EventBarProps {
  segment: PositionedSegment;
  /** Day number of the first cell in the row (for anchoring the popover). */
  rowStartDayNumber: number;
  /** Pixel offset of the bar's top within the row. */
  top: number;
  /** Bar height in pixels. */
  height: number;
  language: 'sv' | 'en';
  /** Fired with the clicked tournament and the day to anchor the popover to. */
  onSelect: (tournament: TournamentDto, dayNumber: number) => void;
}

/**
 * A single positioned event bar (or start-only marker) within a calendar row.
 * Position is computed as a percentage of the 7-column row so it aligns exactly
 * with the day-cell grid behind it.
 */
export function EventBar({ segment, rowStartDayNumber, top, height, language, onSelect }: EventBarProps) {
  const t = getTranslation(language);
  const { tournament, colOffset, colSpan, continuesLeft, continuesRight, startOnly } = segment;

  const leftPct = (colOffset / 7) * 100;
  const widthPct = (colSpan / 7) * 100;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(tournament, rowStartDayNumber + colOffset);
      }}
      title={startOnly ? `${tournament.name} (${t.pages.calendar.longerEvent})` : tournament.name}
      style={{
        position: 'absolute',
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      className={`flex items-center gap-0.5 overflow-hidden rounded border px-1 text-left text-[10px] leading-none transition-opacity hover:opacity-80 sm:text-xs ${getTypeBarClasses(
        tournament.type,
      )}`}
    >
      {continuesLeft && <span aria-hidden className="shrink-0">◀</span>}
      {startOnly && <span aria-hidden className="shrink-0 opacity-70">•</span>}
      <span className="truncate">{tournament.name}</span>
      {continuesRight && <span aria-hidden className="ml-auto shrink-0">▶</span>}
    </button>
  );
}
