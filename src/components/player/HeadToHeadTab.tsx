'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';
import {
  gamesToDisplayFormat,
  calculateStatsByColor,
  GameDisplay
} from '@/lib/api/utils/opponentStats';
import { formatPlayerName } from '@/lib/api';
import { Language } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface HeadToHeadTabProps {
  opponentId: number;
  language: Language;
}

export function HeadToHeadTab({ opponentId, language }: HeadToHeadTabProps) {
  const params = useParams();
  const memberId = params.memberId ? parseInt(params.memberId as string) : null;
  const t = getTranslation(language);
  const { games, gamesLoading, playerMap, playersLoading, tournamentMap } = usePlayer();

  // Get current player name
  const currentPlayerName = useMemo(() => {
    if (!memberId) return '';
    const player = playerMap.get(memberId);
    if (player) {
      return formatPlayerName(player.firstName, player.lastName, player.elo?.title);
    }
    return `Player ${memberId}`;
  }, [memberId, playerMap]);

  // Filter games to only those against this opponent
  const opponentGames = useMemo(() => {
    if (!memberId) return [];
    return games.filter(game =>
      (game.whiteId === memberId && game.blackId === opponentId) ||
      (game.blackId === memberId && game.whiteId === opponentId)
    );
  }, [games, memberId, opponentId]);

  // Calculate stats by color for this opponent
  const statsByColor = useMemo(() => {
    if (!memberId) {
      return {
        all: { wins: 0, draws: 0, losses: 0 },
        white: { wins: 0, draws: 0, losses: 0 },
        black: { wins: 0, draws: 0, losses: 0 }
      };
    }
    return calculateStatsByColor(opponentGames, memberId);
  }, [opponentGames, memberId]);

  // Convert to display format
  const displayGames = useMemo(() => {
    if (!memberId) return [];
    return gamesToDisplayFormat(
      opponentGames,
      memberId,
      playerMap,
      tournamentMap,
      currentPlayerName,
      playersLoading,
      t.pages.playerDetail.opponentsTab.table.retrieving,
      t.pages.playerDetail.opponentsTab.table.unknown
    );
  }, [opponentGames, memberId, playerMap, tournamentMap, currentPlayerName, playersLoading, t]);

  // Define table columns
  const columns: TableColumn<GameDisplay>[] = [
    {
      id: 'white',
      header: t.pages.playerDetail.opponentsTab.table.white,
      accessor: (game) => (
        game.whiteId === memberId ? (
          <span className="font-medium">{game.whiteName}</span>
        ) : (
          <Link href={`/players/${game.whiteId}`}>
            {game.whiteName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'black',
      header: t.pages.playerDetail.opponentsTab.table.black,
      accessor: (game) => (
        game.blackId === memberId ? (
          <span className="font-medium">{game.blackName}</span>
        ) : (
          <Link href={`/players/${game.blackId}`}>
            {game.blackName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'result',
      header: t.pages.playerDetail.opponentsTab.table.result,
      accessor: 'result',
      align: 'center',
      noWrap: true,
      cellClassName: 'font-mono'
    },
    {
      id: 'tournament',
      header: t.pages.playerDetail.opponentsTab.table.tournament,
      accessor: (game) => (
        <Link
          href={`/results/${game.tournamentId}/${game.groupId}`}
          className="truncate max-w-md block"
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

  // Loading state
  if (gamesLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t.pages.playerDetail.loadingMatches}
        </div>
      </div>
    );
  }

  // No games state
  if (displayGames.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t.pages.playerDetail.noMatchesFound}
        </div>
      </div>
    );
  }

  const { all, white, black } = statsByColor;

  return (
    <div className="space-y-4">
      {/* Games table */}
      <Table
        data={displayGames}
        columns={columns}
        loading={gamesLoading}
        emptyMessage={t.pages.playerDetail.noMatchesFound}
        getRowKey={(game) => game.gameId}
        hover={true}
        striped={false}
        border={true}
      />

      {/* Summary stats */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.pages.playerDetail.total}</span>
          <span className="text-gray-900 dark:text-gray-100">{all.wins}/{all.draws}/{all.losses}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.pages.playerDetail.opponentsTab.charts.white}</span>
          <span className="text-gray-900 dark:text-gray-100">{white.wins}/{white.draws}/{white.losses}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.pages.playerDetail.opponentsTab.charts.black}</span>
          <span className="text-gray-900 dark:text-gray-100">{black.wins}/{black.draws}/{black.losses}</span>
        </div>
      </div>
    </div>
  );
}
