'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { DistrictFilter } from "@/components/DistrictFilter";
import { TournamentList } from "@/components/TournamentList";
import { TournamentCategoryFilter, TournamentTypeFilter, TournamentStateFilter } from "@/components/filters";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { TournamentService } from "@/lib/api/services/tournaments";
import type { TournamentDto, GroupSearchAnswerDto } from "@/lib/api/types";
import {
  TournamentCategory,
  countByCategory,
  countByType,
  countByState,
  filterByCategory,
  filterByType,
  filterByState,
} from '@/lib/utils/tournamentFilters';

export default function ResultsPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Helper: Get default date range (10 days back)
  const getDefaultDateRange = () => {
    const now = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    return {
      start: tenDaysAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDateRange();

  // Search states
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  const [searchText, setSearchText] = useState<string>('');

  // Filter states (for client-side filtering of results)
  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory>('all');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  // Data states - tournaments from API search
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const tournamentService = new TournamentService();

  // Helper: Format date to YYYY-MM-DDTHH:mm:ss
  const formatDateForApi = (dateString: string): string => {
    return `${dateString}T00:00:00`;
  };

  // Helper: Deduplicate tournaments by ID, keeping the one with the most recent latestUpdated
  const deduplicateTournaments = (tournaments: TournamentDto[]): TournamentDto[] => {
    const uniqueTournaments = new Map<number, TournamentDto>();

    tournaments.forEach(tournament => {
      const existing = uniqueTournaments.get(tournament.id);
      if (!existing) {
        uniqueTournaments.set(tournament.id, tournament);
      } else {
        // Keep the one with the most recent latestUpdated
        const existingDate = existing.latestUpdated ? new Date(existing.latestUpdated).getTime() : 0;
        const newDate = tournament.latestUpdated ? new Date(tournament.latestUpdated).getTime() : 0;
        if (newDate > existingDate) {
          uniqueTournaments.set(tournament.id, tournament);
        }
      }
    });

    return Array.from(uniqueTournaments.values());
  };

  // Helper: Deduplicate tournament groups and create tournament objects from text search results
  // Note: Only used for text search, which returns GroupSearchAnswerDto[]
  const deduplicateAndConvertTournaments = (groups: GroupSearchAnswerDto[]): TournamentDto[] => {
    const uniqueTournaments = new Map<number, GroupSearchAnswerDto>();

    // Keep first occurrence of each tournament
    groups.forEach(group => {
      if (!uniqueTournaments.has(group.tournamentid)) {
        uniqueTournaments.set(group.tournamentid, group);
      }
    });

    // Convert to TournamentDto with placeholder data for missing fields
    return Array.from(uniqueTournaments.values()).map(group => ({
      id: group.tournamentid,
      name: group.tournamentname,
      start: '', // Will show as "-" in the table
      end: '', // Will show as "-" in the table
      city: '',
      arena: '',
      type: 0,
      ia: 0,
      secjudges: '',
      thinkingTime: '',
      state: 0,
      allowForeignPlayers: 0,
      teamtournamentPlayerListType: 0,
      ageFilter: 0,
      nrOfPartLink: '',
      orgType: 0, // Will show as "-" in the table
      orgNumber: 0, // Will show as "-" in the table
      ratingRegDate: '',
      ratingRegDate2: '',
      fideregged: 0,
      online: 0,
      y2cRules: 0,
      teamNrOfDaysRegged: 0,
      showPublic: 0,
      invitationurl: '',
      latestUpdated: group.latestUpdatedGame || '',
      secParsedJudges: [],
      rootClasses: [],
    } as TournamentDto));
  };

  // Load default data: tournaments updated in last 10 days
  const loadDefaultTournaments = async () => {
    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const startDateStr = formatDateForApi(tenDaysAgo.toISOString().split('T')[0]);
      const endDateStr = formatDateForApi(now.toISOString().split('T')[0]);

      const response = await tournamentService.searchUpdatedTournaments(
        startDateStr,
        endDateStr
      );

      if (response.data) {
        // Deduplicate and sort by latestUpdated (descending - most recent first)
        const dedupedTournaments = deduplicateTournaments(response.data);
        const sortedTournaments = dedupedTournaments.sort((a, b) => {
          const dateA = a.latestUpdated ? new Date(a.latestUpdated).getTime() : 0;
          const dateB = b.latestUpdated ? new Date(b.latestUpdated).getTime() : 0;
          return dateB - dateA;
        });
        setTournaments(sortedTournaments);
      } else {
        setError(response.error || 'Failed to load tournaments');
      }
    } catch (err) {
      setError('An error occurred while loading tournaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadDefaultTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle date range search
  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startDateStr = formatDateForApi(startDate);
      const endDateStr = formatDateForApi(endDate);

      const response = await tournamentService.searchUpdatedTournaments(
        startDateStr,
        endDateStr,
        selectedDistrictId !== null ? selectedDistrictId : undefined
      );

      if (response.data) {
        // Deduplicate and sort by latestUpdated (descending - most recent first)
        const dedupedTournaments = deduplicateTournaments(response.data);
        const sortedTournaments = dedupedTournaments.sort((a, b) => {
          const dateA = a.latestUpdated ? new Date(a.latestUpdated).getTime() : 0;
          const dateB = b.latestUpdated ? new Date(b.latestUpdated).getTime() : 0;
          return dateB - dateA;
        });
        setTournaments(sortedTournaments);
      } else {
        setError(response.error || 'Failed to search tournaments');
      }
    } catch (err) {
      setError('An error occurred while searching tournaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchText.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await tournamentService.searchGroups(searchText.trim());

      if (response.data) {
        const tournamentsData = deduplicateAndConvertTournaments(response.data);
        setTournaments(tournamentsData);
      } else {
        setError(response.error || 'Failed to search tournaments');
      }
    } catch (err) {
      setError('An error occurred while searching tournaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering chain: Category → Type → State
  // Calculate category counts (based on all search results)
  const categoryCounts = useMemo(
    () => countByCategory(tournaments),
    [tournaments]
  );

  // Filter by category
  const categoryFilteredTournaments = useMemo(
    () => filterByCategory(tournaments, selectedCategory),
    [tournaments, selectedCategory]
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

  // Final filtered tournaments
  const filteredTournaments = useMemo(
    () => filterByState(typeFilteredTournaments, selectedState),
    [typeFilteredTournaments, selectedState]
  );

  return (
    <PageLayout maxWidth="4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-200">
        {t.pages.results.title}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {t.pages.results.subtitle}
      </p>

      {/* Search Section */}
      <div className="mb-6 space-y-3">
        {/* Line 1: Start date | End date | District | Search button */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 min-w-0">
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              compact
            />
          </div>
          <div className="flex-1 min-w-0">
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              compact
            />
          </div>
          <div className="flex-1 min-w-0">
            <DistrictFilter
              selectedDistrictId={selectedDistrictId}
              onDistrictSelect={setSelectedDistrictId}
              variant="dropdown"
              language={language}
              showLabel={false}
              compact
              transparent
            />
          </div>
          <Button
            onClick={handleDateRangeSearch}
            variant="outlined"
            disabled={loading}
            compact
          >
            {t.pages.results.filters.dateRange.searchButton}
          </Button>
        </div>

        {/* Line 2: Free text search */}
        <div className="flex items-center gap-3">
          <TextField
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t.pages.results.filters.textSearch.placeholder}
            fullWidth
            compact
          />
          <Button
            onClick={handleTextSearch}
            variant="outlined"
            disabled={loading}
            compact
          >
            {t.pages.results.filters.textSearch.searchButton}
          </Button>
        </div>
      </div>

      {/* Divider - separating search from filters */}
      <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

      {/* Filters Section: Category | Type | Status */}
      <div className="mb-6 grid grid-cols-3 gap-4">
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

      {/* Results */}
      <TournamentList
        tournaments={filteredTournaments}
        loading={loading}
        error={error}
        language={language}
        showUpdatedColumn={true}
      />
    </PageLayout>
  );
}