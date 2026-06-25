'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService, getResultDisplayString, normalizeEloLookupDate, parseLocalDate, getOpponentKind, isTeamPairing, isLooseTeamTournament, TournamentDto, TournamentClassDto, TournamentClassGroupDto, TournamentEndResultDto, TournamentRoundResultDto, TeamTournamentEndResultDto, getTournamentStatus } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults, PlayerDateRequest } from '@/context/GroupResultsContext';
import { FinalResultsTable } from '@/components/results/FinalResultsTable';
import { TeamFinalResultsTable } from '@/components/results/TeamFinalResultsTable';
import { RegistrationTable } from '@/components/results/RegistrationTable';
import { TeamRoundResults } from '@/components/results/TeamRoundResults';
import { LiveUpdatesToggle } from '@/components/results/LiveUpdatesToggle';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';
import { useLiveUpdates } from '@/hooks';

/**
 * Parse a date string to Unix timestamp in milliseconds
 */
function parseDateToTimestamp(dateStr: string): number {
  const asNumber = Number(dateStr);
  if (!isNaN(asNumber) && asNumber > 0) return asNumber;
  return new Date(dateStr).getTime();
}

/**
 * Format a date string for compact display (e.g., "26-01-15" or "1/15/26" depending on locale)
 */
function formatRoundDate(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const timestamp = parseDateToTimestamp(dateStr);
  if (isNaN(timestamp) || timestamp <= 0) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: '2-digit' });
}

/**
 * Notice rendered for tournament formats we can't yet render properly
 * (Schackfyran team aggregation, loose-team team-name resolution).
 * Points the user at the official schack.se page for the accurate view.
 */
function ExternalResultsNotice({
  prefix,
  linkLabel,
  suffix,
  url,
}: {
  prefix: string;
  linkLabel: string;
  suffix: string;
  url: string;
}) {
  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {prefix}{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
        >
          {linkLabel}
        </a>
        {suffix.startsWith('.') || suffix.startsWith(',') ? suffix : ` ${suffix}`}
      </p>
    </div>
  );
}

