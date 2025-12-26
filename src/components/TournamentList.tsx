'use client';

import { useEffect, useState } from 'react';
import { Table, TableColumn } from './Table';
import { Link } from './Link';
import { useOrganizations } from '@/context/OrganizationsContext';
import type { TournamentDto } from '@/lib/api/types';

interface TournamentListProps {
  tournaments: TournamentDto[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  language: 'sv' | 'en';
}

export function TournamentList({
  tournaments,
  loading = false,
  error,
  emptyMessage = 'No tournaments found',
  language,
}: TournamentListProps) {
  const { getOrganizerName } = useOrganizations();
  const [organizerNames, setOrganizerNames] = useState<Map<string, string>>(new Map());
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);

  // Format date to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch organizer names for all unique orgType+orgNumber combinations
  useEffect(() => {
    const fetchOrganizerNames = async () => {
      if (tournaments.length === 0) return;

      setLoadingOrganizers(true);
      const uniqueOrganizers = [
        ...new Map(tournaments.map(t => [`${t.orgType}-${t.orgNumber}`, { orgType: t.orgType, orgNumber: t.orgNumber }])).values()
      ];
      const newOrganizerNames = new Map<string, string>();

      await Promise.all(
        uniqueOrganizers.map(async ({ orgType, orgNumber }) => {
          const name = await getOrganizerName(orgType, orgNumber);
          newOrganizerNames.set(`${orgType}-${orgNumber}`, name);
        })
      );

      setOrganizerNames(newOrganizerNames);
      setLoadingOrganizers(false);
    };

    fetchOrganizerNames();
  }, [tournaments, getOrganizerName]);

  // Prepare table data
  const tableData = tournaments.map((tournament) => ({
    name: tournament.name,
    club: organizerNames.get(`${tournament.orgType}-${tournament.orgNumber}`) || `Org ${tournament.orgNumber}`,
    start: formatDate(tournament.start),
    end: formatDate(tournament.end),
    tournamentId: tournament.id,
  }));

  // Column definitions
  const columns: TableColumn<typeof tableData[0]>[] = [
    {
      id: 'name',
      header: language === 'sv' ? 'Turnering' : 'Tournament',
      accessor: (row) => (
        <Link href={`/results/${row.tournamentId}`}>
          {row.name}
        </Link>
      ),
      align: 'left',
    },
    {
      id: 'club',
      header: language === 'sv' ? 'Arrangör' : 'Organizer',
      accessor: 'club',
      align: 'left',
    },
    {
      id: 'start',
      header: language === 'sv' ? 'Start' : 'Start',
      accessor: 'start',
      align: 'left',
    },
    {
      id: 'end',
      header: language === 'sv' ? 'Slut' : 'End',
      accessor: 'end',
      align: 'left',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {language === 'sv' ? 'Laddar turneringar...' : 'Loading tournaments...'}
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
        {emptyMessage}
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