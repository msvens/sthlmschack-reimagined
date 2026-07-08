'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageTitle } from '@/components/PageTitle';
import { Link } from '@/components/Link';
import { SelectableList } from '@/components/SelectableList';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { jgpSeasons } from '@/data/jgp/seasons';
import type { JgpDivision, JgpSeason } from '@/data/jgp/types';
import { useJgpStandings } from '@/lib/junior/useJgpStandings';
import { JgpStandingsTable } from './JgpStandingsTable';
import { JgpTournamentLegend } from './JgpTournamentLegend';
import {
  getSavedDivision,
  setSavedDivision,
  getSavedYear,
  setSavedYear,
} from './juniorPrefs';

const DIVISIONS: JgpDivision[] = ['open', 'girls'];

/** The Stockholms JGP standings view: division tabs, year select, tables. */
export function JgpStandings() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [division, setDivision] = useState<JgpDivision>('open');
  // Seed with the newest open season deterministically (no localStorage) so SSR
  // and first client render match and there's no no-data flash before the
  // year-restore effect runs.
  const [year, setYear] = useState<number | null>(() => {
    const ys = jgpSeasons
      .filter((s) => s.division === 'open')
      .map((s) => s.year)
      .sort((a, b) => b - a);
    return ys[0] ?? null;
  });

  // Available years for the current division, newest first.
  const years = useMemo(
    () =>
      jgpSeasons
        .filter((s) => s.division === division)
        .map((s) => s.year)
        .sort((a, b) => b - a),
    [division],
  );

  // Restore saved division once on mount.
  useEffect(() => {
    const restore = () => {
      const saved = getSavedDivision();
      if (saved) setDivision(saved);
    };
    restore();
  }, []);

  // Pick the saved year if still valid, else default to the newest.
  useEffect(() => {
    const apply = () => {
      const saved = getSavedYear();
      setYear(saved && years.includes(saved) ? saved : years[0] ?? null);
    };
    apply();
  }, [years]);

  const selectDivision = (d: JgpDivision) => {
    setDivision(d);
    setSavedDivision(d);
  };
  const selectYear = (y: number) => {
    setYear(y);
    setSavedYear(y);
  };

  const season = useMemo(
    () => jgpSeasons.find((s) => s.division === division && s.year === year) ?? null,
    [division, year],
  );

  return (
    <>
      {/* Under-construction / demo banner */}
      <div className="mb-4 p-3 rounded-lg border border-orange-300 dark:border-orange-700/50 bg-orange-50 dark:bg-orange-900/20 text-sm font-medium text-orange-800 dark:text-orange-200">
        {t.pages.junior.demoBanner}
      </div>

      <PageTitle
        title={t.pages.junior.title}
        subtitle={
          <>
            {t.pages.junior.subtitle} ·{' '}
            <Link
              href="https://www.stockholmsschack.se/juniortavlingar/#junior-grand-prix"
              external
            >
              {t.pages.junior.officialPageLink}
            </Link>
          </>
        }
      />

      {/* Division tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {DIVISIONS.map((d) => (
          <button
            key={d}
            onClick={() => selectDivision(d)}
            className={`pb-2 text-sm font-medium transition-colors ${
              division === d
                ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.pages.junior.tabs[d]}
          </button>
        ))}
      </div>

      {!season ? (
        <p className="text-gray-600 dark:text-gray-400 py-8">{t.pages.junior.noData}</p>
      ) : (
        <>
          {/* Season select — custom dropdown, not a native <select> */}
          <div className="mb-6 w-40">
            <SelectableList
              variant="dropdown"
              title={t.pages.junior.year}
              items={years.map((y) => ({ id: y, label: String(y) }))}
              selectedId={year ?? years[0]}
              onSelect={(id) => selectYear(Number(id))}
              compact
            />
          </div>

          {division === 'girls' ? (
            <GirlsStandings season={season} />
          ) : (
            <OpenStandings season={season} />
          )}
        </>
      )}
    </>
  );
}

/** Renders the girls-division standings — one flat percentile-scored table. */
function GirlsStandings({ season }: { season: JgpSeason }) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { tables, loading, error } = useJgpStandings(season);
  const table = tables?.[0] ?? null;

  return (
    <>
      <div className="mb-6 p-3 rounded border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-200">
        {t.pages.junior.disclaimer}
      </div>

      <div className="mb-8">
        <JgpTournamentLegend season={season} />
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 py-8">{t.pages.junior.loading}</p>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400 py-8">
          {t.pages.junior.error}: {error}
        </p>
      ) : !table || table.rows.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 py-8">{t.pages.junior.noData}</p>
      ) : (
        <JgpStandingsTable table={table} tournaments={season.tournaments} />
      )}
    </>
  );
}

/** Renders the open-division standings for a resolved season. */
function OpenStandings({ season }: { season: JgpSeason }) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { tables, loading, error } = useJgpStandings(season);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  const active =
    tables?.find((tb) => tb.ageClass.label === selectedAge) ?? tables?.[0] ?? null;

  return (
    <>
      <div className="mb-6 p-3 rounded border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-200">
        {t.pages.junior.disclaimer}
      </div>

      {/* Tournaments list + finals link, above the tables */}
      <div className="mb-8">
        <JgpTournamentLegend season={season} />
        {season.finalsTournamentId != null && (
          <p className="mt-2 text-sm">
            <Link href={`/results/${season.finalsTournamentId}`}>{t.pages.junior.finalsLink}</Link>
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 py-8">{t.pages.junior.loading}</p>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400 py-8">
          {t.pages.junior.error}: {error}
        </p>
      ) : !tables || tables.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 py-8">{t.pages.junior.noData}</p>
      ) : (
        <>
          {/* Age-group tabs */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-200 dark:border-gray-700 mb-4">
            {tables.map((tb) => {
              const isActive = active?.ageClass.label === tb.ageClass.label;
              return (
                <button
                  key={tb.ageClass.label}
                  onClick={() => setSelectedAge(tb.ageClass.label)}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tb.ageClass.label}
                </button>
              );
            })}
          </div>

          {active && <JgpStandingsTable table={active} tournaments={season.tournaments} />}
        </>
      )}
    </>
  );
}
