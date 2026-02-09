'use client';

import React, { useMemo } from 'react';
import { Table, TableColumn, TableDensity, DensityThresholds } from '@/components/Table';
import { TeamTournamentEndResultDto } from '@/lib/api/types';
import { createTeamNameFormatter } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface TeamFinalResultsTableProps {
  /** Team tournament end results data */
  results: TeamTournamentEndResultDto[];
  /** Function to get club name from club ID */
  getClubName: (clubId: number) => string;
  /** Optional loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
  /** Callback when a row is clicked */
  onRowClick?: (result: TeamTournamentEndResultDto) => void;
  /**
   * Table density - controls padding and font size.
   * If not provided, auto-density is enabled (compact on mobile, row-count based on desktop)
   */
  density?: TableDensity;
  /**
   * Thresholds for auto-density selection on desktop.
   * Default: comfortable <= 10 rows, normal <= 20 rows, compact > 20 rows
   */
  densityThresholds?: DensityThresholds;
}

export function TeamFinalResultsTable({
  results,
  getClubName,
  loading = false,
  error,
  onRowClick,
  density,
  densityThresholds
}: TeamFinalResultsTableProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Create team name formatter that adds Roman numerals for multi-team clubs
  const formatTeamName = useMemo(
    () => createTeamNameFormatter(results, getClubName),
    [results, getClubName]
  );

  const columns: TableColumn<TeamTournamentEndResultDto>[] = [
    {
      id: 'pos',
      header: t.pages.tournamentResults.teamFinalResultsTable.pos,
      accessor: 'place',
      align: 'left',
      noWrap: true
    },
    {
      id: 'team',
      header: t.pages.tournamentResults.teamFinalResultsTable.team,
      accessor: (row) => formatTeamName(row.contenderId, row.teamNumber),
      align: 'left'
    },
    {
      id: 'sp',
      header: t.pages.tournamentResults.teamFinalResultsTable.sp,
      accessor: (row) => {
        const matchesPlayed = (row.wonGames || 0) + (row.drawGames || 0) + (row.lostGames || 0);
        return matchesPlayed || '-';
      },
      align: 'center',
      noWrap: true
    },
    {
      id: 'won',
      header: t.pages.tournamentResults.teamFinalResultsTable.won,
      accessor: (row) => row.wonGames !== undefined ? row.wonGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'draw',
      header: t.pages.tournamentResults.teamFinalResultsTable.draw,
      accessor: (row) => row.drawGames !== undefined ? row.drawGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'lost',
      header: t.pages.tournamentResults.teamFinalResultsTable.lost,
      accessor: (row) => row.lostGames !== undefined ? row.lostGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'pp',
      header: t.pages.tournamentResults.teamFinalResultsTable.pp,
      accessor: (row) => row.secPoints !== undefined ? (Math.round(Number(row.secPoints) * 2) / 2).toFixed(1) : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'mp',
      header: t.pages.tournamentResults.teamFinalResultsTable.mp,
      accessor: (row) => row.points !== undefined ? row.points.toFixed(2) : '-',
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' }
    }
  ];

  return (
    <Table
      data={results}
      columns={columns}
      loading={loading}
      error={error}
      emptyMessage={t.pages.tournamentResults.teamFinalResultsTable.noResults}
      loadingMessage={t.pages.tournamentResults.teamFinalResultsTable.loadingResults}
      onRowClick={onRowClick}
      getRowKey={(row) => `${row.contenderId}-${row.teamNumber}`}
      density={density}
      densityThresholds={densityThresholds}
    />
  );
}

export default TeamFinalResultsTable;