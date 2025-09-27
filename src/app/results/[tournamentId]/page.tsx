'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PageSpacing } from '@/components/layout/PageSpacing';
import { TournamentService, ResultsService } from '@/lib/api';
import { TournamentDto, TournamentClassDto, TournamentClassGroupDto, TournamentEndResultDto, TournamentRoundResultDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { FinalResultsTable } from '@/components/results/FinalResultsTable';
import { SelectableList, SelectableListItem } from '@/components/layout/SelectableList';

export default function TournamentResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
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

  if (loading) {
    return (
      <>
        <PageSpacing />
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
              Loading tournament results...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageSpacing />
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto text-center">
            <div
              className="p-8 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-mui-background-paper)',
                borderColor: 'var(--color-mui-divider)'
              }}
            >
              <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                Error Loading Tournament
              </h1>
              <p className="text-lg mb-6" style={{ color: 'var(--color-mui-text-secondary)' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!tournament) {
    return (
      <>
        <PageSpacing />
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-lg" style={{ color: 'var(--color-mui-text-secondary)' }}>
              Tournament not found
            </div>
          </div>
        </div>
      </>
    );
  }

  const selectedGroup = getSelectedGroup();

  // Handle row click in final results table
  const handlePlayerClick = (result: TournamentEndResultDto) => {
    const playerName = result.playerInfo
      ? `${result.playerInfo.firstName} ${result.playerInfo.lastName}`
      : 'Unknown Player';
    alert(`Clicked on: ${playerName} (Place: ${result.place}, Points: ${result.points})`);
  };

  return (
    <>
      <PageSpacing />
      <div className="min-h-screen py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tournament Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-light mb-2" style={{ color: 'var(--color-mui-text-primary)' }}>
              {tournament.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-mui-text-secondary)' }}>
              <span>{tournament.start} - {tournament.end}</span>
              {tournament.city && <span>{tournament.city}</span>}
            </div>
          </div>

          {/* Responsive Flex Layout */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Group Selection - Mobile: Full width top, Desktop: Left sidebar */}
            <div className="w-full md:w-56 md:flex-shrink-0">
              <SelectableList
                items={getSelectableGroups()}
                selectedId={selectedGroupId}
                onSelect={(id) => setSelectedGroupId(Number(id))}
                title="Groups"
                breakpoint="md"
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {selectedGroup ? (
                <>
                  {/* Main Results Table */}
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-mui-text-primary)' }}>
                        Final Results - {selectedGroup.group.name}
                        {selectedGroup.class.className !== selectedGroup.group.name && (
                          <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-mui-text-secondary)' }}>
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
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-mui-background-paper)',
                      borderColor: 'var(--color-mui-divider)'
                    }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: 'var(--color-mui-divider)' }}>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-mui-text-primary)' }}>
                        Round-by-Round Results
                      </h3>
                    </div>

                    {!resultsLoading && !resultsError && roundResults.length === 0 && (
                      <div className="p-6 text-center">
                        <div style={{ color: 'var(--color-mui-text-secondary)' }}>
                          No round results available for this group
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
                              <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid var(--color-mui-divider)` }}>
                                {rounds.map(roundNumber => (
                                  <button
                                    key={roundNumber}
                                    onClick={() => setSelectedRound(roundNumber)}
                                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                      selectedRound === roundNumber ? 'border-b-2' : ''
                                    }`}
                                    style={{
                                      color: selectedRound === roundNumber
                                        ? 'var(--color-mui-primary)'
                                        : 'var(--color-mui-text-secondary)',
                                      borderColor: selectedRound === roundNumber
                                        ? 'var(--color-mui-primary)'
                                        : 'transparent'
                                    }}
                                  >
                                    Round {roundNumber}
                                  </button>
                                ))}
                              </div>

                              {/* Selected Round Content */}
                              <div className="p-4">
                                {selectedRound && resultsByRound[selectedRound] && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr
                                          className="border-b"
                                          style={{
                                            borderColor: 'var(--color-mui-divider)',
                                            backgroundColor: 'var(--color-mui-background-default)'
                                          }}
                                        >
                                          <th className="text-left p-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            Table
                                          </th>
                                          <th className="text-left p-3 font-medium" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            White Player
                                          </th>
                                          <th className="text-center p-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            ELO
                                          </th>
                                          <th className="text-left p-3 font-medium" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            Black Player
                                          </th>
                                          <th className="text-center p-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            ELO
                                          </th>
                                          <th className="text-center p-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-mui-text-primary)' }}>
                                            Result
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {resultsByRound[selectedRound].map((result, index) => (
                                          <tr
                                            key={`${result.homeId}-${result.awayId}-${index}`}
                                            className="border-b hover:bg-opacity-50 transition-colors"
                                            style={{
                                              borderColor: 'var(--color-mui-divider)',
                                              backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-mui-background-default)'
                                            }}
                                          >
                                            <td className="p-3" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              {result.board || (index + 1)}
                                            </td>
                                            <td className="p-3" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              Player {result.homeId}
                                            </td>
                                            <td className="p-3 text-center" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              0
                                            </td>
                                            <td className="p-3" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              Player {result.awayId}
                                            </td>
                                            <td className="p-3 text-center" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              0
                                            </td>
                                            <td className="p-3 text-center font-medium" style={{ color: 'var(--color-mui-text-secondary)' }}>
                                              {result.homeResult !== undefined && result.awayResult !== undefined
                                                ? `${result.homeResult} - ${result.awayResult}`
                                                : '-'
                                              }
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className="p-6 rounded-lg border text-center"
                  style={{
                    backgroundColor: 'var(--color-mui-background-paper)',
                    borderColor: 'var(--color-mui-divider)'
                  }}
                >
                  <p style={{ color: 'var(--color-mui-text-secondary)' }}>
                    Please select a group to view results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}