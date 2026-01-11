'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OpponentStats } from '@/lib/api/utils/opponentStats';
import { sortOpponentStats } from '@/lib/api/utils/opponentStats';

export interface OpponentStatsTableProps {
  opponentStats: OpponentStats[];
  labels: {
    opponent: string;
    rating: string;
    games: string;
    record: string;
    tournaments: string;
  };
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
}

type SortField = 'games' | 'name' | 'winRate';

export function OpponentStatsTable({
  opponentStats,
  labels,
  loading = false,
  error = null,
  emptyMessage
}: OpponentStatsTableProps) {
  const [sortBy, setSortBy] = useState<SortField>('games');

  // Sort the stats
  const sortedStats = useMemo(() => {
    return sortOpponentStats(opponentStats, sortBy);
  }, [opponentStats, sortBy]);

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortBy(field);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 dark:text-gray-400">
          Loading opponents...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (sortedStats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {/* Opponent name - sortable */}
            <th
              className="text-left px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                {labels.opponent}
                {sortBy === 'name' && <span className="text-blue-600">▼</span>}
              </div>
            </th>

            {/* Rating */}
            <th className="text-left px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-200">
              {labels.rating}
            </th>

            {/* Games - sortable */}
            <th
              className="text-center px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSort('games')}
            >
              <div className="flex items-center justify-center gap-1">
                {labels.games}
                {sortBy === 'games' && <span className="text-blue-600">▼</span>}
              </div>
            </th>

            {/* W-D-L - sortable (by win rate) */}
            <th
              className="text-center px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSort('winRate')}
            >
              <div className="flex items-center justify-center gap-1">
                {labels.record}
                {sortBy === 'winRate' && <span className="text-blue-600">▼</span>}
              </div>
            </th>

            {/* Tournaments - hide on mobile */}
            <th className="hidden md:table-cell text-center px-3 py-2 text-xs font-medium text-gray-900 dark:text-gray-200">
              {labels.tournaments}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedStats.map(opponent => (
            <tr
              key={opponent.opponentId}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/30"
            >
              {/* Opponent name (link) */}
              <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400">
                <Link
                  href={`/players/${opponent.opponentId}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {opponent.opponentName}
                </Link>
              </td>

              {/* Rating */}
              <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400">
                {opponent.opponentRating}
              </td>

              {/* Games */}
              <td className="px-3 py-2 text-sm text-center text-gray-900 dark:text-gray-400">
                {opponent.totalGames}
              </td>

              {/* W-D-L */}
              <td className="px-3 py-2 text-sm text-center text-gray-900 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">{opponent.wins}</span>
                -
                <span className="text-gray-600 dark:text-gray-500">{opponent.draws}</span>
                -
                <span className="text-red-600 dark:text-red-400">{opponent.losses}</span>
              </td>

              {/* Tournaments - hide on mobile */}
              <td className="hidden md:table-cell px-3 py-2 text-sm text-center text-gray-900 dark:text-gray-400">
                <div className="flex flex-wrap justify-center gap-1">
                  {opponent.tournaments.map((tournament, index) => (
                    <React.Fragment key={tournament.groupId}>
                      <Link
                        href={`/results/${tournament.tournamentId}/${tournament.groupId}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        title={tournament.name}
                      >
                        {tournament.name.length > 30
                          ? `${tournament.name.substring(0, 30)}...`
                          : tournament.name}
                      </Link>
                      {index < opponent.tournaments.length - 1 && (
                        <span className="text-gray-400">,</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
