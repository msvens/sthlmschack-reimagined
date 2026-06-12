/**
 * Pure date-math + event layout helpers for the calendar week/month views.
 *
 * No React, no i18n — just data transformation so it stays easy to reason about
 * and test. All date parsing goes through `parseLocalDate` (local midnight) and
 * all span math is done on integer "day numbers" to avoid DST/UTC off-by-one
 * bugs (see the project memory note on `value && ...` and date pitfalls).
 */
import { parseLocalDate, type TournamentDto } from '@/lib/api';

/** Events longer than this many days are marked on their start date only. */
export const LONG_EVENT_THRESHOLD = 7;

/** Max lanes (stacked bars) rendered per day cell in month view before "+N more". */
export const MONTH_MAX_LANES = 3;

export interface DayCell {
  /** Local-midnight Date for this day. */
  date: Date;
  /** Stable integer day number (UTC-epoch based, DST-safe). */
  dayNumber: number;
  /** True when this cell belongs to the anchor month (false for padded days). */
  inCurrentMonth: boolean;
  /** True when this cell is today. */
  isToday: boolean;
}

export interface PositionedSegment {
  tournament: TournamentDto;
  /** 0-based column within the row (0 = first day of the row). */
  colOffset: number;
  /** Number of columns the bar spans within this row. */
  colSpan: number;
  /** Vertical lane (0-based) for stacking overlapping bars. */
  laneIndex: number;
  /** Bar continues into the previous row (render a ◀ hint). */
  continuesLeft: boolean;
  /** Bar continues into the next row (render a ▶ hint). */
  continuesRight: boolean;
  /** True for >7-day events: a single start-date marker rather than a span. */
  startOnly: boolean;
}

export interface PackedRow {
  /** The 7 day cells of this row (Mon–Sun). */
  cells: DayCell[];
  /** Positioned + lane-packed segments visible in this row. */
  segments: PositionedSegment[];
  /** Number of lanes used — drives the row's min-height. */
  maxLanes: number;
}

/**
 * Convert a Date to a stable integer day number based on its calendar
 * Y/M/D (timezone/DST independent). Two dates with the same calendar day
 * always produce the same number.
 */
export function toDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** Add `n` days to a date (DST-safe — uses calendar arithmetic). */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/** Add `n` months to a date, anchored to the 1st. */
export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

/** Monday-based day-of-week index: Mon=0 … Sun=6. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Parse a tournament's start/end into inclusive day numbers.
 * Returns null when there's no usable start date. Guards empty `end`
 * (single-day) and clamps a malformed `end < start`.
 */
export function parseEventDays(t: TournamentDto): { start: number; end: number } | null {
  if (!t.start) return null;
  const start = toDayNumber(parseLocalDate(t.start));
  let end = start;
  if (t.end) {
    end = toDayNumber(parseLocalDate(t.end));
    if (end < start) end = start;
  }
  return { start, end };
}

function makeCell(date: Date, anchorMonth: number, todayDayNumber: number): DayCell {
  const dayNumber = toDayNumber(date);
  return {
    date,
    dayNumber,
    inCurrentMonth: date.getMonth() === anchorMonth,
    isToday: dayNumber === todayDayNumber,
  };
}

/**
 * Build a Monday-first 6×7 month matrix for the month containing `anchor`,
 * padded with adjacent-month days.
 */
export function buildMonthMatrix(anchor: Date, todayDayNumber: number): DayCell[][] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const offset = mondayIndex(new Date(year, month, 1));

  const rows: DayCell[][] = [];
  for (let row = 0; row < 6; row++) {
    const cells: DayCell[] = [];
    for (let col = 0; col < 7; col++) {
      const dayOfMonth = 1 - offset + row * 7 + col;
      cells.push(makeCell(new Date(year, month, dayOfMonth), month, todayDayNumber));
    }
    rows.push(cells);
  }
  return rows;
}

/** Build the 7 Mon–Sun cells of the week containing `anchor`. */
export function buildWeekCells(anchor: Date, todayDayNumber: number): DayCell[] {
  const offset = mondayIndex(anchor);
  const cells: DayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(anchor, -offset + i);
    cells.push(makeCell(date, date.getMonth(), todayDayNumber));
  }
  return cells;
}

