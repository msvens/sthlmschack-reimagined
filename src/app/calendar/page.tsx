'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { TournamentList } from "@/components/TournamentList";
import { DistrictFilter, DistrictCount } from "@/components/DistrictFilter";
import { useOrganizations } from "@/context/OrganizationsContext";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { TournamentService } from '@/lib/api';
import type { TournamentDto } from '@/lib/api/types';

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { getDistrictIdForOrganizer } = useOrganizations();

  const [allTournaments, setAllTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  // Fetch all tournaments once
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);

      try {
        const tournamentService = new TournamentService();
        const response = await tournamentService.searchComingTournaments();

        if (response.status === 200 && response.data) {
          setAllTournaments(response.data);
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

  // Map tournaments to districts (instant lookup with pre-loaded data)
  const tournamentDistricts = useMemo(() => {
    const map = new Map<number, number | null>();
    allTournaments.forEach(tournament => {
      const districtId = getDistrictIdForOrganizer(tournament.orgType, tournament.orgNumber);
      map.set(tournament.id, districtId);
    });
    return map;
  }, [allTournaments, getDistrictIdForOrganizer]);

  // Filter tournaments based on selected district
  const filteredTournaments = useMemo(() => {
    if (selectedDistrictId === null) {
      return allTournaments;
    } else if (selectedDistrictId === -1) {
      // Show "Övriga" - tournaments without district
      return allTournaments.filter(t => tournamentDistricts.get(t.id) === null);
    } else {
      // Show tournaments for selected district
      return allTournaments.filter(t => tournamentDistricts.get(t.id) === selectedDistrictId);
    }
  }, [allTournaments, tournamentDistricts, selectedDistrictId]);

  // Calculate district counts
  const districtCounts = useMemo((): DistrictCount[] => {
    const counts = new Map<number | null, number>();

    allTournaments.forEach(tournament => {
      const districtId = tournamentDistricts.get(tournament.id);
      counts.set(districtId ?? null, (counts.get(districtId ?? null) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([districtId, count]) => ({
      districtId,
      count
    }));
  }, [allTournaments, tournamentDistricts]);

  return (
    <PageLayout maxWidth="4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-200">
        {t.pages.calendar.title}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {t.pages.calendar.subtitle}
      </p>

      {/* District Filter - Dropdown at top */}
      <div className="mb-4 max-w-md mx-auto">
        <DistrictFilter
          selectedDistrictId={selectedDistrictId}
          onDistrictSelect={setSelectedDistrictId}
          variant="dropdown"
          language={language}
          transparent
          districtCounts={districtCounts}
          totalCount={allTournaments.length}
        />
      </div>

      <TournamentList
        tournaments={filteredTournaments}
        loading={loading}
        error={error || undefined}
        language={language}
      />
    </PageLayout>
  );
}
