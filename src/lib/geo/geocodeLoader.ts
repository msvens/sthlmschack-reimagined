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
import type { TournamentDto, ClubDTO } from '@/lib/api';

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface GeocodeData {
  generatedAt: string;
  cities: Record<string, GeoPoint>;
}

/**
 * Street-level club coordinates, keyed by club id (`scripts/geocode-clubs.ts`).
 * A `null` entry is a negative-cache marker (address didn't resolve) — resolved
 * the same as "no entry": fall back to the club's city.
 */
export interface ClubGeocodeData {
  generatedAt: string;
  clubs: Record<string, GeoPoint | null>;
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

/**
 * Resolve a club's map location: its street-level coordinate if we geocoded it,
 * else its city centre, else null (unmapped). `cityData` is the GeoNames city
 * table used for the fallback.
 */
export function resolveClubLocation(
  clubData: ClubGeocodeData,
  cityData: GeocodeData | null,
  club: ClubDTO,
): GeoPoint | null {
  const street = clubData.clubs[String(club.id)];
  if (street) return street;
  return cityData ? resolveCity(cityData, club.city) : null;
}

interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Fetch a static JSON resource once on mount. Client-only. */
function useJsonResource<T>(url: string): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        if (!cancelled) setData(d as T);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : `Failed to load ${url}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

/** Fetch the GeoNames city table once on mount (used by both maps). */
export function useGeocodes(): Resource<GeocodeData> {
  return useJsonResource<GeocodeData>('/data/geocodes.json');
}

/** Fetch the street-level club coordinate table once on mount (club map). */
export function useClubGeocodes(): Resource<ClubGeocodeData> {
  return useJsonResource<ClubGeocodeData>('/data/club-geocodes.json');
}
