'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService } from '@/lib/api';
import { TournamentDto, TournamentClassDto, TournamentClassGroupDto, TournamentEndResultDto, TournamentRoundResultDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults } from '@/context/GroupResultsContext';
import { FinalResultsTable } from '@/components/results/FinalResultsTable';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';

export default function GroupResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get group-level data from context
  const { groupResults, roundResults, thinkingTime, groupStartDate, groupEndDate, loading: resultsLoading, error: resultsError, getPlayerName, getPlayerElo } = useGroupResults();

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;

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
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
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
    <PageLayout fullScreen>
      {/* Tournament Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-light mb-2 text-gray-900 dark:text-white">
              {tournament.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{tournament.start} - {tournament.end}</span>
              {tournament.city && <span>{tournament.city}</span>}
            </div>
          </div>

          {/* Responsive Flex Layout */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Class & Group Selection - Desktop: Left sidebar */}
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

              {/* Group Selector - vertical list */}
              <SelectableList
                items={getSelectableGroups()}
                selectedId={groupId}
                onSelect={handleGroupSelect}
                title={t.pages.tournamentResults.groups}
                variant="vertical"
              />
            </div>

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

                {/* Group Selector */}
                <SelectableList
                  items={getSelectableGroups()}
                  selectedId={groupId}
                  onSelect={handleGroupSelect}
                  title={t.pages.tournamentResults.groups}
                  variant="dropdown"
                  compact
                  transparent
                />
              </div>

              {selectedGroup ? (
                <>
                  {/* Main Results Table */}
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t.pages.tournamentResults.finalResults} - {selectedGroup.name}
                        {thinkingTime && (
                          <span className="text-sm font-normal ml-2 text-gray-600 dark:text-gray-400">
                            ({thinkingTime})
                          </span>
                        )}
                      </h3>
                    </div>

                    {!resultsLoading && groupResults.length === 0 && !resultsError && groupStartDate && (
                      (() => {
                        const now = new Date();
                        const startDate = new Date(groupStartDate);
                        const endDate = groupEndDate ? new Date(groupEndDate) : null;
                        const hasntStarted = now < startDate;
                        const hasEnded = endDate && now > endDate;

                        if (hasntStarted) {
                          return (
                            <div className="p-8 text-center">
                              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {language === 'sv' ? 'Turneringen har inte startat än' : 'Tournament has not started yet'}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                {language === 'sv' ? 'Grupp börjar:' : 'Group starts:'} {groupStartDate}
                              </div>
                            </div>
                          );
                        } else if (hasEnded && groupResults.length === 0) {
                          return (
                            <div className="p-8 text-center">
                              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {language === 'sv' ? 'Inga resultat tillgängliga' : 'No results available'}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                {language === 'sv' ? 'Denna grupp kan ha ställts in' : 'This group may have been cancelled'}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-8 text-center">
                              <div className="text-gray-600 dark:text-gray-400">
                                {language === 'sv' ? 'Resultat kommer snart...' : 'Results coming soon...'}
                              </div>
                            </div>
                          );
                        }
                      })()
                    )}

                    {(groupResults.length > 0 || resultsLoading || resultsError) && (
                      <FinalResultsTable
                        results={groupResults}
                        thinkingTime={thinkingTime}
                        loading={resultsLoading}
                        error={resultsError || undefined}
                        onRowClick={handlePlayerClick}
                      />
                    )}
                  </div>

                  {/* Round-by-Round Results */}
                  <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                          // Group round results by round number
                          const resultsByRound = roundResults.reduce((acc, result) => {
                            const round = result.roundNr || 1;
                            if (!acc[round]) acc[round] = [];
                            acc[round].push(result);
                            return acc;
                          }, {} as Record<number, TournamentRoundResultDto[]>);

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
                                      accessor: (row) => getPlayerElo(row.homeId),
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
                                      accessor: (row) => getPlayerElo(row.awayId),
                                      align: 'center',
                                      noWrap: true
                                    },
                                    {
                                      id: 'result',
                                      header: t.pages.tournamentResults.roundByRound.result,
                                      accessor: (row) =>
                                        row.homeResult !== undefined && row.awayResult !== undefined
                                          ? `${row.homeResult} - ${row.awayResult}`
                                          : '-',
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
                                      fullWidth={true}
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
