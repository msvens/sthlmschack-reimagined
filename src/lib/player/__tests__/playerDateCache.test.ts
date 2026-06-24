import { describe, it, expect } from 'vitest';
import { PlayerDateCache } from '@/lib/player/playerDateCache';
import type { PlayerInfoDto } from '@/lib/api';

const player = (id: number) => ({ id, firstName: 'A', lastName: 'B' } as unknown as PlayerInfoDto);
const K = 'p1-2025-06-01';

describe('PlayerDateCache', () => {
  it('starts unfetched: no hit, no player, status unfetched', () => {
    const c = new PlayerDateCache();
    expect(c.has(K)).toBe(false);
    expect(c.get(K)).toBeUndefined();
    expect(c.status(K)).toBe('unfetched');
  });

  it('setFound: hit, returns the player, status found', () => {
    const c = new PlayerDateCache();
    c.setFound(K, player(1));
    expect(c.has(K)).toBe(true);
    expect(c.get(K)?.id).toBe(1);
    expect(c.status(K)).toBe('found');
  });

  it('setMissing negatively caches: still a HIT (so callers do not refetch), but no player', () => {
    const c = new PlayerDateCache();
    c.setMissing(K);
    expect(c.has(K)).toBe(true); // the whole point: a confirmed-missing key is a cache hit
    expect(c.get(K)).toBeUndefined();
    expect(c.status(K)).toBe('missing');
  });

  it('distinguishes the three states — the bug was conflating missing with unfetched', () => {
    const c = new PlayerDateCache();
    expect(c.status('unfetched-key')).toBe('unfetched');
    c.setMissing('missing-key');
    c.setFound('found-key', player(2));
    expect(c.status('missing-key')).toBe('missing');
    expect(c.status('found-key')).toBe('found');
  });

  it('setFromResult: data → found, null/undefined → missing', () => {
    const c = new PlayerDateCache();
    c.setFromResult('a', player(3));
    c.setFromResult('b', null);
    c.setFromResult('c', undefined);
    expect(c.status('a')).toBe('found');
    expect(c.status('b')).toBe('missing');
    expect(c.status('c')).toBe('missing');
  });

  it('get collapses a negative entry to undefined (same shape as a real miss for callers)', () => {
    const c = new PlayerDateCache();
    c.setMissing(K);
    expect(c.get(K)).toBeUndefined();
  });
});