/**
 * Position + lane-pack a single contiguous row of day cells.
 *
 * Each tournament is split to the portion visible in this row; a >7-day event
 * collapses to a single start-date marker. Overlapping segments are greedily
 * assigned to lanes (left-to-right by start column) so they stack vertically.
 */
export function packRow(cells: DayCell[], tournaments: TournamentDto[]): PackedRow {
  const rowStart = cells[0].dayNumber;
  const rowEnd = cells[cells.length - 1].dayNumber;

  const segments: PositionedSegment[] = [];
  for (const tournament of tournaments) {
    const ev = parseEventDays(tournament);
    if (!ev) continue;

    const startOnly = ev.end - ev.start + 1 > LONG_EVENT_THRESHOLD;
    if (startOnly) {
      // Only the start day gets a marker, and only if it falls in this row.
      if (ev.start < rowStart || ev.start > rowEnd) continue;
      segments.push({
        tournament,
        colOffset: ev.start - rowStart,
        colSpan: 1,
        laneIndex: 0,
        continuesLeft: false,
        continuesRight: false,
        startOnly: true,
      });
    } else {
      const segStart = Math.max(ev.start, rowStart);
      const segEnd = Math.min(ev.end, rowEnd);
      if (segStart > segEnd) continue;
      segments.push({
        tournament,
        colOffset: segStart - rowStart,
        colSpan: segEnd - segStart + 1,
        laneIndex: 0,
        continuesLeft: ev.start < rowStart,
        continuesRight: ev.end > rowEnd,
        startOnly: false,
      });
    }
  }

  // Greedy lane packing: sort by start column, longer spans first on ties.
  segments.sort((a, b) => a.colOffset - b.colOffset || b.colSpan - a.colSpan);
  const laneEndCol: number[] = []; // last occupied column per lane
  for (const seg of segments) {
    const endCol = seg.colOffset + seg.colSpan - 1;
    let placed = false;
    for (let lane = 0; lane < laneEndCol.length; lane++) {
      if (laneEndCol[lane] < seg.colOffset) {
        seg.laneIndex = lane;
        laneEndCol[lane] = endCol;
        placed = true;
        break;
      }
    }
    if (!placed) {
      seg.laneIndex = laneEndCol.length;
      laneEndCol.push(endCol);
    }
  }

  return { cells, segments, maxLanes: laneEndCol.length };
}

/** Build all 6 packed rows for a month view. */
export function buildMonthRows(
  anchor: Date,
  tournaments: TournamentDto[],
  todayDayNumber: number,
): PackedRow[] {
  return buildMonthMatrix(anchor, todayDayNumber).map((cells) => packRow(cells, tournaments));
}

/** Build the single packed row for a week view. */
export function buildWeekRow(
  anchor: Date,
  tournaments: TournamentDto[],
  todayDayNumber: number,
): PackedRow {
  return packRow(buildWeekCells(anchor, todayDayNumber), tournaments);
}

/**
 * Tournaments to surface for a given day in a popover. Matches what is *drawn*:
 * short events covering the day, plus long events whose start is that day.
 */
export function tournamentsForDay(tournaments: TournamentDto[], dayNumber: number): TournamentDto[] {
  return tournaments.filter((t) => {
    const ev = parseEventDays(t);
    if (!ev) return false;
    if (ev.end - ev.start + 1 > LONG_EVENT_THRESHOLD) return ev.start === dayNumber;
    return dayNumber >= ev.start && dayNumber <= ev.end;
  });
}

/**
 * Earliest and latest tournament *start* dates in the set, as local-midnight
 * Dates. Used to bound navigation and to jump to first/last event.
 */
export function getEventDateBounds(tournaments: TournamentDto[]): { earliest: Date; latest: Date } | null {
  let min: number | null = null;
  let max: number | null = null;
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  for (const t of tournaments) {
    if (!t.start) continue;
    const date = parseLocalDate(t.start);
    const day = toDayNumber(date);
    if (min === null || day < min) {
      min = day;
      minDate = date;
    }
    if (max === null || day > max) {
      max = day;
      maxDate = date;
    }
  }

  if (!minDate || !maxDate) return null;
  return { earliest: minDate, latest: maxDate };
}
