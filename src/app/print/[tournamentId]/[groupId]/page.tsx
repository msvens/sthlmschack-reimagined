'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { loadPrintData, buildGroupNav, type PrintData } from '@/components/print/printData';
import { PrintToolbar } from '@/components/print/PrintToolbar';
import { PrintableTournament } from '@/components/print/PrintableTournament';
import type { FontMode } from '@/components/print/printStyle';

export default function GroupPrintPage() {
  const params = useParams();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [fontMode, setFontMode] = useState<FontMode>('medium');
  const [auto, setAuto] = useState(true);
  // Default to just this group; the toolbar's "all groups" toggle re-fetches all.
  const [allGroups, setAllGroups] = useState(false);
  const effectiveGroupId = allGroups ? undefined : groupId ?? undefined;

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (tournamentId == null || Number.isNaN(tournamentId) || groupId == null || Number.isNaN(groupId)) {
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
  }, [tournamentId, groupId, effectiveGroupId, t.pages.tournamentResults.error]);

  // Distinct rounds present across the target group(s); default to the latest.
  const rounds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.groups.flatMap((g) => g.rounds))].sort((a, b) => a - b);
  }, [data]);

  const nav = useMemo(
    () => (data && groupId != null ? buildGroupNav(data.tournament, groupId) : null),
    [data, groupId],
  );

  useEffect(() => {
    if (rounds.length === 0) return;
    const pick = () => setRound(rounds[rounds.length - 1]);
    pick();
  }, [rounds]);

  return (
    <div className="px-4 pb-10 pt-20 print:p-0">
      {loading && (
        <div className="text-center text-gray-600 dark:text-gray-400">{t.pages.tournamentResults.loading}</div>
      )}
      {error && !loading && <div className="text-center text-red-600 dark:text-red-400">{error}</div>}
      {data && !loading && round != null && groupId != null && nav && (
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
            classOptions={nav.classOptions}
            currentClassId={nav.currentClassId}
            groupOptions={nav.groupOptions}
            groupId={groupId}
            tournamentId={tournamentId as number}
          />
          <PrintableTournament data={data} round={round} fontMode={fontMode} auto={auto} />
        </>
      )}
    </div>
  );
}
