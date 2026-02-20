'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { PlayerSearchInput } from '@/components/PlayerSearchInput';
import { TextField } from '@/components/TextField';
import { PlayerService } from '@/lib/api';
import { getRecentPlayers, RecentPlayer } from '@/lib/recentPlayers';

export default function PlayersPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = getTranslation(language);
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const [fideIdSearch, setFideIdSearch] = useState('');
  const [memberIdError, setMemberIdError] = useState('');
  const [fideIdError, setFideIdError] = useState('');
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const playerService = new PlayerService();

  // Load recent players on mount
  useEffect(() => {
    setRecentPlayers(getRecentPlayers());
  }, []);

  const handleMemberIdSearch = async () => {
    const memberId = parseInt(memberIdSearch.trim());
    if (isNaN(memberId)) return;
    setMemberIdError('');

    try {
      const response = await playerService.getPlayerInfo(memberId);
      if (response.status === 200 && response.data) {
        router.push(`/players/${response.data.id}`);
      } else {
        setMemberIdError(t.pages.players.search.playerNotFound);
      }
    } catch {
      setMemberIdError(t.pages.players.search.playerNotFound);
    }
  };

  const handleFideIdSearch = async () => {
    const fideId = parseInt(fideIdSearch.trim());
    if (isNaN(fideId)) return;
    setFideIdError('');

    try {
      const response = await playerService.getPlayerByFIDEId(fideId);
      if (response.status === 200 && response.data) {
        router.push(`/players/${response.data.id}`);
      } else {
        setFideIdError(t.pages.players.search.playerNotFound);
      }
    } catch {
      setFideIdError(t.pages.players.search.playerNotFound);
    }
  };

  const handleKeyDown = (field: 'memberId' | 'fideId') => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'memberId') handleMemberIdSearch();
      else handleFideIdSearch();
    }
  };

  return (
    <PageLayout fullScreen maxWidth="4xl">
      {/* Header */}
      <PageTitle title={t.pages.players.title} subtitle={t.pages.players.subtitle} />

      {/* Search fields — each searches on Enter */}
      <div className="space-y-4 mb-12">
        <PlayerSearchInput
          onSelect={(player) => router.push(`/players/${player.id}`)}
          placeholder={t.pages.players.search.namePlaceholder}
          label={t.pages.players.search.byName}
          noResultsMessage={t.pages.players.search.nameSearchHint}
          fullWidth
        />

        <div onKeyDown={handleKeyDown('memberId')}>
          <TextField
            label={t.pages.players.search.byMemberId}
            value={memberIdSearch}
            onChange={(e) => { setMemberIdSearch(e.target.value); setMemberIdError(''); }}
            placeholder={t.pages.players.search.memberIdPlaceholder}
            type="number"
            fullWidth
          />
          {memberIdError && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{memberIdError}</p>
          )}
        </div>

        <div onKeyDown={handleKeyDown('fideId')}>
          <TextField
            label={t.pages.players.search.byFideId}
            value={fideIdSearch}
            onChange={(e) => { setFideIdSearch(e.target.value); setFideIdError(''); }}
            placeholder="FIDE ID"
            type="number"
            fullWidth
          />
          {fideIdError && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fideIdError}</p>
          )}
        </div>
      </div>

      {/* Recent Players */}
      {recentPlayers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-200">
            {t.pages.players.recentPlayers}
          </h3>
          <div className="space-y-1">
            {recentPlayers.map((player) => (
              <div key={player.id}>
                <button
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {player.name}{player.club ? `, ${player.club}` : ''}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
