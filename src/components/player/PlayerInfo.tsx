'use client';

import React, { useState } from 'react';
import { PlayerInfoDto } from '@/lib/api/types';
import { Link } from '@/components/Link';

export interface PlayerInfoProps {
  player: PlayerInfoDto;
  /** Translations object */
  t: {
    eloRating: {
      title: string;
      standardRating: string;
      rapidRating: string;
      blitzRating: string;
      fideTitle: string;
      date: string;
      kFactor: string;
    };
    laskRating: {
      title: string;
      rating: string;
    };
    additionalInfo: {
      title: string;
      fideId: string;
      birthDate: string;
      birthYear: string;
    };
    playerInfo: {
      memberId: string;
      club: string;
    };
  };
}

export function PlayerInfo({ player, t }: PlayerInfoProps) {
  const [imageError, setImageError] = useState(false);

  const formatRating = (rating: number | null | undefined) => {
    return rating && rating > 0 ? rating.toString() : '-';
  };

  const extractYear = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    // Extract just the year (first 4 characters for YYYY format)
    return dateString.substring(0, 4);
  };

  const photoUrl = `https://resultat.schack.se/getPlayerPhoto?id=${player.id}`;

  return (
    <div>
      {/* Player Name */}
      <h1 className="text-3xl font-light mb-8 text-gray-900 dark:text-gray-200">
        {player.firstName} {player.lastName}
      </h1>

      {/* Info + Image container - full width with space between */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Mobile: Photo (left-aligned, before info) */}
        {!imageError && (
          <div className="sm:hidden">
            <img
              src={photoUrl}
              alt={`${player.firstName} ${player.lastName}`}
              className="max-w-[160px] max-h-[160px] object-contain rounded"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Player Information - constrained width */}
        <div className="min-w-[320px] max-w-[480px] space-y-1 text-sm">
          {/* SSF Id (Member ID) */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">SSF Id:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{player.id}</span>
          </div>

          {/* FIDE Id */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">FIDE Id:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">
              {player.fideid ? (
                <a
                  href={`https://ratings.fide.com/profile/${player.fideid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {player.fideid}
                </a>
              ) : (
                '-'
              )}
            </span>
          </div>

          {/* Birth Year */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.additionalInfo.birthYear}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{extractYear(player.birthdate)}</span>
          </div>

          {/* Club */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.playerInfo.club}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">
              {player.clubId ? (
                <Link href={`/organizations/clubs/${player.clubId}`}>
                  {player.club || `Club ${player.clubId}`}
                </Link>
              ) : (
                player.club || '-'
              )}
            </span>
          </div>

          {/* ELO Rating */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.eloRating.title}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{formatRating(player.elo?.rating)}</span>
          </div>

          {/* Rapid Rating */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.eloRating.rapidRating}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{formatRating(player.elo?.rapidRating)}</span>
          </div>

          {/* Blitz Rating */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.eloRating.blitzRating}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{formatRating(player.elo?.blitzRating)}</span>
          </div>

          {/* LASK Rating */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.laskRating.title}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{formatRating(player.lask?.rating)}</span>
          </div>

          {/* K-Factor */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.eloRating.kFactor}:</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">{formatRating(player.elo?.k)}</span>
          </div>
        </div>

        {/* Right: Player Photo (Desktop: >= sm) */}
        {!imageError && (
          <div className="hidden sm:block flex-shrink-0">
            <img
              src={photoUrl}
              alt={`${player.firstName} ${player.lastName}`}
              className="max-w-[240px] max-h-[240px] object-contain rounded"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}