'use client';

import { useParams } from 'next/navigation';
import { PageSpacing } from '@/components/layout/PageSpacing';
import { Card } from '@/components/Card';

export default function TournamentPlayerDetailPage() {
  const params = useParams();
  const tournamentId = params.tournamentId;
  const memberId = params.memberId;

  return (
    <>
      <PageSpacing />
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card padding="lg">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Player Detail Page (Placeholder)
            </h1>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Tournament ID: {tournamentId}</p>
              <p>Member ID: {memberId}</p>
              <p className="mt-4 text-sm">
                This is a placeholder page. The actual implementation will show detailed
                player performance for this specific tournament.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}