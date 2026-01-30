'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService, formatMatchResult } from '@/lib/api';
import { TournamentDto, TournamentClassDto, TournamentClassGroupDto, TournamentEndResultDto, TournamentRoundResultDto, TournamentState } from '@/lib/api/types';
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
    tournamentState,
    loading: resultsLoading,
    error: resultsError,
    getPlayerName,
    getPlayerElo,
    getPlayerClubId,
    getClubName,
    fetchPlayersByDate,
    getPlayerEloByDate,
    refreshResults,
    lastUpdated
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

  // Fetch historical player data when selecting a round in individual tournaments
  useEffect(() => {
    if (isTeamTournament || !selectedRound || resultsLoading) return;

    const roundGames = resultsByRound[selectedRound];
    if (!roundGames || roundGames.length === 0) return;

    // Collect all (playerId, roundDate) pairs for this round
    const requests: PlayerDateRequest[] = [];
    for (const game of roundGames) {
      const roundDate = parseDateToTimestamp(game.date);
      if (isNaN(roundDate) || roundDate <= 0) continue;

      requests.push({ playerId: game.homeId, date: roundDate });
      requests.push({ playerId: game.awayId, date: roundDate });
    }

    if (requests.length > 0) {
      // Fetch historical data (function will skip already cached entries)
      fetchPlayersByDate(requests);
    }
  }, [isTeamTournament, selectedRound, resultsByRound, resultsLoading, fetchPlayersByDate]);

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
  const getAllClasses = (): TournamentClassDto[] => {
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
  };

  // Find which class contains the current groupId
  const getSelectedClass = (): TournamentClassDto | null => {
    if (!groupId) return null;

    const allClasses = getAllClasses();
    return allClasses.find(tournamentClass =>
      tournamentClass.groups?.some(group => group.id === groupId)
    ) || null;
  };

  // Get the currently selected group
  const getSelectedGroup = (): TournamentClassGroupDto | null => {
    const selectedClass = getSelectedClass();
    if (!selectedClass) return null;

    return selectedClass.groups?.find(group => group.id === groupId) || null;
  };

  // Convert classes to SelectableListItem format
  const getSelectableClasses = (): SelectableListItem[] => {
    const allClasses = getAllClasses();
    return allClasses.map(tournamentClass => ({
      id: tournamentClass.classID,
      label: tournamentClass.className || `Class ${tournamentClass.classID}`,
      tooltip: tournamentClass.className
    }));
  };

  // Convert groups to SelectableListItem format (only from selected class)
  const getSelectableGroups = (): SelectableListItem[] => {
    const selectedClass = getSelectedClass();
    if (!selectedClass?.groups) return [];

    return selectedClass.groups.map(group => ({
      id: group.id,
      label: group.name,
      tooltip: group.name
    }));
  };

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

  const selectedGroup = getSelectedGroup();
  const selectedClass = getSelectedClass();
  const allClasses = getAllClasses();
  const hasMultipleClasses = allClasses.length > 1;
  const hasMultipleGroups = selectedClass?.groups ? selectedClass.groups.length > 1 : false;
  const isSingleGroup = !hasMultipleClasses && !hasMultipleGroups;

  // Determine tournament/group state for display
  // These are only used when resultsLoading is false (guarded in JSX)
  //
  // hasRoundResults: If there are round results, games have been played regardless of API state
  const hasRoundResults = isTeamTournament
    ? teamRoundResults.length > 0
    : individualRoundResults.length > 0;

  // isNotStarted: Show registration view only if state is REGISTRATION AND no games played
  const isNotStarted = !hasRoundResults && (
    tournamentState === TournamentState.REGISTRATION
    || (groupStartDate && tournamentState === null && new Date() < new Date(groupStartDate))
  );

  // isFinished: Group end date has passed
  const isFinished = groupEndDate && new Date() > new Date(groupEndDate);

  // Handle row click in final results table - navigate to player detail page
  const handlePlayerClick = (result: TournamentEndResultDto) => {
    if (result.playerInfo?.id && tournamentId && groupId) {
      router.push(`/results/${tournamentId}/${groupId}/${result.playerInfo.id}`);
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
          </div>

          {/* Responsive Flex Layout */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Class & Group Selection - Desktop: Left sidebar - only shown if needed */}
            {(hasMultipleClasses || hasMultipleGroups) && (
              <div className="hidden md:block w-56 flex-shrink-0 space-y-4">
                {/* Class Selector - only shown if multiple classes - always dropdown */}
                {hasMultipleClasses && (
                  <SelectableList
                    items={getSelectableClasses()}
                    selectedId={selectedClass?.classID || null}
                    onSelect={handleClassSelect}
                    title="Class"
                    variant="dropdown"
                  />
                )}

                {/* Group Selector - only shown if multiple groups - vertical list */}
                {hasMultipleGroups && (
                  <SelectableList
                    items={getSelectableGroups()}
                    selectedId={groupId}
                    onSelect={handleGroupSelect}
                    title={t.pages.tournamentResults.groups}
                    variant="vertical"
                  />
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 md:pr-2">
              {/* Class & Group Selection - Mobile: Dropdowns at top */}
              <div className="md:hidden mb-4 space-y-2">
                {/* Class Selector - only shown if multiple classes */}
                {hasMultipleClasses && (
                  <SelectableList
                    items={getSelectableClasses()}
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
                    items={getSelectableGroups()}
                    selectedId={groupId}
                    onSelect={handleGroupSelect}
                    title={t.pages.tournamentResults.groups}
                    variant="dropdown"
                    compact
                    transparent
                  />
                )}
              </div>

              {selectedGroup ? (
                <>
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

                    {/* Show status messages only for started tournaments with no results */}
                    {!isNotStarted && !resultsLoading && !resultsError && groupStartDate && (
                      (() => {
                        // Check if we have results based on tournament type
                        const hasResults = isTeamTournament ? teamResults.length > 0 : groupResults.length > 0;

                        if (hasResults) return null; // Don't show status message if we have results

                        const now = new Date();
                        const endDate = groupEndDate ? new Date(groupEndDate) : null;
                        const hasEnded = endDate && now > endDate;

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
                        getPlayerClubId={getPlayerClubId}
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
                            const rounds = Object.keys(resultsByRound)
                              .map(Number)
                              .sort((a, b) => a - b);

                            // Set default selected round if not set
                            if (selectedRound === null && rounds.length > 0) {
                              setSelectedRound(rounds[0]);
                            }

                            return (
                              <>
                                {/* Round Tab Navigation */}
                                <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                                  {rounds.map(roundNumber => (
                                    <button
                                      key={roundNumber}
                                      onClick={() => setSelectedRound(roundNumber)}
                                      className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedRound === roundNumber
                                          ? 'border-b-2 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`}
                                    >
                                      {t.pages.tournamentResults.roundByRound.round} {roundNumber}
                                    </button>
                                  ))}
                                </div>

                                {/* Selected Round Content */}
                                <div className="p-4 md:p-6">
                                  {selectedRound && resultsByRound[selectedRound] && (() => {
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
                                        accessor: (row) => (
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
                                          return getPlayerEloByDate(row.homeId, roundDate);
                                        },
                                        align: 'center',
                                        noWrap: true
                                      },
                                      {
                                        id: 'black',
                                        header: t.pages.tournamentResults.roundByRound.black,
                                        accessor: (row) => (
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
                                          return getPlayerEloByDate(row.awayId, roundDate);
                                        },
                                        align: 'center',
                                        noWrap: true
                                      },
                                      {
                                        id: 'result',
                                        header: t.pages.tournamentResults.roundByRound.result,
                                        accessor: (row) => formatMatchResult(row.homeResult, row.awayResult, row.homeId, row.awayId),
                                        align: 'center',
                                        noWrap: true,
                                        cellStyle: { fontWeight: 'medium' }
                                      }
                                    ];

                                    return (
                                      <Table
                                        data={resultsByRound[selectedRound]}
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