export default function GroupResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get group-level data from context
  const {
    isTeamTournament,
    individualResults,
    individualRoundResults,
    teamResults,
    teamRoundResults,
    thinkingTime,
    rankingAlgorithm,
    groupStartDate,
    groupEndDate,
    group,
    loading: resultsLoading,
    error: resultsError,
    getPlayerName,
    getPlayerElo,
    getClubName,
    fetchPlayersByDate,
    getPlayerEloByDate,
    refreshResults,
    lastUpdated,
    roundsMap
  } = useGroupResults();

  // Live updates hook
  const {
    state: liveState,
    setEnabled: setLiveEnabled,
    manualRefresh
  } = useLiveUpdates({
    onRefresh: refreshResults
  });

  // Use appropriate results based on tournament type
  const groupResults = isTeamTournament ? [] : individualResults;
  const roundResults = isTeamTournament ? [] : individualRoundResults;

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

  // Group round results by round number for individual tournaments
  // Use individualRoundResults directly for stable reference
  const resultsByRound = useMemo(() => {
    if (isTeamTournament) return {};
    return individualRoundResults.reduce((acc, result) => {
      const round = result.roundNr || 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(result);
      return acc;
    }, {} as Record<number, TournamentRoundResultDto[]>);
  }, [isTeamTournament, individualRoundResults]);

  // Sorted list of round numbers we have data for.
  const sortedRounds = useMemo(
    () => Object.keys(resultsByRound).map(Number).sort((a, b) => a - b),
    [resultsByRound]
  );

  // The round currently being viewed. `selectedRound` holds the user's
  // explicit click (null until they click); otherwise we fall back to the
  // last available round, so the view defaults to the most recent round
  // even when it has no results yet — usually what the user is checking on.
  const activeRound = selectedRound ?? sortedRounds[sortedRounds.length - 1] ?? null;

  // Fetch historical player data for the round currently being viewed.
  useEffect(() => {
    if (isTeamTournament || !activeRound || resultsLoading) return;

    const roundGames = resultsByRound[activeRound];
    if (!roundGames || roundGames.length === 0) return;

    // Collect all (playerId, lookupDate) pairs for this round
    // Use normalizeEloLookupDate to fall back to current month for future rounds
    const requests: PlayerDateRequest[] = [];
    for (const game of roundGames) {
      const roundDate = parseDateToTimestamp(game.date);
      if (isNaN(roundDate) || roundDate <= 0) continue;

      const lookupDate = normalizeEloLookupDate(roundDate);
      // Skip bye/walkover slots — schack.se rejects negative IDs with 502s.
      if (getOpponentKind(game.homeId) === 'paired') {
        requests.push({ playerId: game.homeId, date: lookupDate });
      }
      if (getOpponentKind(game.awayId) === 'paired') {
        requests.push({ playerId: game.awayId, date: lookupDate });
      }
    }

    if (requests.length > 0) {
      // Fetch historical data (function will skip already cached entries)
      fetchPlayersByDate(requests);
    }
  }, [isTeamTournament, activeRound, resultsByRound, resultsLoading, fetchPlayersByDate]);

  useEffect(() => {
    if (!tournamentId || isNaN(tournamentId)) {
      setError('Invalid tournament ID');
      setLoading(false);
      return;
    }

    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError(null);

        const tournamentService = new TournamentService();
        const response = await tournamentService.getTournament(tournamentId);

        if (response.status !== 200) {
          throw new Error(response.error || 'Failed to fetch tournament data');
        }

        if (!response.data) {
          throw new Error('Tournament not found');
        }

        setTournament(response.data);

      } catch (err) {
        setError('Failed to load tournament information');
        console.error('Error fetching tournament:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Recursively collect all classes from class hierarchy
  const allClasses = useMemo((): TournamentClassDto[] => {
    if (!tournament?.rootClasses) return [];

    const classes: TournamentClassDto[] = [];

    const processClass = (tournamentClass: TournamentClassDto) => {
      classes.push(tournamentClass);

      // Recursively process subClasses
      if (tournamentClass.subClasses && tournamentClass.subClasses.length > 0) {
        tournamentClass.subClasses.forEach(subClass => {
          processClass(subClass);
        });
      }
    };

    tournament.rootClasses.forEach(rootClass => {
      processClass(rootClass);
    });

    return classes;
  }, [tournament]);

  // Find which class contains the current groupId
  const selectedClass = useMemo((): TournamentClassDto | null => {
    if (!groupId) return null;

    return allClasses.find(tournamentClass =>
      tournamentClass.groups?.some(group => group.id === groupId)
    ) || null;
  }, [allClasses, groupId]);

  // Get the currently selected group
  const selectedGroup = useMemo((): TournamentClassGroupDto | null => {
    if (!selectedClass) return null;

    return selectedClass.groups?.find(group => group.id === groupId) || null;
  }, [selectedClass, groupId]);

  // Convert classes to SelectableListItem format
  const selectableClasses = useMemo((): SelectableListItem[] => {
    return allClasses.map(tournamentClass => ({
      id: tournamentClass.classID,
      label: tournamentClass.className || `Class ${tournamentClass.classID}`,
      tooltip: tournamentClass.className
    }));
  }, [allClasses]);

  // Convert groups to SelectableListItem format (only from selected class)
  const selectableGroups = useMemo((): SelectableListItem[] => {
    if (!selectedClass?.groups) return [];

    return selectedClass.groups.map(group => ({
      id: group.id,
      label: group.name,
      tooltip: group.name
    }));
  }, [selectedClass]);

  // Don't show loading message - it causes a brief flash on navigation
  // The content will appear once tournament data is loaded
  if (loading) {
    return <PageLayout fullScreen>{null}</PageLayout>;
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

  if (!tournament) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Tournament not found
          </div>
        </div>
      </PageLayout>
    );
  }

  const hasMultipleClasses = allClasses.length > 1;
  const hasMultipleGroups = selectedClass?.groups ? selectedClass.groups.length > 1 : false;
  const isSingleGroup = !hasMultipleClasses && !hasMultipleGroups;

  // Determine tournament/group state for display
  // These are only used when resultsLoading is false (guarded in JSX)
  //
  // Derive status via the SDK helper (the same one the results/calendar lists
  // use). Group dates take precedence over the tournament's; `tournament`
  // supplies the (weak) state hint; a non-empty roundResults array proves the
  // event has started — so a stale "registration" state can't mislabel it.
  const roundResultsForStatus = isTeamTournament ? teamRoundResults : individualRoundResults;
  const status = group
    ? getTournamentStatus({ group, tournament: tournament ?? undefined, roundResults: roundResultsForStatus })
    : tournament
      ? getTournamentStatus({ tournament, roundResults: roundResultsForStatus })
      : 'unknown';
  const isNotStarted = status === 'upcoming';
  const isFinished = status === 'finished';

  // Special-format detection — see the tournament-formats reference notes.
  //
  // Two distinct cases need to surface a notice, with different reasons,
  // different copy, and different rendering shapes:
  //
  //   1. Individually-paired team tournament (e.g. Schackfyran, type 9):
  //      identity-wise a team competition, but pairings are individual. No
  //      team-standings endpoint exists upstream for this format, so the
  //      layout skips the fetch entirely and the page renders ONLY the
  //      notice — full replacement.
  //
  //   2. Loose team tournament (teamtournamentPlayerListType === 3, e.g.
  //      Skol-SM): a team tournament where teams aren't bound to a single
  //      club, so standings rows come back with `club: null` and our display
  //      falls through to `Org <contenderId>` placeholders. The data itself
  //      (scores, board pairings) is correct, so we render it but with a
  //      banner on top explaining that team names aren't available.
  // Use the context boolean (populated from isTeamTournament(type) in the
  // layout) and combine with isTeamPairing from the SDK — true for
  // tournaments that are identity-wise team but use individual pairings.
  const isIndividuallyPairedTeam = tournament
    ? isTeamTournament && !isTeamPairing(tournament.type)
    : false;
  const isLooseTeam = tournament
    ? isLooseTeamTournament(tournament.teamtournamentPlayerListType)
    : false;
  const externalUrl = `https://resultat.schack.se/ShowTournamentServlet?id=${groupId}`;

  // Handle row click in final results table - navigate to player detail page
  const handlePlayerClick = (result: TournamentEndResultDto) => {
    if (result.playerInfo?.id && tournamentId && groupId) {
      router.push(`/results/${tournamentId}/${groupId}/${result.playerInfo.id}`);
    }
  };

  // Handle row click in team final results table - navigate to team detail page
  const handleTeamClick = (result: TeamTournamentEndResultDto) => {
    if (result.contenderId && tournamentId && groupId) {
      router.push(`/results/${tournamentId}/${groupId}/team/${result.contenderId}-${result.teamNumber}`);
    }
  };

  // Handle class selection - navigate to first group in that class
  const handleClassSelect = (id: string | number) => {
    const selectedClass = allClasses.find(c => c.classID === id);

    if (selectedClass?.groups && selectedClass.groups.length > 0) {
      const firstGroupId = selectedClass.groups[0].id;
      router.push(`/results/${tournamentId}/${firstGroupId}`);
    }
  };

  // Handle group selection - navigate to new groupId
  const handleGroupSelect = (id: string | number) => {
    router.push(`/results/${tournamentId}/${id}`);
  };

  return (
    <PageLayout fullScreen maxWidth="5xl">
      {/* Tournament Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-light mb-2 text-gray-900 dark:text-gray-200">
              {tournament.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{tournament.start} - {tournament.end}</span>
              {tournament.city && <span>{tournament.city}</span>}
            </div>
            {/* Print entry point — opens the print view (this group) in a new tab.
                The "all groups" option lives as a toggle in the print toolbar. */}
            <div className="mt-3 text-sm">
              <a
                href={`/results/${tournamentId}/print?group=${groupId}${activeRound ? `&round=${activeRound}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {t.pages.tournamentResults.print.printThisGroup}
              </a>
            </div>
          </div>

          {/* Responsive Flex Layout */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Class & Group Selection - Desktop: Left sidebar - only shown if needed */}
            {(hasMultipleClasses || hasMultipleGroups) && (
              <div className="hidden lg:block w-56 flex-shrink-0 space-y-4">
                {/* Class Selector - only shown if multiple classes - always dropdown */}
                {hasMultipleClasses && (
                  <SelectableList
                    items={selectableClasses}
                    selectedId={selectedClass?.classID || null}
                    onSelect={handleClassSelect}
                    title="Class"
                    variant="dropdown"
                  />
                )}

                {/* Group Selector - only shown if multiple groups - vertical list */}
                {hasMultipleGroups && (
                  <SelectableList
                    items={selectableGroups}
                    selectedId={groupId}
                    onSelect={handleGroupSelect}
                    title={t.pages.tournamentResults.groups}
                    variant="vertical"
                  />
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 lg:pr-2">
              {/* Class & Group Selection - Mobile/Tablet: Dropdowns at top */}
              <div className="lg:hidden mb-4 space-y-2">
                {/* Class Selector - only shown if multiple classes */}
                {hasMultipleClasses && (
                  <SelectableList
                    items={selectableClasses}
                    selectedId={selectedClass?.classID || null}
                    onSelect={handleClassSelect}
                    title="Class"
                    variant="dropdown"
                    compact
                    transparent
                  />
                )}

                {/* Group Selector - only shown if multiple groups */}
                {hasMultipleGroups && (
                  <SelectableList
                    items={selectableGroups}
                    selectedId={groupId}
                    onSelect={handleGroupSelect}
                    title={t.pages.tournamentResults.groups}
                    variant="dropdown"
                    compact
                    transparent
                  />
                )}
              </div>

              {selectedGroup && isIndividuallyPairedTeam ? (
                /* Individually-paired team tournament (Schackfyran today):
                 * no team-standings endpoint exists upstream, so the layout
                 * skips the fetch entirely and we always show this notice. */
                <ExternalResultsNotice
                  prefix={t.pages.tournamentResults.externalNotice.individuallyPairedTeam.prefix}
                  linkLabel={t.pages.tournamentResults.externalNotice.individuallyPairedTeam.linkLabel}
                  suffix={t.pages.tournamentResults.externalNotice.individuallyPairedTeam.suffix}
                  url={externalUrl}
                />
              ) : selectedGroup ? (
                <>
                  {/* Loose-team banner above the rendered content. The data
                   * itself is accurate; only the team labels are degraded
                   * (placeholder Org IDs). */}
                  {isLooseTeam && (
                    <ExternalResultsNotice
                      prefix={t.pages.tournamentResults.externalNotice.looseTeam.prefix}
                      linkLabel={t.pages.tournamentResults.externalNotice.looseTeam.linkLabel}
                      suffix={t.pages.tournamentResults.externalNotice.looseTeam.suffix}
                      url={externalUrl}
                    />
                  )}
                  {/* Main Results Table - only render when results are loaded */}
                  {resultsLoading ? (
                    // Don't show anything while loading - prevents flashing wrong state
                    null
                  ) : (
                  <div className="mb-6">
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                            {isNotStarted
                              ? t.pages.tournamentResults.registrationTable.title
                              : isFinished
                                ? t.pages.tournamentResults.finalResults
                                : t.pages.tournamentResults.ongoingResults}{!isSingleGroup && ` - ${selectedGroup.name}`}
                          </h3>
                          {isNotStarted && groupStartDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {t.pages.tournamentResults.tournamentStatus.groupStarts} {groupStartDate}
                            </p>
                          )}
                          {thinkingTime && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {thinkingTime}
                            </p>
                          )}
                        </div>
                        {/* Live controls: only show for non-finished tournaments */}
                        {!isFinished && (
                          <div className="sm:flex-shrink-0">
                            <LiveUpdatesToggle
                              enabled={liveState.enabled}
                              onToggle={setLiveEnabled}
                              lastUpdated={liveState.lastUpdated || lastUpdated}
                              isRefreshing={liveState.isRefreshing}
                              onManualRefresh={manualRefresh}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link to official results for same-day tournaments happening today */}
                    {groupStartDate && groupEndDate && groupStartDate === groupEndDate && (() => {
                      const today = new Date();
                      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      if (todayStr !== groupStartDate) return null;
                      return (
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                          <a
                            href={`https://resultat.schack.se/ShowTournamentServlet?id=${groupId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-900 dark:hover:text-gray-200"
                          >
                            {t.pages.tournamentResults.tournamentStatus.liveResultsLink} &rarr;
                          </a>
                        </p>
                      );
                    })()}

                    {/* Show status messages only for started tournaments with no results */}
                    {!isNotStarted && !resultsLoading && !resultsError && groupStartDate && (
                      (() => {
                        // Check if we have results based on tournament type
                        const hasResults = isTeamTournament ? teamResults.length > 0 : groupResults.length > 0;

                        if (hasResults) return null; // Don't show status message if we have results

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const endDate = groupEndDate ? parseLocalDate(groupEndDate) : null;
                        const hasEnded = endDate && today > endDate;

                        if (hasEnded) {
                          return (
                            <div className="p-8 text-center">
                              <div className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                                {t.pages.tournamentResults.tournamentStatus.noResultsAvailable}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                {t.pages.tournamentResults.tournamentStatus.groupCancelled}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-8 text-center">
                              <div className="text-gray-600 dark:text-gray-400">
                                {t.pages.tournamentResults.tournamentStatus.resultsComing}
                              </div>
                            </div>
                          );
                        }
                      })()
                    )}

                    {resultsLoading ? (
                      // While loading, don't show any table - just wait
                      // This prevents flashing wrong content before we know the tournament state
                      null
                    ) : isTeamTournament ? (
                      (teamResults.length > 0 || resultsError) && (
                        <TeamFinalResultsTable
                          results={teamResults}
                          getClubName={getClubName}
                          loading={false}
                          error={resultsError || undefined}
                          onRowClick={handleTeamClick}
                        />
                      )
                    ) : isNotStarted ? (
                      // Always show RegistrationTable for non-started tournaments
                      <RegistrationTable
                        results={groupResults}
                        rankingAlgorithm={rankingAlgorithm}
                        loading={false}
                        error={resultsError || undefined}
                        onRowClick={handlePlayerClick}
                      />
                    ) : (
                      (groupResults.length > 0 || resultsError) && (
                        <FinalResultsTable
                          results={groupResults}
                          rankingAlgorithm={rankingAlgorithm}
                          loading={false}
                          error={resultsError || undefined}
                          onRowClick={handlePlayerClick}
                        />
                      )
                    )}
                  </div>
                  )}

                  {/* Round-by-Round Results - only shown for started tournaments, hidden during loading */}
                  {!resultsLoading && !isNotStarted && (isTeamTournament ? (
                    /* Team Tournament Round Results */
                    tournamentId && groupId && teamRoundResults.length > 0 && (
                      <TeamRoundResults
                        roundResults={teamRoundResults}
                        getClubName={getClubName}
                        getPlayerName={getPlayerName}
                        getPlayerElo={getPlayerElo}
                        tournamentId={tournamentId}
                        groupId={groupId}
                        fetchPlayersByDate={fetchPlayersByDate}
                        getPlayerEloByDate={getPlayerEloByDate}
                      />
                    )
                  ) : (
                    /* Individual Tournament Round Results */
                    <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
                      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                          {t.pages.tournamentResults.roundByRound.title}
                        </h3>
                      </div>

                      {!resultsLoading && !resultsError && roundResults.length === 0 && (
                        <div className="p-6 text-center">
                          <div className="text-gray-600 dark:text-gray-400">
                            {t.pages.tournamentResults.roundByRound.noResults}
                          </div>
                        </div>
                      )}

                      {!resultsLoading && !resultsError && roundResults.length > 0 && (
                        <>
                          {/* Round Tabs */}
                          {(() => {
                            return (
                              <>
                                {/* Round Tab Navigation */}
                                <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                                  {sortedRounds.map(roundNumber => {
                                    // Primary: actual game date from results (more accurate)
                                    // Fallback: scheduled date from roundsMap (for future rounds or missing data)
                                    const roundDateStr = resultsByRound[roundNumber]?.[0]?.date
                                      || roundsMap.get(roundNumber)?.roundDate;
                                    const roundDate = formatRoundDate(roundDateStr, language);
                                    return (
                                      <button
                                        key={roundNumber}
                                        onClick={() => setSelectedRound(roundNumber)}
                                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                                          activeRound === roundNumber
                                            ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                      >
                                        <div>{t.pages.tournamentResults.roundByRound.round} {roundNumber}</div>
                                        {roundDate && (
                                          <div className={`text-xs ${
                                            activeRound === roundNumber
                                              ? 'text-blue-500 dark:text-blue-300'
                                              : 'text-gray-500 dark:text-gray-500'
                                          }`}>
                                            {roundDate}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Selected Round Content */}
                                <div className="p-4 md:p-6">
                                  {activeRound && resultsByRound[activeRound] && (() => {
                                    // Define columns for round-by-round table
                                    const roundColumns: TableColumn<TournamentRoundResultDto>[] = [
                                      {
                                        id: 'table',
                                        header: t.pages.tournamentResults.roundByRound.table,
                                        accessor: (row) => row.board || '-',
                                        align: 'left',
                                        noWrap: true
                                      },
                                      {
                                        id: 'white',
                                        header: t.pages.tournamentResults.roundByRound.white,
                                        accessor: (row) => getOpponentKind(row.homeId) !== 'paired'
                                          ? <span className="text-gray-500 dark:text-gray-400">{getPlayerName(row.homeId)}</span>
                                          : (
                                          <Link
                                            href={`/results/${tournamentId}/${groupId}/${row.homeId}`}
                                            color="gray"
                                          >
                                            {getPlayerName(row.homeId)}
                                          </Link>
                                        ),
                                        align: 'left'
                                      },
                                      {
                                        id: 'whiteElo',
                                        header: t.pages.tournamentResults.roundByRound.elo,
                                        accessor: (row) => {
                                          const roundDate = parseDateToTimestamp(row.date);
                                          const lookupDate = normalizeEloLookupDate(roundDate);
                                          return getPlayerEloByDate(row.homeId, lookupDate);
                                        },
                                        align: 'center',
                                        noWrap: true
                                      },
                                      {
                                        id: 'black',
                                        header: t.pages.tournamentResults.roundByRound.black,
                                        accessor: (row) => getOpponentKind(row.awayId) !== 'paired'
                                          ? <span className="text-gray-500 dark:text-gray-400">{getPlayerName(row.awayId)}</span>
                                          : (
                                          <Link
                                            href={`/results/${tournamentId}/${groupId}/${row.awayId}`}
                                            color="gray"
                                          >
                                            {getPlayerName(row.awayId)}
                                          </Link>
                                        ),
                                        align: 'left'
                                      },
                                      {
                                        id: 'blackElo',
                                        header: t.pages.tournamentResults.roundByRound.elo,
                                        accessor: (row) => {
                                          const roundDate = parseDateToTimestamp(row.date);
                                          const lookupDate = normalizeEloLookupDate(roundDate);
                                          return getPlayerEloByDate(row.awayId, lookupDate);
                                        },
                                        align: 'center',
                                        noWrap: true
                                      },
                                      {
                                        id: 'result',
                                        header: t.pages.tournamentResults.roundByRound.result,
                                        accessor: (row) => {
                                          // Show "-" for unplayed games (both results are 0)
                                          if (row.homeResult === 0 && row.awayResult === 0) {
                                            return '-';
                                          }
                                          // Use the underlying game's result code so walkovers,
                                          // byes, adjudications, and alternate point systems all
                                          // render with their proper suffix (e.g. "1 - 0 w.o").
                                          const gameResultCode = row.games?.[0]?.result;
                                          if (gameResultCode !== undefined) {
                                            return getResultDisplayString(gameResultCode);
                                          }
                                          return `${row.homeResult} - ${row.awayResult}`;
                                        },
                                        align: 'center',
                                        noWrap: true,
                                        cellStyle: { fontWeight: 'medium' }
                                      }
                                    ];

                                    return (
                                      <Table
                                        data={resultsByRound[activeRound]}
                                        columns={roundColumns}
                                        getRowKey={(row, index) => `${row.homeId}-${row.awayId}-${index}`}
                                      />
                                    );
                                  })()}
                                </div>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-6 rounded-lg border text-center bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.pages.tournamentResults.selectGroup}
                  </p>
                </div>
              )}
            </div>
          </div>
    </PageLayout>
  );
}
