'use client';

import React from 'react';
import { PlayerInfoDto } from '@/lib/api/types';

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
    additionalInfo: {
      title: string;
      fideId: string;
      birthDate: string;
    };
    playerInfo: {
      memberId: string;
      club: string;
    };
  };
}

export function PlayerInfo({ player, t }: PlayerInfoProps) {
  const formatRating = (rating: number | null | undefined) => {
    return rating && rating > 0 ? rating.toString() : 'N/A';
  };

  return (
    <div className="space-y-4">
      {/* Player Header - Name and Primary Ratings */}
      <div>
        <h1 className="text-3xl font-light mb-3 text-gray-900 dark:text-white">
          {player.firstName} {player.lastName}
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatRating(player.elo?.rating)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t.eloRating.title}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatRating(player.lask?.rating)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              LASK Rating
            </div>
          </div>
        </div>
      </div>

      {/* Compact Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
        {/* Left Column */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.playerInfo.memberId}:</span>
            <span className="text-gray-900 dark:text-white font-medium">{player.id}</span>
          </div>
          {player.club && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.playerInfo.club}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.club}</span>
            </div>
          )}
          {player.elo?.rapidRating && player.elo.rapidRating > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.eloRating.rapidRating}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.elo.rapidRating}</span>
            </div>
          )}
          {player.elo?.blitzRating && player.elo.blitzRating > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.eloRating.blitzRating}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.elo.blitzRating}</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-1">
          {player.fideid && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.additionalInfo.fideId}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                <a
                  href={`https://ratings.fide.com/profile/${player.fideid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {player.fideid}
                </a>
              </span>
            </div>
          )}
          {player.birthdate && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.additionalInfo.birthDate}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.birthdate}</span>
            </div>
          )}
          {player.elo?.title && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.eloRating.fideTitle}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.elo.title}</span>
            </div>
          )}
          {player.elo?.k && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.eloRating.kFactor}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{player.elo.k}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}