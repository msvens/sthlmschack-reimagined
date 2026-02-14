'use client';

import React, { useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { useGlobalPlayerCache, PlayerDateRequest } from '@/context/GlobalPlayerCacheContext';
import { Link } from '@/components/Link';
import { Table, TableColumn } from '@/components/Table';
import {
  gamesToDisplayFormat,
  calculatePlayerResult,
  GameDisplay,
  findTournamentGroup,
  getPlayerRatingStrict,
  formatRatingWithType,
  calculateRatingChange,
  getKFactorForRating,
  isCountableResult,
  isWalkoverResultCode,
  normalizeEloLookupDate,
  parseLocalDate
} from '@/lib/api';
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
  const { games, gamesLoading, tournamentMap, getPlayerName: getPlayerNameFromContext } = usePlayer();
  const globalCache = useGlobalPlayerCache();

  // Get current player name
  const currentPlayerName = useMemo(() => {
    if (!memberId) return '';
    return getPlayerNameFromContext(memberId);
  }, [memberId, getPlayerNameFromContext]);

  // Filter games to only those against this opponent
  const opponentGames = useMemo(() => {
    if (!memberId) return [];
    return games.filter(game =>
      (game.whiteId === memberId && game.blackId === opponentId) ||
      (game.blackId === memberId && game.whiteId === opponentId)
    );
  }, [games, memberId, opponentId]);

  // Build per-group metadata: date (normalized to month) and rankingAlgorithm
  const groupMeta = useMemo(() => {
    const meta = new Map<number, { date: number; rankingAlgorithm: number }>();
    const seenGroupIds = new Set<number>();
    opponentGames.forEach(game => seenGroupIds.add(game.groupiD));

    for (const groupId of seenGroupIds) {
      const tournament = tournamentMap.get(groupId);
      if (!tournament) continue;
      const groupResult = findTournamentGroup(tournament, groupId);
      if (!groupResult) continue;
      const dateStr = groupResult.group.start || tournament.start;
      const date = normalizeEloLookupDate(parseLocalDate(dateStr).getTime());
      meta.set(groupId, { date, rankingAlgorithm: groupResult.group.rankingAlgorithm });
    }
    return meta;
  }, [opponentGames, tournamentMap]);

  // Fetch historical player data for both players at each tournament date
  useEffect(() => {
    if (!memberId || groupMeta.size === 0) return;

    const requests: PlayerDateRequest[] = [];
    const seenKeys = new Set<string>();

    for (const { date } of groupMeta.values()) {
      for (const playerId of [memberId, opponentId]) {
        const key = `${playerId}-${date}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          requests.push({ playerId, date });
        }
      }
    }

    if (requests.length > 0) {
      globalCache.getOrFetchPlayersByDate(requests);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, opponentId, groupMeta]);

  // Build a playerMap adapter from the global cache for gamesToDisplayFormat
  const playerMapAdapter = useMemo(() => {
    return { get: (id: number) => globalCache.getPlayer(id) } as Map<number, import('@/lib/api').PlayerInfoDto>;
  }, [globalCache]);

  // Derive loading state: true if either player isn't in the cache yet
  const playersLoading = useMemo(() => {
    if (!memberId) return false;
    return !globalCache.getPlayer(memberId) || !globalCache.getPlayer(opponentId);
  }, [memberId, opponentId, globalCache]);

  // Convert to display format
  const displayGames = useMemo(() => {
    if (!memberId) return [];
    return gamesToDisplayFormat(
      opponentGames,
      memberId,
      playerMapAdapter,
      tournamentMap,
      currentPlayerName,
      playersLoading,
      t.pages.playerDetail.opponentsTab.table.retrieving,
      t.pages.playerDetail.opponentsTab.table.unknown
    );
  }, [opponentGames, memberId, playerMapAdapter, tournamentMap, currentPlayerName, playersLoading, t]);

  // Precompute ELO change per game (keyed by gameId)
  const eloChangeMap = useMemo(() => {
    if (!memberId) return new Map<number, number>();
    const map = new Map<number, number>();

    for (const game of opponentGames) {
      // Skip non-countable results and walkovers
      if (!isCountableResult(game.result) || isWalkoverResultCode(game.result)) continue;
      if (game.whiteId < 0 || game.blackId < 0) continue;

      const meta = groupMeta.get(game.groupiD);
      if (!meta) continue;

      const playerData = globalCache.getPlayerByDate(memberId, meta.date) ?? globalCache.getPlayer(memberId);
      const opponentData = globalCache.getPlayerByDate(opponentId, meta.date) ?? globalCache.getPlayer(opponentId);
      if (!playerData?.elo || !opponentData?.elo) continue;

      const playerResult = getPlayerRatingStrict(playerData.elo, meta.rankingAlgorithm);
      const opponentResult = getPlayerRatingStrict(opponentData.elo, meta.rankingAlgorithm);
      if (!playerResult.rating || !opponentResult.rating) continue;

      const kFactor = getKFactorForRating(
        playerResult.ratingType,
        playerResult.rating,
        playerData.elo,
        playerData.birthdate,
        meta.date
      );

      const outcome = calculatePlayerResult(game, memberId);
      if (outcome === null) continue;
      const actualScore = outcome === 'win' ? 1.0 : outcome === 'draw' ? 0.5 : 0.0;

      const change = calculateRatingChange(playerResult.rating, opponentResult.rating, actualScore, kFactor);
      map.set(game.id, change);
    }

    return map;
  }, [memberId, opponentId, opponentGames, groupMeta, globalCache]);

  // Compute summary stats grouped by rating type
  const summaryStats = useMemo(() => {
    if (!memberId) return null;

    type RatingStats = {
      totalChange: number;
      opponentRatings: number[];
      score: number;
      gameCount: number;
    };

    const statsByType: Record<string, RatingStats> = {
      standard: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
      rapid: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
      blitz: { totalChange: 0, opponentRatings: [], score: 0, gameCount: 0 },
    };

    let totalScore = 0;
    let playedCount = 0;

    for (const game of opponentGames) {
      if (!isCountableResult(game.result) || isWalkoverResultCode(game.result)) continue;
      if (game.whiteId < 0 || game.blackId < 0) continue;

      const outcome = calculatePlayerResult(game, memberId);
      if (outcome === null) continue;

      const actualScore = outcome === 'win' ? 1.0 : outcome === 'draw' ? 0.5 : 0.0;
      totalScore += actualScore;
      playedCount++;

      const meta = groupMeta.get(game.groupiD);
      if (!meta) continue;

      const playerData = globalCache.getPlayerByDate(memberId, meta.date) ?? globalCache.getPlayer(memberId);
      const opponentData = globalCache.getPlayerByDate(opponentId, meta.date) ?? globalCache.getPlayer(opponentId);
      if (!playerData?.elo || !opponentData?.elo) continue;

      const playerResult = getPlayerRatingStrict(playerData.elo, meta.rankingAlgorithm);
      const opponentResult = getPlayerRatingStrict(opponentData.elo, meta.rankingAlgorithm);
      if (!playerResult.rating || !opponentResult.rating || !playerResult.ratingType) continue;

      const kFactor = getKFactorForRating(
        playerResult.ratingType,
        playerResult.rating,
        playerData.elo,
        playerData.birthdate,
        meta.date
      );

      const change = calculateRatingChange(playerResult.rating, opponentResult.rating, actualScore, kFactor);

      const stats = statsByType[playerResult.ratingType];
      if (stats) {
        stats.totalChange += change;
        stats.opponentRatings.push(opponentResult.rating);
        stats.score += actualScore;
        stats.gameCount++;
      }
    }

    return { statsByType, totalScore, playedCount };
  }, [memberId, opponentId, opponentGames, groupMeta, globalCache]);

  // Get historical ELO for a player in a specific game's tournament group
  const getEloDisplay = (playerId: number, groupId: number): string => {
    const meta = groupMeta.get(groupId);
    if (!meta) return '-';
    const player = globalCache.getPlayerByDate(playerId, meta.date) ?? globalCache.getPlayer(playerId);
    if (!player?.elo) return '-';
    const { rating, ratingType } = getPlayerRatingStrict(player.elo, meta.rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  };

  // Define table columns
  const columns: TableColumn<GameDisplay>[] = [
    {
      id: 'tournament',
      header: t.pages.playerDetail.opponentsTab.table.tournament,
      accessor: (game) => (
        <Link
          href={`/results/${game.tournamentId}/${game.groupId}`}
          className="truncate block max-w-20 md:max-w-48"
          title={game.tournamentName}
        >
          {game.tournamentName}
        </Link>
      ),
      align: 'left'
    },
    {
      id: 'white',
      header: t.pages.playerDetail.opponentsTab.table.white,
      accessor: (game) => (
        game.whiteId === memberId ? (
          <span className="font-medium truncate block max-w-16 md:max-w-36" title={game.whiteName}>{game.whiteName}</span>
        ) : (
          <Link href={`/players/${game.whiteId}`} className="truncate block max-w-16 md:max-w-36" title={game.whiteName}>
            {game.whiteName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'whiteElo',
      header: t.pages.tournamentResults.roundByRound.elo,
      accessor: (game) => (
        <span className="text-gray-500 dark:text-gray-400 tabular-nums">{getEloDisplay(game.whiteId, game.groupId)}</span>
      ),
      align: 'right',
      noWrap: true
    },
    {
      id: 'black',
      header: t.pages.playerDetail.opponentsTab.table.black,
      accessor: (game) => (
        game.blackId === memberId ? (
          <span className="font-medium truncate block max-w-16 md:max-w-36" title={game.blackName}>{game.blackName}</span>
        ) : (
          <Link href={`/players/${game.blackId}`} className="truncate block max-w-16 md:max-w-36" title={game.blackName}>
            {game.blackName}
          </Link>
        )
      ),
      align: 'left'
    },
    {
      id: 'blackElo',
      header: t.pages.tournamentResults.roundByRound.elo,
      accessor: (game) => (
        <span className="text-gray-500 dark:text-gray-400 tabular-nums">{getEloDisplay(game.blackId, game.groupId)}</span>
      ),
      align: 'right',
      noWrap: true
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
      id: 'eloChange',
      header: t.common.eloLabels.eloChange,
      accessor: (game) => {
        const change = eloChangeMap.get(game.gameId);
        if (change === undefined) return '-';
        return change > 0 ? `+${change}` : String(change);
      },
      align: 'center',
      noWrap: true
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

  // Summary stat helpers
  const formatChange = (stats: { totalChange: number; gameCount: number }): string => {
    if (stats.gameCount === 0) return '-';
    const rounded = Math.round(stats.totalChange * 10) / 10;
    return rounded > 0 ? `+${rounded}` : String(rounded);
  };

  const calcPerformance = (stats: { opponentRatings: number[]; score: number }): string => {
    if (stats.opponentRatings.length === 0) return '-';
    const avgOpponent = stats.opponentRatings.reduce((a, b) => a + b, 0) / stats.opponentRatings.length;
    const scorePct = stats.score / stats.opponentRatings.length;
    if (scorePct === 1.0) return String(Math.round(avgOpponent + 800));
    if (scorePct === 0.0) return String(Math.round(avgOpponent - 800));
    const ratingDiff = -400 * Math.log10((1 / scorePct) - 1);
    return String(Math.round(avgOpponent + ratingDiff));
  };

  const hasStandard = (summaryStats?.statsByType.standard.gameCount ?? 0) > 0;
  const hasRapid = (summaryStats?.statsByType.rapid.gameCount ?? 0) > 0;
  const hasBlitz = (summaryStats?.statsByType.blitz.gameCount ?? 0) > 0;
  const ratingTypeCount = [hasStandard, hasRapid, hasBlitz].filter(Boolean).length;

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
      {summaryStats && summaryStats.playedCount > 0 && (
        <div className="p-3">
          {/* Total score */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t.pages.playerDetail.total}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
              {summaryStats.totalScore} {t.pages.playerDetail.of} {summaryStats.playedCount}
            </div>
          </div>

          {/* ELO stats per rating type */}
          {ratingTypeCount === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t.common.eloLabels.eloChange}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">-</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t.common.eloLabels.performanceRating}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">-</div>
              </div>
            </div>
          ) : ratingTypeCount === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {hasRapid ? t.common.eloLabels.rapidEloChange :
                   hasBlitz ? t.common.eloLabels.blitzEloChange :
                   t.common.eloLabels.eloChange}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {formatChange(hasStandard ? summaryStats.statsByType.standard : hasRapid ? summaryStats.statsByType.rapid : summaryStats.statsByType.blitz)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {hasRapid ? t.common.eloLabels.rapidPerformance :
                   hasBlitz ? t.common.eloLabels.blitzPerformance :
                   t.common.eloLabels.performanceRating}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {calcPerformance(hasStandard ? summaryStats.statsByType.standard : hasRapid ? summaryStats.statsByType.rapid : summaryStats.statsByType.blitz)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {hasStandard && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.eloChange}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {formatChange(summaryStats.statsByType.standard)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.performanceRating}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {calcPerformance(summaryStats.statsByType.standard)}
                    </div>
                  </div>
                </div>
              )}
              {hasRapid && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.rapidEloChange}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {formatChange(summaryStats.statsByType.rapid)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.rapidPerformance}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {calcPerformance(summaryStats.statsByType.rapid)}
                    </div>
                  </div>
                </div>
              )}
              {hasBlitz && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.blitzEloChange}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {formatChange(summaryStats.statsByType.blitz)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t.common.eloLabels.blitzPerformance}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {calcPerformance(summaryStats.statsByType.blitz)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
