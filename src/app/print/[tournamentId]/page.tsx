'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { TournamentService } from '@/lib/api';
import { firstGroupId } from '@/components/print/printData';

/** Redirects /print/[tournamentId] to the first group, mirroring /results/[tournamentId]. */
export default function PrintRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (tournamentId == null || Number.isNaN(tournamentId)) {
        setError(t.pages.tournamentResults.error);
        return;
      }
      try {
        const response = await new TournamentService().getTournament(tournamentId);
        if (response.status !== 200 || !response.data) throw new Error('not found');
        const gid = firstGroupId(response.data);
        if (cancelled) return;
        if (gid != null) router.replace(`/print/${tournamentId}/${gid}`);
        else setError(t.pages.tournamentResults.notFound);
      } catch {
        if (!cancelled) setError(t.pages.tournamentResults.error);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tournamentId, router, t.pages.tournamentResults.error, t.pages.tournamentResults.notFound]);

  return (
    <div className="px-4 pt-20 text-center text-gray-600 dark:text-gray-400">
      {error ?? t.pages.tournamentResults.loading}
    </div>
  );
}
