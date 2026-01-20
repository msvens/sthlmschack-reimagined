'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { TournamentList } from "@/components/TournamentList";
import { DistrictFilter, DistrictCount } from "@/components/DistrictFilter";
import { TournamentCategoryFilter, TournamentTypeFilter, TournamentStateFilter } from "@/components/filters";
import { useOrganizations } from "@/context/OrganizationsContext";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { TournamentService } from '@/lib/api';
import type { TournamentDto } from '@/lib/api/types';
import {
  TournamentCategory,
  countByCategory,
  countByType,
  countByState,
  filterByCategory,
  filterByType,
  filterByState,
} from '@/lib/utils/tournamentFilters';

export default function CalendarPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { getDistrictIdForOrganizer } = useOrganizations();

  const [allTournaments, setAllTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory>('all');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

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

  // Filter tournaments by district first
  const districtFilteredTournaments = useMemo(() => {
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

  // Calculate category counts (based on district-filtered data)
  const categoryCounts = useMemo(
    () => countByCategory(districtFilteredTournaments),
    [districtFilteredTournaments]
  );

  // Filter by category
  const categoryFilteredTournaments = useMemo(
    () => filterByCategory(districtFilteredTournaments, selectedCategory),
    [districtFilteredTournaments, selectedCategory]
  );

  // Calculate type counts (based on category-filtered data)
  const typeCounts = useMemo(
    () => countByType(categoryFilteredTournaments),
    [categoryFilteredTournaments]
  );

  // Filter by type
  const typeFilteredTournaments = useMemo(
    () => filterByType(categoryFilteredTournaments, selectedType),
    [categoryFilteredTournaments, selectedType]
  );

  // Calculate state counts (based on type-filtered data)
  const stateCounts = useMemo(
    () => countByState(typeFilteredTournaments),
    [typeFilteredTournaments]
  );

  // Final filtered tournaments (category → type → state)
  const filteredTournaments = useMemo(
    () => filterByState(typeFilteredTournaments, selectedState),
    [typeFilteredTournaments, selectedState]
  );

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

      {/* Filters - 2x2 grid on small screens, 4 columns on medium+ */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <DistrictFilter
          selectedDistrictId={selectedDistrictId}
          onDistrictSelect={setSelectedDistrictId}
          variant="dropdown"
          language={language}
          transparent
          compact
          districtCounts={districtCounts}
          totalCount={allTournaments.length}
        />
        <TournamentCategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          counts={categoryCounts}
          language={language}
          variant="dropdown"
          transparent
          compact
        />
        <TournamentTypeFilter
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          counts={typeCounts}
          language={language}
          variant="dropdown"
          transparent
          compact
        />
        <TournamentStateFilter
          selectedState={selectedState}
          onStateSelect={setSelectedState}
          counts={stateCounts}
          language={language}
          variant="dropdown"
          transparent
          compact
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
