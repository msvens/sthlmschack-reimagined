'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { TournamentService, normalizeEloLookupDate, createTeamNameFormatter, isWalkoverPlayer } from '@/lib/api';
import { TournamentDto } from '@/lib/api/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useGroupResults, PlayerDateRequest } from '@/context/GroupResultsContext';
import { TeamDetailMatches } from '@/components/results/TeamDetailMatches';
import { Link } from '@/components/Link';

/**
 * Parse teamId string to extract clubId and teamNumber
 * Format: "{clubId}-{teamNumber}" e.g., "12345-1"
 */
function parseTeamId(teamId: string): { clubId: number; teamNumber: number } | null {
  const parts = teamId.split('-');
  if (parts.length !== 2) return null;

  const clubId = parseInt(parts[0], 10);
  const teamNumber = parseInt(parts[1], 10);

  if (isNaN(clubId) || isNaN(teamNumber)) return null;

  return { clubId, teamNumber };
}

/**
 * Parse a date string to Unix timestamp in milliseconds
 */
function parseDateToTimestamp(dateStr: string): number {
  const asNumber = Number(dateStr);
  if (!isNaN(asNumber) && asNumber > 0) return asNumber;
  return new Date(dateStr).getTime();
}

export default function TeamDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const {
    teamResults,
    teamRoundResults,
    loading: resultsLoading,
    error: resultsError,
    getClubName,
    getPlayerName,
    fetchPlayersByDate,
    getPlayerEloByDate,
    getPlayerByDate
  } = useGroupResults();

  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerDataLoaded, setPlayerDataLoaded] = useState(0);
  const [averageRatings, setAverageRatings] = useState<{ teamAvg: number | null; opponentAvg: number | null }>({ teamAvg: null, opponentAvg: null });

  const tournamentId = params.tournamentId ? parseInt(params.tournamentId as string) : null;
  const groupId = params.groupId ? parseInt(params.groupId as string) : null;
  const teamIdParam = params.teamId as string;

  // Parse teamId from URL parameter
  const parsedTeamId = useMemo(() => {
    if (!teamIdParam) return null;
    return parseTeamId(teamIdParam);
  }, [teamIdParam]);

  // Find team info from results
  const teamInfo = useMemo(() => {
    if (!parsedTeamId) return null;
    return teamResults.find(
      r => r.contenderId === parsedTeamId.clubId && r.teamNumber === parsedTeamId.teamNumber
    );
  }, [teamResults, parsedTeamId]);

  // Create team name formatter for display
  const formatTeamName = useMemo(
    () => createTeamNameFormatter(teamResults, getClubName),
    [teamResults, getClubName]
  );

  // Filter matches for this team
  const teamMatches = useMemo(() => {
    if (!parsedTeamId) return [];

    return teamRoundResults.filter(result => {
      // Match if team is either home or away
      const isHome = result.homeId === parsedTeamId.clubId && result.homeTeamNumber === parsedTeamId.teamNumber;
      const isAway = result.awayId === parsedTeamId.clubId && result.awayTeamNumber === parsedTeamId.teamNumber;
      return isHome || isAway;
    });
  }, [teamRoundResults, parsedTeamId]);

  // Calculate average ratings for team and opponents when player data is loaded
  useEffect(() => {
    if (!parsedTeamId || teamMatches.length === 0 || playerDataLoaded === 0) {
      return;
    }

    const teamRatings: number[] = [];
    const opponentRatings: number[] = [];

    teamMatches.forEach(match => {
      const games = match.games || [];
      const isSelectedTeamHome = match.homeId === parsedTeamId.clubId && match.homeTeamNumber === parsedTeamId.teamNumber;
      const matchDate = parseDateToTimestamp(match.date);
      const lookupDate = !isNaN(matchDate) && matchDate > 0 ? normalizeEloLookupDate(matchDate) : Date.now();

      games.forEach(game => {
        // Skip walkovers
        if (isWalkoverPlayer(game.whiteId) || isWalkoverPlayer(game.blackId)) {
          return;
        }

        // Determine which player is on home/away team using table number
        // In team chess: away team has white on board 1 (table 0), colors alternate by board
        // Even tables (0, 2, 4...): away team plays white (home plays black)
        // Odd tables (1, 3, 5...): home team plays white
        const tableNr = game.tableNr ?? 0;
        const whiteIsHome = tableNr % 2 === 1;

        const homePlayerId = whiteIsHome ? game.whiteId : game.blackId;
        const awayPlayerId = whiteIsHome ? game.blackId : game.whiteId;

        // Get ELOs and parse to numbers
        const homeEloStr = getPlayerEloByDate(homePlayerId, lookupDate);
        const awayEloStr = getPlayerEloByDate(awayPlayerId, lookupDate);
        const homeElo = parseInt(homeEloStr, 10);
        const awayElo = parseInt(awayEloStr, 10);

        if (isSelectedTeamHome) {
          if (!isNaN(homeElo)) teamRatings.push(homeElo);
          if (!isNaN(awayElo)) opponentRatings.push(awayElo);
        } else {
          if (!isNaN(awayElo)) teamRatings.push(awayElo);
          if (!isNaN(homeElo)) opponentRatings.push(homeElo);
        }
      });
    });

    const teamAvg = teamRatings.length > 0
      ? Math.round(teamRatings.reduce((a, b) => a + b, 0) / teamRatings.length)
      : null;
    const opponentAvg = opponentRatings.length > 0
      ? Math.round(opponentRatings.reduce((a, b) => a + b, 0) / opponentRatings.length)
      : null;

    setAverageRatings({ teamAvg, opponentAvg });
  }, [teamMatches, parsedTeamId, getPlayerByDate, getPlayerEloByDate, playerDataLoaded]);

  // Fetch tournament info for page title
  useEffect(() => {
    if (!tournamentId || isNaN(tournamentId)) {
      setError('Invalid tournament ID');
      setLoading(false);
      return;
    }

    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError(null);

        const tournamentService = new TournamentService();
        const response = await tournamentService.getTournament(tournamentId);

        if (response.status !== 200) {
          throw new Error(response.error || 'Failed to fetch tournament data');
        }

        if (!response.data) {
          throw new Error('Tournament not found');
        }

        setTournament(response.data);
      } catch (err) {
        setError('Failed to load tournament information');
        console.error('Error fetching tournament:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Fetch player data for all matches when component mounts
  useEffect(() => {
    if (resultsLoading || teamMatches.length === 0) return;

    const requests: PlayerDateRequest[] = [];

    // Collect all player IDs from all matches
    teamMatches.forEach(match => {
      const games = match.games || [];
      const matchDate = parseDateToTimestamp(match.date);
      if (isNaN(matchDate) || matchDate <= 0) return;

      const lookupDate = normalizeEloLookupDate(matchDate);

      games.forEach(game => {
        if (game.whiteId > 0) {
          requests.push({ playerId: game.whiteId, date: lookupDate });
        }
        if (game.blackId > 0) {
          requests.push({ playerId: game.blackId, date: lookupDate });
        }
      });
    });

    if (requests.length > 0) {
      fetchPlayersByDate(requests).then(() => {
        // Trigger re-computation of average ratings
        setPlayerDataLoaded(prev => prev + 1);
      });
    }
  }, [teamMatches, resultsLoading, fetchPlayersByDate]);

  // Loading state
  if (loading || resultsLoading) {
    return <PageLayout fullScreen>{null}</PageLayout>;
  }

  // Error state
  if (error || resultsError) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
              {t.pages.tournamentResults.error}
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              {error || resultsError}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Invalid teamId
  if (!parsedTeamId) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
              {t.pages.tournamentResults.notFound}
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              Invalid team ID format
            </p>
            <Link
              href={`/results/${tournamentId}/${groupId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t.pages.tournamentResults.teamDetailPage.backToStandings}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Team not found
  if (!teamInfo) {
    return (
      <PageLayout fullScreen>
        <div className="text-center">
          <div className="p-8 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
              {t.pages.tournamentResults.notFound}
            </h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
              Team not found
            </p>
            <Link
              href={`/results/${tournamentId}/${groupId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t.pages.tournamentResults.teamDetailPage.backToStandings}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const teamDisplayName = formatTeamName(parsedTeamId.clubId, parsedTeamId.teamNumber);

  return (
    <PageLayout fullScreen maxWidth="5xl">
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Link
            href={`/results/${tournamentId}/${groupId}`}
            className="hover:underline"
          >
            {tournament?.name || 'Tournament'}
          </Link>
        </div>
        <h1 className="text-xl md:text-2xl font-light text-gray-900 dark:text-gray-200">
          {t.pages.tournamentResults.ongoingResults} {teamDisplayName}
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-0.5">
          <div><span className="font-medium text-gray-700 dark:text-gray-300">{t.pages.tournamentResults.teamDetailPage.position}:</span> #{teamInfo.place}</div>
          <div><span className="font-medium text-gray-700 dark:text-gray-300">{t.pages.tournamentResults.teamDetailPage.winDrawLoss}:</span> {teamInfo.wonGames ?? 0}-{teamInfo.drawGames ?? 0}-{teamInfo.lostGames ?? 0}</div>
          <div><span className="font-medium text-gray-700 dark:text-gray-300">{t.pages.tournamentResults.teamDetailPage.teamAvgRating}:</span> {averageRatings.teamAvg ?? '-'}</div>
          <div><span className="font-medium text-gray-700 dark:text-gray-300">{t.pages.tournamentResults.teamDetailPage.opponentAvgRating}:</span> {averageRatings.opponentAvg ?? '-'}</div>
        </div>
      </div>

      {/* Matches Section */}
      {teamMatches.length === 0 ? (
        <div className="rounded-lg border overflow-hidden bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
          <div className="p-8 text-center">
            <div className="text-gray-600 dark:text-gray-400">
              {t.pages.tournamentResults.teamDetailPage.noMatches}
            </div>
          </div>
        </div>
      ) : (
        <TeamDetailMatches
          matches={teamMatches}
          allRoundResults={teamRoundResults}
          selectedClubId={parsedTeamId.clubId}
          selectedTeamNumber={parsedTeamId.teamNumber}
          getClubName={getClubName}
          getPlayerName={getPlayerName}
          tournamentId={tournamentId!}
          groupId={groupId!}
          getPlayerEloByDate={getPlayerEloByDate}
        />
      )}
    </PageLayout>
  );
}
