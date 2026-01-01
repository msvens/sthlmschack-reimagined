'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { DistrictFilter } from "@/components/DistrictFilter";
import { TournamentList } from "@/components/TournamentList";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { TournamentService } from "@/lib/api/services/tournaments";
import type { TournamentDto, TournamentSearchAnswerDto } from "@/lib/api/types";

export default function ResultsPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Helper: Get default date range (1 month back)
  const getDefaultDateRange = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return {
      start: oneMonthAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDateRange();

  // Filter states
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  const [searchText, setSearchText] = useState<string>('');

  // Data states
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const tournamentService = new TournamentService();

  // Helper: Format date to YYYY-MM-DDTHH:mm:ss
  const formatDateForApi = (dateString: string): string => {
    return `${dateString}T00:00:00`;
  };

  // Helper: Deduplicate tournament groups and create tournament objects from search results
  const deduplicateAndConvertTournaments = (groups: TournamentSearchAnswerDto[]): TournamentDto[] => {
    const uniqueTournaments = new Map<number, TournamentSearchAnswerDto>();

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
      secParsedJudges: [],
      rootClasses: [],
    } as TournamentDto));
  };

  // Load default data: tournaments updated in last 1 month
  const loadDefaultTournaments = async () => {
    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const startDateStr = formatDateForApi(oneMonthAgo.toISOString().split('T')[0]);
      const endDateStr = formatDateForApi(now.toISOString().split('T')[0]);

      const response = await tournamentService.searchUpdatedTournaments(
        startDateStr,
        endDateStr
      );

      if (response.data) {
        const tournamentsData = deduplicateAndConvertTournaments(response.data);
        setTournaments(tournamentsData);
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

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchText.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await tournamentService.searchTournaments(searchText.trim());

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

  return (
    <PageLayout maxWidth="4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-200">
        {t.pages.results.title}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {t.pages.results.subtitle}
      </p>

      {/* Compact Search Filters */}
      <div className="mb-6 space-y-3">
        {/* Date Range Search Section */}
        <div className="space-y-3">
          {/* Date Range - Line 1 */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </div>

          {/* District + Search button - Line 2 */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DistrictFilter
                selectedDistrictId={selectedDistrictId}
                onDistrictSelect={setSelectedDistrictId}
                variant="dropdown"
                language={language}
                showLabel={false}
              />
            </div>
            <Button
              onClick={handleDateRangeSearch}
              variant="outlined"
              disabled={loading}
            >
              {t.pages.results.filters.dateRange.searchButton}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Text Search Section */}
        <div className="flex items-center gap-3">
          <TextField
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t.pages.results.filters.textSearch.placeholder}
            fullWidth
          />
          <Button
            onClick={handleTextSearch}
            variant="outlined"
            disabled={loading}
          >
            {t.pages.results.filters.textSearch.searchButton}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div>
        <TournamentList
          tournaments={tournaments}
          loading={loading}
          error={error}
          language={language}
        />
      </div>
    </PageLayout>
  );
}