'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService } from '@/lib/api';
import { TournamentDto } from '@/lib/api/types';

export default function TournamentRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;

  useEffect(() => {
    if (!tournamentId || isNaN(tournamentId)) {
      setError('Invalid tournament ID');
      setLoading(false);
      return;
    }

    const fetchAndRedirect = async () => {
      try {
        setLoading(true);
        setError(null);

        const tournamentService = new TournamentService();
        const response = await tournamentService.getTournament(tournamentId);

        if (response.status !== 200 || !response.data) {
          throw new Error('Failed to fetch tournament data');
        }

        const tournament: TournamentDto = response.data;

        // Redirect to first available group
        if (tournament.rootClasses?.[0]?.groups?.[0]) {
          const firstGroupId = tournament.rootClasses[0].groups[0].id;
          router.replace(`/results/${tournamentId}/${firstGroupId}`);
        } else {
          setError('No groups found for this tournament');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load tournament');
        console.error('Error fetching tournament:', err);
        setLoading(false);
      }
    };

    fetchAndRedirect();
  }, [tournamentId, router]);

  if (loading) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading tournament results...
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
              Error Loading Tournament
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return null;
}
