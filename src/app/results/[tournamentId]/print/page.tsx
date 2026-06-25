'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { loadPrintData, type PrintData } from '@/components/results/print/printData';
import { PrintToolbar } from '@/components/results/print/PrintToolbar';
import { PrintableTournament } from '@/components/results/print/PrintableTournament';
import type { FontMode } from '@/components/results/print/printStyle';

export default function TournamentPrintPage() {
  const params = useParams();
  const search = useSearchParams();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupParam = search.get('group');
  const urlGroupId = groupParam ? parseInt(groupParam) : undefined;
  const roundParam = search.get('round');

  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [fontMode, setFontMode] = useState<FontMode>('medium');
  const [auto, setAuto] = useState(true);
  // Opened from a single group → default to just that group; the toolbar's
  // "all groups" toggle switches to the whole tournament (re-fetches).
  const [allGroups, setAllGroups] = useState(urlGroupId == null);
  const effectiveGroupId = allGroups ? undefined : urlGroupId;

  // Fetch print data on mount / when target changes.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (tournamentId == null || Number.isNaN(tournamentId)) {
        setError(t.pages.tournamentResults.error);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      loadPrintData(tournamentId, effectiveGroupId)
        .then((d) => {
          if (!cancelled) setData(d);
        })
        .catch(() => {
          if (!cancelled) setError(t.pages.tournamentResults.error);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tournamentId, effectiveGroupId, t.pages.tournamentResults.error]);

  // Distinct rounds present across the target group(s).
  const rounds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.groups.flatMap((g) => g.rounds))].sort((a, b) => a - b);
  }, [data]);

  // Initial round: ?round= if valid, else the latest present.
  useEffect(() => {
    if (rounds.length === 0) return;
    const pick = () => {
      const fromParam = roundParam ? Number(roundParam) : NaN;
      setRound(rounds.includes(fromParam) ? fromParam : rounds[rounds.length - 1]);
    };
    pick();
  }, [rounds, roundParam]);

  return (
    <div className="px-4 pb-10 pt-20 print:p-0">
      {loading && (
        <div className="text-center text-gray-600 dark:text-gray-400">{t.pages.tournamentResults.loading}</div>
      )}
      {error && !loading && (
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      )}
      {data && !loading && round != null && (
        <>
          <PrintToolbar
            rounds={rounds}
            selectedRound={round}
            onRoundChange={setRound}
            fontMode={fontMode}
            onFontModeChange={setFontMode}
            auto={auto}
            onAutoChange={setAuto}
            allGroups={allGroups}
            onAllGroupsChange={setAllGroups}
            multipleGroups={data.totalGroups > 1}
            tournamentId={tournamentId as number}
            groupId={urlGroupId}
          />
          <PrintableTournament
            data={data}
            round={round}
            fontMode={fontMode}
            auto={auto}
          />
        </>
      )}
    </div>
  );
}
