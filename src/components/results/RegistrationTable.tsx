'use client';

import React from 'react';
import { Table, TableColumn, TableDensity, DensityThresholds } from '@/components/Table';
import { TournamentEndResultDto } from '@/lib/api/types';
import { formatRatingWithType, getPlayerRatingByAlgorithm, formatPlayerName } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface RegistrationTableProps {
  /** Tournament end results data (used for registration display) */
  results: TournamentEndResultDto[];
  /** Ranking algorithm for rating display */
  rankingAlgorithm?: number | null;
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

// Extended type that includes registration order
interface RegistrationRowData extends TournamentEndResultDto {
  registrationOrder: number;
}

/**
 * Table component for displaying registered players in non-started tournaments.
 * Shows a simpler view than FinalResultsTable: position, name, club, and rating.
 */
export function RegistrationTable({
  results,
  rankingAlgorithm,
  loading = false,
  error,
  onRowClick,
  density,
  densityThresholds
}: RegistrationTableProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Add registration order to each result
  const dataWithOrder: RegistrationRowData[] = results.map((result, index) => ({
    ...result,
    registrationOrder: index + 1
  }));

  const columns: TableColumn<RegistrationRowData>[] = [
    {
      id: 'pos',
      header: t.pages.tournamentResults.registrationTable.pos,
      accessor: (row) => row.registrationOrder,
      align: 'left',
      noWrap: true
    },
    {
      id: 'name',
      header: t.pages.tournamentResults.registrationTable.name,
      accessor: (row) => row.playerInfo ? formatPlayerName(row.playerInfo.firstName, row.playerInfo.lastName, row.playerInfo.elo?.title) : 'Unknown Player',
      align: 'left'
    },
    {
      id: 'club',
      header: t.pages.tournamentResults.registrationTable.club,
      accessor: (row) => row.playerInfo?.club || '-',
      align: 'left',
      cellClassName: 'max-w-[9ch] sm:max-w-none overflow-hidden whitespace-nowrap sm:whitespace-normal'
    },
    {
      id: 'rating',
      header: t.pages.tournamentResults.registrationTable.rating,
      accessor: (row) => {
        const { rating, ratingType } = getPlayerRatingByAlgorithm(row.playerInfo?.elo, rankingAlgorithm);
        return formatRatingWithType(rating, ratingType, language);
      },
      align: 'left',
      noWrap: true
    }
  ];

  // Wrapper to handle the original TournamentEndResultDto in onRowClick
  const handleRowClick = onRowClick
    ? (row: RegistrationRowData) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { registrationOrder, ...originalResult } = row;
        onRowClick(originalResult as TournamentEndResultDto);
      }
    : undefined;

  return (
    <Table
      data={dataWithOrder}
      columns={columns}
      loading={loading}
      error={error}
      emptyMessage={t.pages.tournamentResults.registrationTable.noRegistrations}
      loadingMessage={t.pages.tournamentResults.registrationTable.loadingRegistrations}
      onRowClick={handleRowClick}
      getRowKey={(row) => row.playerInfo?.id || row.contenderId}
      density={density}
      densityThresholds={densityThresholds}
    />
  );
}

export default RegistrationTable;
