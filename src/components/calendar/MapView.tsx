'use client';

/**
 * Map tab for the calendar page. Resolves each filtered tournament to a
 * coordinate (precise club address, else city centre) and shows the rest in a
 * small "not on the map" list so nothing disappears silently.
 *
 * The Leaflet map itself is code-split via next/dynamic (ssr:false) — map
 * libraries are client-only and we keep them out of the initial bundle.
 */
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Link } from '@/components/Link';
import { type Language } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { type TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useGeocodes, resolveTournamentLocation } from '@/lib/geo/geocodeLoader';
import { type MapMarker } from './TournamentMap';

const TournamentMap = dynamic(() => import('./TournamentMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] min-h-[420px] w-full items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      …
    </div>
  ),
});

interface MapViewProps {
  tournaments: TournamentDto[];
  language: Language;
  loading?: boolean;
  error?: string;
}

export function MapView({ tournaments, language, loading, error }: MapViewProps) {
  const t = getTranslation(language);
  const tm = t.pages.calendar.map;
  const geo = useGeocodes();
  const { getClub } = useOrganizations();

  const { mapped, unmapped } = useMemo(() => {
    const mapped: MapMarker[] = [];
    const unmapped: TournamentDto[] = [];
    if (!geo.data) return { mapped, unmapped };
    for (const tournament of tournaments) {
      // 3.1: tournaments with no city of their own fall back to the organizing
      // club's city (orgType 1 → orgNumber is the club id).
      const fallbackCity =
        !tournament.city?.trim() && tournament.orgType === 1
          ? getClub(tournament.orgNumber)?.city
          : undefined;
      const point = resolveTournamentLocation(geo.data, tournament, fallbackCity);
      if (point) mapped.push({ tournament, point });
      else unmapped.push(tournament);
    }
    return { mapped, unmapped };
  }, [geo.data, tournaments, getClub]);

  const busy = loading || geo.loading;
  const message = error || geo.error;

  if (message) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
        {message}
      </div>
    );
  }

  if (busy) {
    return (
      <div className="flex h-[70vh] min-h-[420px] w-full items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {tm.loading}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {tm.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{tm.cityNote}</p>
      <TournamentMap markers={mapped} language={language} />
      <p className="text-[11px] text-gray-400 dark:text-gray-500">{tm.attribution}</p>

      {unmapped.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {tm.unmapped.replace('{count}', String(unmapped.length))}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{tm.unmappedHint}</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {unmapped.map((tournament) => (
              <li key={tournament.id}>
                <Link href={`/results/${tournament.id}`} color="blue" underline="hover">
                  {tournament.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
