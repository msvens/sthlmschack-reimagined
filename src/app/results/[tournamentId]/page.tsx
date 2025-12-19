'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService, ResultsService } from '@/lib/api';
import { TournamentDto, TournamentClassDto, TournamentClassGroupDto, TournamentEndResultDto, TournamentRoundResultDto, PlayerInfoDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { FinalResultsTable } from '@/components/results/FinalResultsTable';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';

export default function TournamentResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Results data
  const [groupResults, setGroupResults] = useState<TournamentEndResultDto[]>([]);
  const [roundResults, setRoundResults] = useState<TournamentRoundResultDto[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;

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

        // Set initial group selection from URL or default to first group
        const urlGroupId = searchParams.get('groupId');
        if (urlGroupId) {
          setSelectedGroupId(parseInt(urlGroupId));
        } else if (response.data.rootClasses?.[0]?.groups?.[0]) {
          setSelectedGroupId(response.data.rootClasses[0].groups[0].id);
        }

      } catch (err) {
        setError('Failed to load tournament information');
        console.error('Error fetching tournament:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, searchParams]);

  // Fetch results data when selected group changes
  useEffect(() => {
    if (!selectedGroupId) {
      setGroupResults([]);
      setRoundResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);

        const resultsService = new ResultsService();

        // Fetch both group results and round results in parallel
        const [groupResponse, roundResponse] = await Promise.all([
          resultsService.getTournamentResults(selectedGroupId),
          resultsService.getTournamentRoundResults(selectedGroupId)
        ]);

        if (groupResponse.status !== 200) {
          throw new Error(groupResponse.error || 'Failed to fetch group results');
        }

        if (roundResponse.status !== 200) {
          throw new Error(roundResponse.error || 'Failed to fetch round results');
        }

        setGroupResults(groupResponse.data || []);
        setRoundResults(roundResponse.data || []);

      } catch (err) {
        setResultsError('Failed to load results data');
        console.error('Error fetching results:', err);
        setGroupResults([]);
        setRoundResults([]);
      } finally {
        setResultsLoading(false);
      }
    };

    fetchResults();
  }, [selectedGroupId]);

  // Get all groups from all classes for the sidebar
  const getAllGroups = (): { class: TournamentClassDto; group: TournamentClassGroupDto }[] => {
    if (!tournament?.rootClasses) return [];

    const groups: { class: TournamentClassDto; group: TournamentClassGroupDto }[] = [];
    tournament.rootClasses.forEach(tournamentClass => {
      if (tournamentClass.groups) {
        tournamentClass.groups.forEach(group => {
          groups.push({ class: tournamentClass, group });
        });
      }
    });
    return groups;
  };

  // Get the currently selected group
  const getSelectedGroup = (): { class: TournamentClassDto; group: TournamentClassGroupDto } | null => {
    const allGroups = getAllGroups();
    return allGroups.find(item => item.group.id === selectedGroupId) || null;
  };

  // Convert groups to SelectableListItem format
  const getSelectableGroups = (): SelectableListItem[] => {
    const allGroups = getAllGroups();
    return allGroups.map(({ class: tournamentClass, group }) => ({
      id: group.id,
      label: group.name,
      tooltip: `${group.name}${tournamentClass.className && tournamentClass.className !== group.name ? ` (${tournamentClass.className})` : ''}`
    }));
  };

  // Create player lookup map from group results for O(1) lookups
  const playerMap = useMemo(() => {
    const map = new Map<number, PlayerInfoDto>();
    groupResults.forEach(result => {
      if (result.playerInfo) {
        map.set(result.playerInfo.id, result.playerInfo);
      }
    });
    return map;
  }, [groupResults]);

  // Helper to get player name from ID
  const getPlayerName = (playerId: number): string => {
    const player = playerMap.get(playerId);
    if (!player) return `Player ${playerId}`;
    return `${player.firstName} ${player.lastName}`;
  };

  // Helper to get player ELO from ID
  const getPlayerElo = (playerId: number): string => {
    const player = playerMap.get(playerId);
    return player?.elo?.rating ? String(player.elo.rating) : '-';
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

  // Handle row click in final results table - navigate to player detail page
  const handlePlayerClick = (result: TournamentEndResultDto) => {
    if (result.playerInfo?.id && tournamentId) {
      router.push(`/results/${tournamentId}/${result.playerInfo.id}`);
    }
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
            {/* Group Selection - Desktop: Left sidebar */}
            <div className="hidden md:block w-56 flex-shrink-0">
              <SelectableList
                items={getSelectableGroups()}
                selectedId={selectedGroupId}
                onSelect={(id) => setSelectedGroupId(Number(id))}
                title={t.pages.tournamentResults.groups}
                variant="vertical"
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Group Selection - Mobile: Dropdown at top */}
              <div className="md:hidden mb-4">
                <SelectableList
                  items={getSelectableGroups()}
                  selectedId={selectedGroupId}
                  onSelect={(id) => setSelectedGroupId(Number(id))}
                  title={t.pages.tournamentResults.groups}
                  variant="dropdown"
                  compact
                />
              </div>

              {selectedGroup ? (
                <>
                  {/* Main Results Table */}
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t.pages.tournamentResults.finalResults} - {selectedGroup.group.name}
                        {selectedGroup.class.className !== selectedGroup.group.name && (
                          <span className="text-sm font-normal ml-2 text-gray-600 dark:text-gray-400">
                            ({selectedGroup.class.className})
                          </span>
                        )}
                      </h3>
                    </div>

                    <FinalResultsTable
                      results={groupResults}
                      loading={resultsLoading}
                      error={resultsError || undefined}
                      onRowClick={handlePlayerClick}
                    />
                  </div>

                  {/* Round-by-Round Results */}
                  <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                              <div className="p-4">
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
                                          href={`/results/${tournamentId}/${row.homeId}`}
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
                                          href={`/results/${tournamentId}/${row.awayId}`}
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