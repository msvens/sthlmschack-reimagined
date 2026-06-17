'use client';

/**
 * Club Map tab for the organizations page. Resolves each active club to a
 * street-level coordinate (falling back to its city centre), and lists the rest
 * so nothing disappears silently. The Leaflet map is code-split (ssr:false).
 */
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Link } from '@/components/Link';
import { type Language } from '@/context/LanguageContext';
import { type ClubDTO } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useGeocodes, useClubGeocodes, resolveClubLocation } from '@/lib/geo/geocodeLoader';
import { type ClubMarker } from './ClubMap';

const ClubMap = dynamic(() => import('./ClubMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] min-h-[420px] w-full items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      …
    </div>
  ),
});

interface ClubMapViewProps {
  clubs: ClubDTO[];
  language: Language;
  loading?: boolean;
  error?: string;
}

export function ClubMapView({ clubs, language, loading, error }: ClubMapViewProps) {
  const t = getTranslation(language);
  const tm = t.pages.organizations.map;
  const city = useGeocodes();
  const club = useClubGeocodes();

  const { mapped, unmapped } = useMemo(() => {
    const mapped: ClubMarker[] = [];
    const unmapped: ClubDTO[] = [];
    if (!club.data) return { mapped, unmapped };
    for (const c of clubs) {
      const point = resolveClubLocation(club.data, city.data, c);
      if (point) mapped.push({ club: c, point });
      else unmapped.push(c);
    }
    return { mapped, unmapped };
  }, [club.data, city.data, clubs]);

  // The street-level table is required; the city table is only a fallback.
  const busy = loading || club.loading || city.loading;
  const message = error || club.error;

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

  if (clubs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {tm.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{tm.streetNote}</p>
      <ClubMap markers={mapped} language={language} />
      <p className="text-[11px] text-gray-400 dark:text-gray-500">{tm.attribution}</p>

      {unmapped.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {tm.unmapped.replace('{count}', String(unmapped.length))}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{tm.unmappedHint}</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {unmapped.map((c) => (
              <li key={c.id}>
                <Link href={`/organizations/clubs/${c.id}`} color="blue" underline="hover">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
