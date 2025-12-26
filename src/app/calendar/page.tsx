'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/Card";
import { TournamentList } from "@/components/TournamentList";
import { TextField } from "@/components/TextField";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { TournamentService } from '@/lib/api';
import type { TournamentDto } from '@/lib/api/types';

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);

      try {
        const tournamentService = new TournamentService();
        const response = await tournamentService.searchComingTournaments();

        if (response.status === 200 && response.data) {
          setTournaments(response.data);
        } else {
          setError(language === 'sv'
            ? 'Kunde inte ladda turneringar'
            : 'Failed to load tournaments');
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError(language === 'sv'
          ? 'Ett fel uppstod vid hämtning av turneringar'
          : 'An error occurred while fetching tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [language]);

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {t.pages.calendar.title}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {t.pages.calendar.subtitle}
      </p>

      {/* District Filter - Dummy for now */}
      <div className="mb-6">
        <TextField
          label={language === 'sv' ? 'Distrikt (kommande)' : 'District (coming soon)'}
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          placeholder={language === 'sv' ? 'Filtrera på distrikt...' : 'Filter by district...'}
          disabled
        />
      </div>

      <Card padding="lg" border={false}>
        <TournamentList
          tournaments={tournaments}
          loading={loading}
          error={error || undefined}
          emptyMessage={language === 'sv'
            ? 'Inga kommande turneringar hittades'
            : 'No upcoming tournaments found'}
          language={language}
        />
      </Card>
    </PageLayout>
  );
}
