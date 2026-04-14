import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecentPlayers,
  addRecentPlayer,
  clearRecentPlayers,
} from '@/lib/recentPlayers';

vi.mock('@/lib/storage', () => ({
  safeGetItem: vi.fn(() => null),
  safeSetItem: vi.fn(),
  safeRemoveItem: vi.fn(),
}));

import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';

beforeEach(() => {
  vi.mocked(safeGetItem).mockReset().mockReturnValue(null);
  vi.mocked(safeSetItem).mockReset();
  vi.mocked(safeRemoveItem).mockReset();
});

describe('getRecentPlayers', () => {
  it('returns empty array when nothing stored', () => {
    expect(getRecentPlayers()).toEqual([]);
  });

  it('parses valid JSON', () => {
    const players = [{ id: 1, name: 'Alice' }];
    vi.mocked(safeGetItem).mockReturnValueOnce(JSON.stringify(players));
    expect(getRecentPlayers()).toEqual(players);
  });

  it('returns empty array for corrupt JSON', () => {
    vi.mocked(safeGetItem).mockReturnValueOnce('not json{{{');
    expect(getRecentPlayers()).toEqual([]);
  });

  it('returns empty array if stored value is not an array', () => {
    vi.mocked(safeGetItem).mockReturnValueOnce('"just a string"');
    expect(getRecentPlayers()).toEqual([]);
  });
});

describe('addRecentPlayer', () => {
  it('adds a player to the front', () => {
    addRecentPlayer({ id: 1, name: 'Alice' });
    expect(safeSetItem).toHaveBeenCalledOnce();
    const stored = JSON.parse(vi.mocked(safeSetItem).mock.calls[0][1]);
    expect(stored).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('deduplicates by id', () => {
    vi.mocked(safeGetItem).mockReturnValueOnce(
      JSON.stringify([{ id: 1, name: 'Alice Old' }, { id: 2, name: 'Bob' }]),
    );
    addRecentPlayer({ id: 1, name: 'Alice New' });
    const stored = JSON.parse(vi.mocked(safeSetItem).mock.calls[0][1]);
    expect(stored).toEqual([
      { id: 1, name: 'Alice New' },
      { id: 2, name: 'Bob' },
    ]);
  });

  it('caps at 10 entries', () => {
    const existing = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
    }));
    vi.mocked(safeGetItem).mockReturnValueOnce(JSON.stringify(existing));
    addRecentPlayer({ id: 99, name: 'New Player' });
    const stored = JSON.parse(vi.mocked(safeSetItem).mock.calls[0][1]);
    expect(stored).toHaveLength(10);
    expect(stored[0].id).toBe(99);
    expect(stored.map((p: { id: number }) => p.id)).not.toContain(10);
  });
});

describe('clearRecentPlayers', () => {
  it('calls safeRemoveItem', () => {
    clearRecentPlayers();
    expect(safeRemoveItem).toHaveBeenCalledWith('recent-players');
  });
});
