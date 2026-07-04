'use client';

import { Link } from '@/components/Link';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import type { JgpSeason } from '@/data/jgp/types';

/**
 * Reference list mapping each numbered standings column to its tournament,
 * linking to the results page. The numbered column headers link too; this list
 * is the key that spells out the full names and dates.
 */
export function JgpTournamentLegend({ season }: { season: JgpSeason }) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <div className="mb-2">
      <h2 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
        {t.pages.junior.tournamentsHeading}
      </h2>
      <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        {season.tournaments.map((tourn, i) => (
          <li key={tourn.tournamentId} className="flex gap-2">
            <span className="tabular-nums text-gray-400 dark:text-gray-500 w-5 text-right shrink-0">
              {i + 1}.
            </span>
            <Link href={`/results/${tourn.tournamentId}`}>{tourn.label}</Link>
            <span className="tabular-nums text-gray-400 dark:text-gray-500">{tourn.date}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
