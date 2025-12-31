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
}

export function TournamentList({
  tournaments,
  loading = false,
  error,
  language,
}: TournamentListProps) {
  const { getOrganizerName } = useOrganizations();
  const t = getTranslation(language);

  // Format date to YYYY-MM-DD (or "-" if empty)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Prepare table data (synchronous - no async fetching needed!)
  const tableData = useMemo(() => {
    return tournaments.map((tournament) => ({
      name: tournament.name,
      club: tournament.orgType && tournament.orgNumber
        ? getOrganizerName(tournament.orgType, tournament.orgNumber)
        : '-',
      start: formatDate(tournament.start),
      end: formatDate(tournament.end),
      tournamentId: tournament.id,
    }));
  }, [tournaments, getOrganizerName]);

  // Column definitions
  const columns: TableColumn<typeof tableData[0]>[] = [
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
    {
      id: 'club',
      header: t.pages.calendar.tournamentList.organizer,
      accessor: 'club',
      align: 'left',
    },
  ];

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
