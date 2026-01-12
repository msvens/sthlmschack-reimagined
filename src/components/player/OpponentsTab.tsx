'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { TimeControlFilter, TimeControl, TimeControlCounts } from './TimeControlFilter';
import { OpponentPieCharts } from './OpponentPieCharts';
import { OpponentGamesTable } from './OpponentGamesTable';
import {
  filterGamesByTimeControl,
  gamesToDisplayFormat,
  calculateStatsByColor
} from '@/lib/api/utils/opponentStats';
import { Language } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export interface OpponentsTabProps {
  language: Language;
}

export function OpponentsTab({ language }: OpponentsTabProps) {
  const params = useParams();
  const memberId = params.memberId ? parseInt(params.memberId as string) : null;
  const t = getTranslation(language);
  const { games, gamesLoading, gamesError, playerMap, playersLoading, tournamentMap } = usePlayer();

  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('all');

  // Calculate time control counts
  const timeControlCounts = useMemo<TimeControlCounts>(() => {
    const counts: TimeControlCounts = {
      all: games.length,
      standard: 0,
      rapid: 0,
      blitz: 0
    };

    games.forEach(game => {
      const tournament = tournamentMap.get(game.groupiD);
      const timeControl = tournament?.thinkingTime
        ? (tournamentMap.get(game.groupiD) && t.pages.playerDetail.opponentsTab.timeControl.standard)
        : 'standard';

      // This is a simplified count - the actual filtering happens in filterGamesByTimeControl
      // For now, just count all as standard (we could improve this later)
    });

    // Properly calculate counts using filterGamesByTimeControl
    counts.standard = filterGamesByTimeControl(games, tournamentMap, 'standard').length;
    counts.rapid = filterGamesByTimeControl(games, tournamentMap, 'rapid').length;
    counts.blitz = filterGamesByTimeControl(games, tournamentMap, 'blitz').length;

    return counts;
  }, [games, tournamentMap, t]);

  // Filter games by selected time control
  const filteredGames = useMemo(() => {
    return filterGamesByTimeControl(games, tournamentMap, selectedTimeControl);
  }, [games, tournamentMap, selectedTimeControl]);

  // Calculate stats by color
  const statsByColor = useMemo(() => {
    if (!memberId) {
      return {
        all: { wins: 0, draws: 0, losses: 0 },
        white: { wins: 0, draws: 0, losses: 0 },
        black: { wins: 0, draws: 0, losses: 0 }
      };
    }
    return calculateStatsByColor(filteredGames, memberId);
  }, [filteredGames, memberId]);

  // Get current player name
  const currentPlayerName = useMemo(() => {
    if (!memberId) return '';
    const player = playerMap.get(memberId);
    if (player) {
      return `${player.firstName} ${player.lastName}`;
    }
    return `Player ${memberId}`;
  }, [memberId, playerMap]);

  // Convert games to display format
  const displayGames = useMemo(() => {
    if (!memberId) return [];
    return gamesToDisplayFormat(
      filteredGames,
      memberId,
      playerMap,
      tournamentMap,
      currentPlayerName,
      playersLoading,
      t.pages.playerDetail.opponentsTab.table.retrieving,
      t.pages.playerDetail.opponentsTab.table.unknown
    );
  }, [filteredGames, memberId, playerMap, tournamentMap, currentPlayerName, playersLoading, t]);

  // Loading state
  if (gamesLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading opponent statistics...
        </div>
      </div>
    );
  }

  // Error state
  if (gamesError) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-red-600 dark:text-red-400">
          {gamesError}
        </div>
      </div>
    );
  }

  // No games state
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t.pages.playerDetail.opponentsTab.noOpponents}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Control Filter */}
      <div className="flex justify-start">
        <TimeControlFilter
          selectedTimeControl={selectedTimeControl}
          onTimeControlSelect={setSelectedTimeControl}
          counts={timeControlCounts}
          labels={{
            all: t.pages.playerDetail.opponentsTab.timeControl.all,
            standard: t.pages.playerDetail.opponentsTab.timeControl.standard,
            rapid: t.pages.playerDetail.opponentsTab.timeControl.rapid,
            blitz: t.pages.playerDetail.opponentsTab.timeControl.blitz,
            label: t.pages.playerDetail.opponentsTab.timeControl.label
          }}
          variant="dropdown"
          compact={false}
        />
      </div>

      {/* Pie Charts */}
      <OpponentPieCharts
        allStats={statsByColor.all}
        whiteStats={statsByColor.white}
        blackStats={statsByColor.black}
        labels={{
          all: t.pages.playerDetail.opponentsTab.charts.all,
          white: t.pages.playerDetail.opponentsTab.charts.white,
          black: t.pages.playerDetail.opponentsTab.charts.black,
          wins: t.pages.playerDetail.opponentsTab.stats.wins,
          draws: t.pages.playerDetail.opponentsTab.stats.draws,
          losses: t.pages.playerDetail.opponentsTab.stats.losses
        }}
      />

      {/* Opponent Games Table */}
      <OpponentGamesTable
        games={displayGames}
        currentPlayerId={memberId || 0}
        labels={{
          white: t.pages.playerDetail.opponentsTab.table.white,
          black: t.pages.playerDetail.opponentsTab.table.black,
          result: t.pages.playerDetail.opponentsTab.table.result,
          tournament: t.pages.playerDetail.opponentsTab.table.tournament
        }}
        loading={gamesLoading}
        error={gamesError}
        emptyMessage={t.pages.playerDetail.opponentsTab.noOpponents}
      />
    </div>
  );
}
