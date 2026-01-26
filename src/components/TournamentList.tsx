'use client';

import { useMemo } from 'react';
import { Table, TableColumn } from './Table';
import { Link } from './Link';
import { useOrganizations } from '@/context/OrganizationsContext';
import { getTranslation } from '@/lib/translations';
import type { TournamentDto } from '@/lib/api/types';

interface TournamentListProps {
  tournaments: TournamentDto[];
  loading?: boolean;
  error?: string;
  language: 'sv' | 'en';
  showUpdatedColumn?: boolean;
}

export function TournamentList({
  tournaments,
  loading = false,
  error,
  language,
  showUpdatedColumn = false,
}: TournamentListProps) {
  const { getOrganizerName } = useOrganizations();
  const t = getTranslation(language);

  // Format date to YYYY-MM-DD (or "-" if empty)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format timestamp to show date and time separately
  const formatTimestamp = (dateString: string) => {
    if (!dateString) return { dateOnly: '-', timeOnly: '' };
    const date = new Date(dateString);
    const dateOnly = date.toISOString().split('T')[0];
    const timeOnly = date.toTimeString().split(' ')[0]; // HH:MM:SS
    return { dateOnly, timeOnly };
  };

  // Prepare table data (synchronous - no async fetching needed!)
  const tableData = useMemo(() => {
    return tournaments.map((tournament) => {
      const timestamp = formatTimestamp(tournament.latestUpdated || '');
      return {
        name: tournament.name,
        club: tournament.orgType != null && tournament.orgNumber
          ? getOrganizerName(tournament.orgType, tournament.orgNumber)
          : '-',
        start: formatDate(tournament.start),
        end: formatDate(tournament.end),
        lastUpdatedDate: timestamp.dateOnly,
        lastUpdatedTime: timestamp.timeOnly,
        tournamentId: tournament.id,
      };
    });
  }, [tournaments, getOrganizerName]);

  // Column definitions
  const columns: TableColumn<typeof tableData[0]>[] = useMemo(() => {
    const baseColumns: TableColumn<typeof tableData[0]>[] = [
      {
        id: 'name',
        header: t.pages.calendar.tournamentList.tournament,
        accessor: (row) => (
          <Link href={`/results/${row.tournamentId}`}>
            {row.name}
          </Link>
        ),
        align: 'left',
      },
      {
        id: 'club',
        header: t.pages.calendar.tournamentList.organizer,
        accessor: 'club',
        align: 'left',
      },
      {
        id: 'start',
        header: t.pages.calendar.tournamentList.start,
        accessor: 'start',
        align: 'left',
      },
      {
        id: 'end',
        header: t.pages.calendar.tournamentList.end,
        accessor: 'end',
        align: 'left',
      },
    ];

    // Conditionally add the lastUpdated column with responsive display
    if (showUpdatedColumn) {
      baseColumns.push({
        id: 'lastUpdated',
        header: t.pages.calendar.tournamentList.lastUpdated,
        accessor: (row) => (
          <>
            {/* Show date only on md-lg, date+time on lg+ */}
            <span className="lg:hidden">{row.lastUpdatedDate}</span>
            <span className="hidden lg:inline">
              {row.lastUpdatedDate} {row.lastUpdatedTime}
            </span>
          </>
        ),
        align: 'left',
        // Hide entire column (header + cells) below md breakpoint
        headerClassName: 'hidden md:table-cell',
        cellClassName: 'hidden md:table-cell',
      });
    }

    return baseColumns;
  }, [showUpdatedColumn, t]);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t.pages.calendar.tournamentList.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t.pages.calendar.tournamentList.noTournaments}
      </div>
    );
  }

  return (
    <Table
      data={tableData}
      columns={columns}
      border={false}
    />
  );
}
