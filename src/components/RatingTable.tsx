'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableColumn } from '@/components/Table';
import type { PlayerInfoDto } from '@/lib/api/types';
import type { getTranslation } from '@/lib/translations';
import { RatingType } from '@/lib/api/types';

interface PlayerWithRank extends PlayerInfoDto {
  rank: number;
}

interface RatingTableProps {
  players: PlayerInfoDto[];
  ratingType: RatingType;
  loading: boolean;
  t: ReturnType<typeof getTranslation>;
}

export function RatingTable({ players, ratingType, loading, t }: RatingTableProps) {
  const router = useRouter();

  // Add rank to each player
  const playersWithRank = useMemo<PlayerWithRank[]>(() => {
    return players.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
  }, [players]);

  // Get the appropriate rating value based on rating type
  const getRating = (player: PlayerInfoDto): number => {
    switch (ratingType) {
      case RatingType.STANDARD:
        return player.elo?.rating || 0;
      case RatingType.RAPID:
        return player.elo?.rapidRating || 0;
      case RatingType.BLITZ:
        return player.elo?.blitzRating || 0;
      default:
        return 0;
    }
  };

  // Handle row click - navigate to player page
  const handleRowClick = (player: PlayerWithRank) => {
    if (player.id) {
      router.push(`/players/${player.id}`);
    }
  };

  // Define columns
  const columns: TableColumn<PlayerWithRank>[] = [
    {
      id: 'rank',
      header: t.pages.organizations.ratingList.tableHeaders.rank,
      accessor: 'rank',
      align: 'left',
      noWrap: true
    },
    {
      id: 'title',
      header: t.pages.organizations.ratingList.tableHeaders.title,
      accessor: (player) => player.elo?.title || '',
      align: 'left',
      noWrap: true
    },
    {
      id: 'firstName',
      header: t.pages.organizations.ratingList.tableHeaders.firstName,
      accessor: 'firstName',
      align: 'left'
    },
    {
      id: 'lastName',
      header: t.pages.organizations.ratingList.tableHeaders.lastName,
      accessor: 'lastName',
      align: 'left'
    },
    {
      id: 'rating',
      header: t.pages.organizations.ratingList.tableHeaders.rating,
      accessor: (player) => getRating(player) || '-',
      align: 'left',
      noWrap: true
    },
  ];

  return (
    <Table
      data={playersWithRank}
      columns={columns}
      loading={loading}
      emptyMessage={t.pages.organizations.ratingList.noPlayers}
      loadingMessage={t.pages.organizations.ratingList.loading}
      onRowClick={handleRowClick}
      getRowKey={(player) => player.id}
    />
  );
}