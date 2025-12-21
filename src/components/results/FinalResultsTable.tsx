'use client';

import React from 'react';
import { Table, TableColumn, TableDensity, DensityThresholds } from '@/components/Table';
import { TournamentEndResultDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface FinalResultsTableProps {
  /** Tournament end results data */
  results: TournamentEndResultDto[];
  /** Optional loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
  /** Callback when a row is clicked */
  onRowClick?: (result: TournamentEndResultDto) => void;
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

export function FinalResultsTable({
  results,
  loading = false,
  error,
  onRowClick,
  density,
  densityThresholds
}: FinalResultsTableProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const columns: TableColumn<TournamentEndResultDto>[] = [
    {
      id: 'pos',
      header: t.pages.tournamentResults.finalResultsTable.pos,
      accessor: 'place',
      align: 'left',
      noWrap: true
    },
    {
      id: 'name',
      header: t.pages.tournamentResults.finalResultsTable.name,
      accessor: (row) => row.playerInfo ? `${row.playerInfo.firstName} ${row.playerInfo.lastName}` : 'Unknown Player',
      align: 'left'
    },
    {
      id: 'club',
      header: t.pages.tournamentResults.finalResultsTable.club,
      accessor: (row) => row.playerInfo?.club || '-',
      align: 'left',
      cellClassName: 'max-w-[9ch] sm:max-w-none overflow-hidden whitespace-nowrap sm:whitespace-normal'
    },
    {
      id: 'ranking',
      header: t.pages.tournamentResults.finalResultsTable.ranking,
      accessor: (row) => row.playerInfo?.elo?.rating || '-',
      align: 'left',
      noWrap: true
    },
    {
      id: 'gp',
      header: t.pages.tournamentResults.finalResultsTable.gp,
      accessor: (row) => {
        const gamesPlayed = (row.wonGames || 0) + (row.drawGames || 0) + (row.lostGames || 0);
        return gamesPlayed || '-';
      },
      align: 'center',
      noWrap: true,
      headerClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell'
    },
    {
      id: 'won',
      header: t.pages.tournamentResults.finalResultsTable.won,
      accessor: (row) => row.wonGames !== undefined ? row.wonGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'draw',
      header: t.pages.tournamentResults.finalResultsTable.draw,
      accessor: (row) => row.drawGames !== undefined ? row.drawGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'lost',
      header: t.pages.tournamentResults.finalResultsTable.lost,
      accessor: (row) => row.lostGames !== undefined ? row.lostGames : '-',
      align: 'center',
      noWrap: true
    },
    {
      id: 'points',
      header: t.pages.tournamentResults.finalResultsTable.points,
      accessor: (row) => row.points !== undefined ? row.points : '-',
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' }
    },
    {
      id: 'qp',
      header: t.pages.tournamentResults.finalResultsTable.qp,
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
      emptyMessage={t.pages.tournamentResults.finalResultsTable.noResults}
      loadingMessage={t.pages.tournamentResults.finalResultsTable.loadingResults}
      onRowClick={onRowClick}
      getRowKey={(row) => row.playerInfo?.id || row.contenderId}
      density={density}
      densityThresholds={densityThresholds}
    />
  );
}

export default FinalResultsTable;