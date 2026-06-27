'use client';

import React from 'react';
import { Table, TableColumn, TableDensity, DensityThresholds } from '@/components/Table';
import { RoundStandingRow } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface TeamRoundStandingsTableProps {
  /** Estimated team standings rows for a single round (sorted best-first by the SDK). */
  rows: RoundStandingRow[];
  /**
   * Team-name formatter, built from the official team standings via
   * `createTeamNameFormatter` so multi-team Roman numerals match the final table.
   */
  formatTeamName: (contenderId: number, teamNumber: number) => string;
  /** Callback when a row is clicked (receives the contender row). */
  onRowClick?: (row: RoundStandingRow) => void;
  density?: TableDensity;
  densityThresholds?: DensityThresholds;
}

/**
 * Team round-snapshot standings. Mirrors {@link TeamFinalResultsTable}'s columns
 * from {@link RoundStandingRow}. Team reconstruction is exact (match points + board
 * points), so — unlike the individual table — there is no estimation badge.
 */
export function TeamRoundStandingsTable({
  rows,
  formatTeamName,
  onRowClick,
  density,
  densityThresholds,
}: TeamRoundStandingsTableProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const tt = t.pages.tournamentResults.teamFinalResultsTable;

  const columns: TableColumn<RoundStandingRow>[] = [
    {
      id: 'pos',
      header: tt.pos,
      accessor: (row) => row.rank,
      align: 'left',
      noWrap: true,
      sortValue: (row) => row.rank,
    },
    {
      id: 'team',
      header: tt.team,
      accessor: (row) => formatTeamName(row.contenderId, row.teamNumber ?? 0),
      align: 'left',
      sortValue: (row) => formatTeamName(row.contenderId, row.teamNumber ?? 0).toLowerCase(),
    },
    {
      id: 'sp',
      header: tt.sp,
      accessor: (row) => row.gamesPlayed || '-',
      align: 'center',
      noWrap: true,
    },
    { id: 'won', header: tt.won, accessor: (row) => row.wins, align: 'center', noWrap: true },
    { id: 'draw', header: tt.draw, accessor: (row) => row.draws, align: 'center', noWrap: true },
    { id: 'lost', header: tt.lost, accessor: (row) => row.losses, align: 'center', noWrap: true },
    {
      id: 'pp',
      header: tt.pp,
      accessor: (row) => (Math.round(row.points * 2) / 2).toFixed(1),
      align: 'center',
      noWrap: true,
    },
    {
      id: 'mp',
      header: tt.mp,
      accessor: (row) => (row.matchPoints != null ? row.matchPoints.toFixed(2) : '-'),
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' },
      sortValue: (row) => row.matchPoints ?? 0,
    },
  ];

  return (
    <Table
      data={rows}
      columns={columns}
      emptyMessage={tt.noResults}
      onRowClick={onRowClick}
      getRowKey={(row) => `${row.contenderId}-${row.teamNumber}`}
      density={density}
      densityThresholds={densityThresholds}
    />
  );
}

export default TeamRoundStandingsTable;
