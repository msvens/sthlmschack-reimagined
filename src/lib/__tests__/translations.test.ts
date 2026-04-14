import { describe, it, expect } from 'vitest';
import { getTranslation } from '@/lib/translations';

/** Recursively collect all leaf keys as dot-separated paths */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe('translations', () => {
  const en = getTranslation('en');
  const sv = getTranslation('sv');

  it('getTranslation returns an object for "en"', () => {
    expect(en).toBeDefined();
    expect(typeof en).toBe('object');
  });

  it('getTranslation returns an object for "sv"', () => {
    expect(sv).toBeDefined();
    expect(typeof sv).toBe('object');
  });

  it('both languages have identical key structure', () => {
    const enKeys = collectKeys(en as unknown as Record<string, unknown>);
    const svKeys = collectKeys(sv as unknown as Record<string, unknown>);
    expect(enKeys).toEqual(svKeys);
  });

  it('no empty string values in English translations', () => {
    const enKeys = collectKeys(en as unknown as Record<string, unknown>);
    for (const keyPath of enKeys) {
      const value = keyPath.split('.').reduce(
        (obj: Record<string, unknown>, k) => obj[k] as Record<string, unknown>,
        en as unknown as Record<string, unknown>,
      );
      expect(value, `en.${keyPath} is empty`).not.toBe('');
    }
  });

  it('no empty string values in Swedish translations', () => {
    const svKeys = collectKeys(sv as unknown as Record<string, unknown>);
    for (const keyPath of svKeys) {
      const value = keyPath.split('.').reduce(
        (obj: Record<string, unknown>, k) => obj[k] as Record<string, unknown>,
        sv as unknown as Record<string, unknown>,
      );
      expect(value, `sv.${keyPath} is empty`).not.toBe('');
    }
  });
});
