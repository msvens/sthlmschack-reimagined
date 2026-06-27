'use client';

import React from 'react';
import { Table, TableColumn, TableDensity, DensityThresholds } from '@/components/Table';
import {
  RoundStandingRow,
  PlayerInfoDto,
  formatRatingWithType,
  getPlayerRatingByAlgorithm,
  formatPlayerName,
} from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface RoundStandingsTableProps {
  /** Estimated standings rows for a single round (sorted best-first by the SDK). */
  rows: RoundStandingRow[];
  /** Player lookup (built from the official standings' embedded playerInfo). */
  playerMap: Map<number, PlayerInfoDto>;
  /** Ranking algorithm for rating display. */
  rankingAlgorithm?: number | null;
  /** Callback when a row is clicked (receives the contender row). */
  onRowClick?: (row: RoundStandingRow) => void;
  density?: TableDensity;
  densityThresholds?: DensityThresholds;
}

/**
 * Individual round-snapshot standings. Mirrors {@link FinalResultsTable}'s columns
 * but reads from {@link RoundStandingRow}: primary `points` are exact, while
 * `qualityPoints` are the SDK's indicative Buchholz/Sonneborn-Berger estimate —
 * hence the `≈`-badged header and the caveat note rendered by the page.
 */
export function RoundStandingsTable({
  rows,
  playerMap,
  rankingAlgorithm,
  onRowClick,
  density,
  densityThresholds,
}: RoundStandingsTableProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const ft = t.pages.tournamentResults.finalResultsTable;
  const pb = t.pages.tournamentResults.standingsPlayback;

  const columns: TableColumn<RoundStandingRow>[] = [
    {
      id: 'pos',
      header: ft.pos,
      accessor: (row) => row.rank,
      align: 'left',
      noWrap: true,
      sortValue: (row) => row.rank,
    },
    {
      id: 'name',
      header: ft.name,
      accessor: (row) => {
        const p = playerMap.get(row.contenderId);
        return p ? formatPlayerName(p.firstName, p.lastName, p.elo?.title) : `#${row.contenderId}`;
      },
      align: 'left',
      sortValue: (row) => {
        const p = playerMap.get(row.contenderId);
        return p ? `${p.lastName} ${p.firstName}`.toLowerCase() : '';
      },
    },
    {
      id: 'club',
      header: ft.club,
      accessor: (row) => playerMap.get(row.contenderId)?.club || '-',
      align: 'left',
      cellClassName: 'max-w-[9ch] sm:max-w-none overflow-hidden whitespace-nowrap sm:whitespace-normal',
      sortValue: (row) => (playerMap.get(row.contenderId)?.club || '').toLowerCase(),
    },
    {
      id: 'ranking',
      header: ft.ranking,
      accessor: (row) => {
        const { rating, ratingType } = getPlayerRatingByAlgorithm(
          playerMap.get(row.contenderId)?.elo,
          rankingAlgorithm,
        );
        return formatRatingWithType(rating, ratingType, language);
      },
      align: 'left',
      noWrap: true,
      sortValue: (row) =>
        getPlayerRatingByAlgorithm(playerMap.get(row.contenderId)?.elo, rankingAlgorithm).rating ?? 0,
    },
    {
      id: 'gp',
      header: ft.gp,
      accessor: (row) => row.gamesPlayed || '-',
      align: 'center',
      noWrap: true,
      headerClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
    },
    { id: 'won', header: ft.won, accessor: (row) => row.wins, align: 'center', noWrap: true },
    { id: 'draw', header: ft.draw, accessor: (row) => row.draws, align: 'center', noWrap: true },
    { id: 'lost', header: ft.lost, accessor: (row) => row.losses, align: 'center', noWrap: true },
    {
      id: 'points',
      header: ft.points,
      accessor: (row) => row.points,
      align: 'center',
      noWrap: true,
      cellStyle: { fontWeight: 'medium' },
      sortValue: (row) => row.points,
    },
    {
      id: 'qp',
      header: pb.qpHeader,
      accessor: (row) => (row.qualityPoints != null ? Number(row.qualityPoints).toFixed(1) : '-'),
      align: 'center',
      noWrap: true,
      sortValue: (row) => row.qualityPoints ?? 0,
    },
  ];

  return (
    <Table
      data={rows}
      columns={columns}
      emptyMessage={ft.noResults}
      onRowClick={onRowClick}
      getRowKey={(row) => row.contenderId}
      density={density}
      densityThresholds={densityThresholds}
    />
  );
}

export default RoundStandingsTable;
