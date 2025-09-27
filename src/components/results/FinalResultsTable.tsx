'use client';

import React from 'react';
import { Table, TableColumn } from '@/components/layout/Table';
import { TournamentEndResultDto } from '@/lib/api/types';

export interface FinalResultsTableProps {
  /** Tournament end results data */
  results: TournamentEndResultDto[];
  /** Optional loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
  /** Callback when a row is clicked */
  onRowClick?: (result: TournamentEndResultDto) => void;
}

export function FinalResultsTable({
  results,
  loading = false,
  error,
  onRowClick
}: FinalResultsTableProps) {

  const columns: TableColumn<TournamentEndResultDto>[] = [
    {
      id: 'pos',
      header: 'Pos',
      accessor: 'place',
      align: 'left',
      noWrap: true
    },
    {
      id: 'name',
      header: 'Name',
      accessor: (row) => row.playerInfo ? `${row.playerInfo.firstName} ${row.playerInfo.lastName}` : 'Unknown Player',
      align: 'left'
    },
    {
      id: 'club',
      header: 'Club',
      accessor: (row) => row.playerInfo?.club || '-',
      align: 'left'
    },
    {
      id: 'ranking',
      header: 'Ranking',
      accessor: (row) => row.playerInfo?.elo?.rating || '-',
      align: 'left',
      noWrap: true
    },
    {
      id: 'gp',
      header: 'GP',
      accessor: (row) => {
        const gamesPlayed = (row.wonGames || 0) + (row.drawGames || 0) + (row.lostGames || 0);
        return gamesPlayed || '-';
      },
      align: 'center',
      noWrap: true
    },
    {
      id: 'won',
      header: '+',
      accessor: (row) => row.wonGames !== undefined ? row.wonGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'draw',
      header: '=',
      accessor: (row) => row.drawGames !== undefined ? row.drawGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'lost',
      header: '-',
      accessor: (row) => row.lostGames !== undefined ? row.lostGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'points',
      header: 'Points',
      accessor: (row) => row.points !== undefined ? row.points : '-',
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' }
    },
    {
      id: 'qp',
      header: 'QP',
      accessor: (row) => row.secPoints !== undefined ? (Math.round(Number(row.secPoints) * 2) / 2).toFixed(1) : '-',
      align: 'center',
      noWrap: true
    }
  ];

  return (
    <Table
      data={results}
      columns={columns}
      loading={loading}
      error={error}
      emptyMessage="No results available for this group"
      loadingMessage="Loading results..."
      onRowClick={onRowClick}
      getRowKey={(row) => row.playerInfo?.id || row.contenderId}
    />
  );
}

export default FinalResultsTable;