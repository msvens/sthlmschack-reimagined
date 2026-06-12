import { describe, it, expect } from 'vitest';
import { TournamentType, TournamentState } from '@msvens/schack-se-sdk';
import type { TournamentDto } from '@msvens/schack-se-sdk';
import {
  toDayNumber,
  parseEventDays,
  buildMonthMatrix,
  buildWeekCells,
  packRow,
  buildWeekRow,
  tournamentsForDay,
  getEventDateBounds,
  LONG_EVENT_THRESHOLD,
} from '@/lib/utils/calendarLayout';

/** Minimal mock — only the fields the layout functions inspect. */
function makeTournament(overrides: Partial<TournamentDto>): TournamentDto {
  return {
    id: 1,
    name: 'Test',
    start: '2024-01-01',
    end: '2024-01-01',
    city: '',
    arena: '',
    type: TournamentType.INDIVIDUAL,
    state: TournamentState.FINISHED,
    ia: 0,
    secjudges: '',
    thinkingTime: '',
    allowForeignPlayers: 0,
    teamtournamentPlayerListType: 0,
    ageFilter: 0,
    nrOfPartLink: '',
    orgType: 0,
    orgNumber: 0,
    ratingRegDate: '',
    ratingRegDate2: '',
    fideregged: 0,
    online: 0,
    y2cRules: 0,
    teamNrOfDaysRegged: 0,
    showPublic: 1,
    invitationurl: '',
    secParsedJudges: [],
    rootClasses: [],
    ...overrides,
  } as TournamentDto;
}

// Anchor inside a known week. 2024-06-12 is a Wednesday;
// its Mon–Sun week is 2024-06-10 .. 2024-06-16.
const WEEK_ANCHOR = new Date(2024, 5, 12);

describe('parseEventDays', () => {
  it('returns null when start is missing', () => {
    expect(parseEventDays(makeTournament({ start: '' }))).toBeNull();
  });

  it('treats empty end as single day', () => {
    const ev = parseEventDays(makeTournament({ start: '2024-06-10', end: '' }));
    expect(ev).not.toBeNull();
    expect(ev!.start).toBe(ev!.end);
  });

  it('clamps end before start', () => {
    const ev = parseEventDays(makeTournament({ start: '2024-06-10', end: '2024-06-08' }))!;
    expect(ev.end).toBe(ev.start);
  });

  it('computes inclusive span', () => {
    const ev = parseEventDays(makeTournament({ start: '2024-06-10', end: '2024-06-12' }))!;
    expect(ev.end - ev.start + 1).toBe(3);
  });
});

describe('buildMonthMatrix / buildWeekCells', () => {
  it('builds a Monday-first 6x7 grid', () => {
    const matrix = buildMonthMatrix(WEEK_ANCHOR, toDayNumber(WEEK_ANCHOR));
    expect(matrix).toHaveLength(6);
    expect(matrix.every((r) => r.length === 7)).toBe(true);
    // June 2024 starts on a Saturday → first cell is Mon 2024-05-27.
    expect(matrix[0][0].date.getDate()).toBe(27);
    expect(matrix[0][0].inCurrentMonth).toBe(false);
  });

  it('builds a Mon–Sun week', () => {
    const cells = buildWeekCells(WEEK_ANCHOR, toDayNumber(WEEK_ANCHOR));
    expect(cells).toHaveLength(7);
    expect(cells[0].date.getDate()).toBe(10); // Monday
    expect(cells[6].date.getDate()).toBe(16); // Sunday
  });

  it('flags today', () => {
    const today = toDayNumber(WEEK_ANCHOR);
    const cells = buildWeekCells(WEEK_ANCHOR, today);
    expect(cells.filter((c) => c.isToday)).toHaveLength(1);
    expect(cells.find((c) => c.isToday)!.date.getDate()).toBe(12);
  });
});

