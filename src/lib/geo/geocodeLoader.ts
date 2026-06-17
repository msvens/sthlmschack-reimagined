'use client';

/**
 * Loads the offline-generated geocode table (`public/data/geocodes.json`,
 * produced by `scripts/build-geocodes.ts` from the GeoNames Sweden gazetteer)
 * and resolves a tournament to map coordinates. All lookups are synchronous
 * once the table is fetched.
 *
 * Tournaments are placed by their CITY centre: the federation gives no venue
 * coordinates, and a tournament is rarely actually played at the organizing
 * club's registered address (though usually in the same city), so city is the
 * one location field that genuinely belongs to the tournament. The resolver
 * accepts an optional fallback city (the caller passes the organizing club's
 * city for tournaments whose own city is blank upstream). A tournament we still
 * can't place is unmapped — the caller lists these so nothing disappears
 * silently.
 *
 * This whole module is intentionally self-contained: the map view is an
 * experiment, so the geocode layer is decoupled from the rest of the app and
 * can be deleted without touching organization data.
 */
import { useEffect, useState } from 'react';
import type { TournamentDto } from '@/lib/api';

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface GeocodeData {
  generatedAt: string;
  cities: Record<string, GeoPoint>;
}

/** Normalize a city name to a lookup key (lowercase, collapsed whitespace). */
export function normalizeCity(city: string | null | undefined): string {
  return (city ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Resolve a single city name to a point, or null if not in the table. */
export function resolveCity(data: GeocodeData, city: string | null | undefined): GeoPoint | null {
  const key = normalizeCity(city);
  return key ? (data.cities[key] ?? null) : null;
}

/**
 * Resolve a tournament's map location by its own city, falling back to the
 * supplied city (e.g. the organizing club's) when the tournament has none.
 */
export function resolveTournamentLocation(
  data: GeocodeData,
  tournament: TournamentDto,
  fallbackCity?: string | null,
): GeoPoint | null {
  return resolveCity(data, tournament.city) ?? resolveCity(data, fallbackCity);
}

async function loadGeocodeData(): Promise<GeocodeData> {
  const response = await fetch('/data/geocodes.json');
  if (!response.ok) {
    throw new Error(`Failed to load geocodes: ${response.status}`);
  }
  return response.json();
}

interface UseGeocodesResult {
  data: GeocodeData | null;
  loading: boolean;
  error: string | null;
}

/** Fetch the geocode table once on mount. Client-only (used by the map view). */
export function useGeocodes(): UseGeocodesResult {
  const [data, setData] = useState<GeocodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGeocodeData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load geocodes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
