'use client';

/**
 * Client hook that loads and scores a JGP season, keyed by (year, division).
 * Builds the Stockholm-eligibility predicate from the organizations context and
 * memoizes results per season for the session so tab/year switches are instant.
 */

import { useEffect, useState } from 'react';
import { useOrganizations } from '@/context/OrganizationsContext';
import type { JgpSeason } from '@/data/jgp/types';
import type { JgpAgeClassTable, JgpPlayerResult } from './jgpEngine';
import { loadSeasonStandings } from './jgpStandings';

/** Stockholm chess district id — the eligibility boundary for the JGP series. */
const STOCKHOLM_DISTRICT_ID = 5821;

/** Session cache of computed tables, keyed by season, so re-selecting is free. */
const cache = new Map<string, JgpAgeClassTable[]>();

const seasonKey = (s: JgpSeason) => `${s.year}-${s.division}`;

export interface UseJgpStandingsResult {
  tables: JgpAgeClassTable[] | null;
  loading: boolean;
  error: string | null;
}

export function useJgpStandings(season: JgpSeason): UseJgpStandingsResult {
  const { getClub, loading: orgLoading } = useOrganizations();
  const [tables, setTables] = useState<JgpAgeClassTable[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for org data — without it getClub returns undefined for every club
    // and everyone would be filtered out as non-Stockholm.
    if (orgLoading) return;

    let cancelled = false;

    const run = () => {
      const key = seasonKey(season);
      const cached = cache.get(key);
      if (cached) {
        setTables(cached);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setTables(null);

      const exceptionIds = new Set(season.clubExceptions.map((e) => e.memberId));
      const isEligible = (r: JgpPlayerResult) =>
        exceptionIds.has(r.memberId) ||
        !!getClub(r.clubId)?.districts?.some(
          (m) => m.districtid === STOCKHOLM_DISTRICT_ID && m.active === 1,
        );

      loadSeasonStandings(season, isEligible)
        .then((result) => {
          if (cancelled) return;
          cache.set(key, result);
          setTables(result);
          setLoading(false);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        });
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [season, orgLoading, getClub]);

  return { tables, loading, error };
}