describe('packRow — single week row 2024-06-10..16', () => {
  const cells = buildWeekCells(WEEK_ANCHOR, toDayNumber(WEEK_ANCHOR));

  it('positions a single-day event in the right column', () => {
    const row = packRow(cells, [makeTournament({ start: '2024-06-12', end: '2024-06-12' })]);
    expect(row.segments).toHaveLength(1);
    expect(row.segments[0]).toMatchObject({ colOffset: 2, colSpan: 1, continuesLeft: false, continuesRight: false });
  });

  it('spans a multi-day event within the week', () => {
    const row = packRow(cells, [makeTournament({ start: '2024-06-11', end: '2024-06-13' })]);
    expect(row.segments[0]).toMatchObject({ colOffset: 1, colSpan: 3, continuesLeft: false, continuesRight: false });
  });

  it('clips an event that started before this row and flags continuesLeft', () => {
    const row = packRow(cells, [makeTournament({ start: '2024-06-08', end: '2024-06-11' })]);
    expect(row.segments[0]).toMatchObject({ colOffset: 0, colSpan: 2, continuesLeft: true, continuesRight: false });
  });

  it('clips an event that runs past this row and flags continuesRight', () => {
    // 5-day event Sat 15 → Wed 19: in this row only 15,16 are visible (cols 5,6).
    const row = packRow(cells, [makeTournament({ start: '2024-06-15', end: '2024-06-19' })]);
    expect(row.segments[0]).toMatchObject({ colOffset: 5, colSpan: 2, continuesLeft: false, continuesRight: true });
  });

  it('renders a >7-day event as a start-only marker', () => {
    const row = packRow(cells, [makeTournament({ start: '2024-06-11', end: '2024-06-30' })]);
    expect(row.segments).toHaveLength(1);
    expect(row.segments[0]).toMatchObject({ startOnly: true, colOffset: 1, colSpan: 1 });
  });

  it('does not show a long event on a non-start row', () => {
    // Long event whose start is in a previous week → nothing in this row.
    const row = packRow(cells, [makeTournament({ start: '2024-06-01', end: '2024-06-30' })]);
    expect(row.segments).toHaveLength(0);
  });

  it('lane-packs overlapping events onto separate lanes', () => {
    const row = packRow(cells, [
      makeTournament({ id: 1, start: '2024-06-10', end: '2024-06-12' }),
      makeTournament({ id: 2, start: '2024-06-11', end: '2024-06-13' }),
      makeTournament({ id: 3, start: '2024-06-15', end: '2024-06-16' }),
    ]);
    const lane = (id: number) => row.segments.find((s) => s.tournament.id === id)!.laneIndex;
    expect(lane(1)).toBe(0);
    expect(lane(2)).toBe(1); // overlaps #1 → new lane
    expect(lane(3)).toBe(0); // no overlap with #1 → reuses lane 0
    expect(row.maxLanes).toBe(2);
  });
});

describe('week-boundary split (the critical case)', () => {
  it('splits a 4-day event straddling Sun→Mon into two segments', () => {
    // Fri 2024-06-14 → Mon 2024-06-17. Week A: 10..16, Week B: 17..23.
    const t = makeTournament({ start: '2024-06-14', end: '2024-06-17' });
    const today = toDayNumber(WEEK_ANCHOR);

    const rowA = packRow(buildWeekCells(new Date(2024, 5, 12), today), [t]);
    const rowB = packRow(buildWeekCells(new Date(2024, 5, 19), today), [t]);

    // Week A: Fri,Sat,Sun = cols 4,5,6, continues into next week.
    expect(rowA.segments[0]).toMatchObject({ colOffset: 4, colSpan: 3, continuesLeft: false, continuesRight: true });
    // Week B: Mon = col 0, continued from previous week.
    expect(rowB.segments[0]).toMatchObject({ colOffset: 0, colSpan: 1, continuesLeft: true, continuesRight: false });
  });
});

describe('tournamentsForDay', () => {
  const events = [
    makeTournament({ id: 1, start: '2024-06-11', end: '2024-06-13' }), // short, covers 12
    makeTournament({ id: 2, start: '2024-06-12', end: '2024-06-12' }), // single on 12
    makeTournament({ id: 3, start: '2024-06-01', end: '2024-06-30' }), // long, starts before 12
  ];

  it('includes short events covering the day', () => {
    const ids = tournamentsForDay(events, toDayNumber(new Date(2024, 5, 12))).map((t) => t.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
  });

  it('excludes long events on a non-start day', () => {
    const ids = tournamentsForDay(events, toDayNumber(new Date(2024, 5, 12))).map((t) => t.id);
    expect(ids).not.toContain(3);
  });

  it('includes a long event on its start day', () => {
    const ids = tournamentsForDay(events, toDayNumber(new Date(2024, 5, 1))).map((t) => t.id);
    expect(ids).toContain(3);
  });
});

describe('getEventDateBounds', () => {
  it('returns null for an empty set', () => {
    expect(getEventDateBounds([])).toBeNull();
  });

  it('returns earliest and latest start dates', () => {
    const bounds = getEventDateBounds([
      makeTournament({ start: '2024-06-20' }),
      makeTournament({ start: '2024-06-05' }),
      makeTournament({ start: '2024-06-12' }),
    ])!;
    expect(bounds.earliest.getDate()).toBe(5);
    expect(bounds.latest.getDate()).toBe(20);
  });
});

describe('constants', () => {
  it('uses a 7-day long-event threshold', () => {
    expect(LONG_EVENT_THRESHOLD).toBe(7);
  });
});
