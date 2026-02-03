'use client';

import React from 'react';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';
import { GameDisplay } from '@/lib/api/utils/opponentStats';
import { usePlayer } from '@/context/PlayerContext';

export interface OpponentGamesTableProps {
  games: GameDisplay[];
  currentPlayerId: number;
  labels: {
    white: string;
    black: string;
    result: string;
    tournament: string;
  };
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
}

export function OpponentGamesTable({
  games,
  currentPlayerId,
  labels,
  loading = false,
  error = null,
  emptyMessage
}: OpponentGamesTableProps) {
  const { setSelectedOpponent } = usePlayer();

  // Get opponent ID and name from a game
  const getOpponentInfo = (game: GameDisplay) => {
    if (game.whiteId === currentPlayerId) {
      return { id: game.blackId, name: game.blackName };
    }
    return { id: game.whiteId, name: game.whiteName };
  };

  // Handle row click to select opponent for H2H view
  const handleRowClick = (game: GameDisplay) => {
    const opponent = getOpponentInfo(game);
    setSelectedOpponent(opponent.id, opponent.name);
  };

  // Define columns
  const columns: TableColumn<GameDisplay>[] = [
    {
      id: 'white',
      header: labels.white,
      accessor: (game) => (
        game.whiteId === currentPlayerId ? (
          <span className="font-medium">{game.whiteName}</span>
        ) : (
          <Link
            href={`/players/${game.whiteId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {game.whiteName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'black',
      header: labels.black,
      accessor: (game) => (
        game.blackId === currentPlayerId ? (
          <span className="font-medium">{game.blackName}</span>
        ) : (
          <Link
            href={`/players/${game.blackId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {game.blackName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'result',
      header: labels.result,
      accessor: 'result',
      align: 'center',
      noWrap: true,
      cellClassName: 'font-mono'
    },
    {
      id: 'tournament',
      header: labels.tournament,
      accessor: (game) => (
        <Link
          href={`/results/${game.tournamentId}/${game.groupId}`}
          className="truncate max-w-md block"
          onClick={(e) => e.stopPropagation()}
        >
          <span title={game.tournamentName}>
            {game.tournamentName.length > 50
              ? `${game.tournamentName.substring(0, 50)}...`
              : game.tournamentName}
          </span>
        </Link>
      ),
      align: 'left'
    }
  ];

  return (
    <Table
      data={games}
      columns={columns}
      loading={loading}
      error={error || undefined}
      emptyMessage={emptyMessage}
      getRowKey={(game) => game.gameId}
      hover={true}
      striped={false}
      border={true}
      onRowClick={handleRowClick}
    />
  );
}
