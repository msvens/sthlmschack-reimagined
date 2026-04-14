import { describe, it, expect } from 'vitest';
import { TournamentType, TournamentState } from '@msvens/schack-se-sdk';
import {
  countByCategory,
  countByType,
  countByState,
  filterByCategory,
  filterByType,
  filterByState,
  getAllTournamentTypes,
  getTournamentTypeKey,
} from '@/lib/utils/tournamentFilters';
import type { TournamentDto } from '@msvens/schack-se-sdk';

/** Minimal mock — only the fields the filter functions inspect */
function makeTournament(overrides: Partial<TournamentDto>): TournamentDto {
  return {
    id: 1,
    name: 'Test',
    start: '2024-01-01',
    end: '2024-01-02',
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

// ---------------------------------------------------------------------------
// countByCategory
// ---------------------------------------------------------------------------
describe('countByCategory', () => {
  it('returns all zeros for an empty array', () => {
    expect(countByCategory([])).toEqual({ all: 0, team: 0, individual: 0 });
  });

  it('counts team and individual tournaments correctly', () => {
    const tournaments = [
      makeTournament({ type: TournamentType.INDIVIDUAL }),
      makeTournament({ type: TournamentType.ALLSVENSKAN }), // team
      makeTournament({ type: TournamentType.SVENSKA_CUPEN }), // team
      makeTournament({ type: TournamentType.GRAND_PRIX }),
    ];
    expect(countByCategory(tournaments)).toEqual({
      all: 4,
      team: 2,
      individual: 2,
    });
  });
});

// ---------------------------------------------------------------------------
// countByType
// ---------------------------------------------------------------------------
describe('countByType', () => {
  it('counts multiple types correctly', () => {
    const tournaments = [
      makeTournament({ type: TournamentType.INDIVIDUAL }),
      makeTournament({ type: TournamentType.INDIVIDUAL }),
      makeTournament({ type: TournamentType.ALLSVENSKAN }),
    ];
    const counts = countByType(tournaments);
    expect(counts.all).toBe(3);
    expect(counts[TournamentType.INDIVIDUAL]).toBe(2);
    expect(counts[TournamentType.ALLSVENSKAN]).toBe(1);
  });

  it('returns only all for empty array', () => {
    expect(countByType([])).toEqual({ all: 0 });
  });
});

// ---------------------------------------------------------------------------
// countByState
// ---------------------------------------------------------------------------
describe('countByState', () => {
  it('counts all three states', () => {
    const tournaments = [
      makeTournament({ state: TournamentState.REGISTRATION }),
      makeTournament({ state: TournamentState.STARTED }),
      makeTournament({ state: TournamentState.STARTED }),
      makeTournament({ state: TournamentState.FINISHED }),
    ];
    expect(countByState(tournaments)).toEqual({
      all: 4,
      registration: 1,
      started: 2,
      finished: 1,
    });
  });
});

// ---------------------------------------------------------------------------
// filterByCategory
// ---------------------------------------------------------------------------
describe('filterByCategory', () => {
  const tournaments = [
    makeTournament({ id: 1, type: TournamentType.INDIVIDUAL }),
    makeTournament({ id: 2, type: TournamentType.ALLSVENSKAN }),
    makeTournament({ id: 3, type: TournamentType.YES2CHESS }),
  ];

  it('"all" returns everything', () => {
    expect(filterByCategory(tournaments, 'all')).toHaveLength(3);
  });

  it('"team" returns only team tournaments', () => {
    const result = filterByCategory(tournaments, 'team');
    expect(result.map(t => t.id)).toEqual([2, 3]);
  });

  it('"individual" returns only individual tournaments', () => {
    const result = filterByCategory(tournaments, 'individual');
    expect(result.map(t => t.id)).toEqual([1]);
  });
});

// ---------------------------------------------------------------------------
// filterByType
// ---------------------------------------------------------------------------
describe('filterByType', () => {
  const tournaments = [
    makeTournament({ id: 1, type: TournamentType.INDIVIDUAL }),
    makeTournament({ id: 2, type: TournamentType.ALLSVENSKAN }),
  ];

  it('null returns all', () => {
    expect(filterByType(tournaments, null)).toHaveLength(2);
  });

  it('specific type filters correctly', () => {
    const result = filterByType(tournaments, TournamentType.INDIVIDUAL);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// filterByState
// ---------------------------------------------------------------------------
describe('filterByState', () => {
  const tournaments = [
    makeTournament({ id: 1, state: TournamentState.REGISTRATION }),
    makeTournament({ id: 2, state: TournamentState.FINISHED }),
  ];

  it('null returns all', () => {
    expect(filterByState(tournaments, null)).toHaveLength(2);
  });

  it('specific state filters correctly', () => {
    const result = filterByState(tournaments, TournamentState.FINISHED);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getAllTournamentTypes
// ---------------------------------------------------------------------------
describe('getAllTournamentTypes', () => {
  it('returns all 8 tournament types', () => {
    const types = getAllTournamentTypes();
    expect(types).toHaveLength(8);
    expect(types).toContain(TournamentType.ALLSVENSKAN);
    expect(types).toContain(TournamentType.INDIVIDUAL);
    expect(types).toContain(TournamentType.SM_TREE);
    expect(types).toContain(TournamentType.SCHOOL_SM);
    expect(types).toContain(TournamentType.SVENSKA_CUPEN);
    expect(types).toContain(TournamentType.GRAND_PRIX);
    expect(types).toContain(TournamentType.YES2CHESS);
    expect(types).toContain(TournamentType.SCHACKFYRAN);
  });
});

// ---------------------------------------------------------------------------
// getTournamentTypeKey
// ---------------------------------------------------------------------------
describe('getTournamentTypeKey', () => {
  it('maps known types correctly', () => {
    expect(getTournamentTypeKey(TournamentType.ALLSVENSKAN)).toBe('allsvenskan');
    expect(getTournamentTypeKey(TournamentType.INDIVIDUAL)).toBe('individual');
    expect(getTournamentTypeKey(TournamentType.SM_TREE)).toBe('smTree');
    expect(getTournamentTypeKey(TournamentType.SCHOOL_SM)).toBe('schoolSm');
    expect(getTournamentTypeKey(TournamentType.SVENSKA_CUPEN)).toBe('svenskaCupen');
    expect(getTournamentTypeKey(TournamentType.GRAND_PRIX)).toBe('grandPrix');
    expect(getTournamentTypeKey(TournamentType.YES2CHESS)).toBe('yes2chess');
    expect(getTournamentTypeKey(TournamentType.SCHACKFYRAN)).toBe('schackfyran');
  });

  it('returns "unknown" for unrecognized type', () => {
    expect(getTournamentTypeKey(999)).toBe('unknown');
  });
});
