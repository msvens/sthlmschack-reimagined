'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { DropdownMenu, DropdownMenuItem } from '@/components/DropdownMenu';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { PlayerService, formatPlayerName } from '@/lib/api';
import { PlayerInfoDto } from '@/lib/api/types';
import { getRecentPlayers, RecentPlayer } from '@/lib/recentPlayers';

export default function PlayersPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = getTranslation(language);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const [fideIdSearch, setFideIdSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlayerInfoDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const playerService = new PlayerService();

  // Load recent players on mount
  useEffect(() => {
    setRecentPlayers(getRecentPlayers());
  }, []);

  // Unified search handler - tries memberId, then fideId, then name
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShowDropdown(false);

    try {
      // Priority 1: Try Member ID if provided
      if (memberIdSearch.trim()) {
        const memberId = parseInt(memberIdSearch.trim());
        if (!isNaN(memberId)) {
          router.push(`/players/${memberId}`);
          return;
        }
      }

      // Priority 2: Try FIDE ID if provided
      if (fideIdSearch.trim()) {
        const fideId = parseInt(fideIdSearch.trim());
        if (!isNaN(fideId)) {
          // Date parameter optional, defaults to today
          const response = await playerService.getPlayerByFIDEId(fideId);

          if (response.status === 200 && response.data) {
            router.push(`/players/${response.data.id}`);
            return;
          }
        }
      }

      // Priority 3: Try name search if both names provided
      if (firstName.trim() && lastName.trim()) {
        const response = await playerService.searchPlayer(firstName.trim(), lastName.trim());

        if (response.status === 200 && response.data) {
          const results = response.data;

          if (results.length === 1) {
            // Single result - navigate directly
            router.push(`/players/${results[0].id}`);
          } else if (results.length > 1) {
            // Multiple results - show dropdown
            setSearchResults(results);
            setShowDropdown(true);
          } else {
            // No results
            setSearchResults([]);
            setShowDropdown(false);
          }
          return;
        }
      }

      // If we get here, no valid search criteria or no results
      setSearchResults([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearches = () => {
    setFirstName('');
    setLastName('');
    setMemberIdSearch('');
    setFideIdSearch('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handlePlayerSelect = (item: DropdownMenuItem) => {
    router.push(`/players/${item.id}`);
    setShowDropdown(false);
  };

  const dropdownItems: DropdownMenuItem[] = searchResults.map(player => ({
    id: player.id,
    primary: formatPlayerName(player.firstName, player.lastName, player.elo?.title),
    secondary: player.club || undefined
  }));

  return (
    <PageLayout fullScreen maxWidth="4xl">
      {/* Header */}
      <PageTitle title={t.pages.players.title} subtitle={t.pages.players.subtitle} />

      {/* Unified Search Form */}
      <form onSubmit={handleSearch} className="space-y-4 mb-12">
        {/* Line 1: First Name & Last Name */}
        <div>
          <div className="flex gap-4">
            <TextField
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              fullWidth
            />
            <TextField
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              fullWidth
            />
          </div>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            Enter both first and last name to search for players.
          </p>
        </div>

        {/* Line 2: MemberId */}
        <TextField
          value={memberIdSearch}
          onChange={(e) => setMemberIdSearch(e.target.value)}
          placeholder={t.pages.players.search.memberIdPlaceholder}
          fullWidth
        />

        {/* Line 3: FideId */}
        <TextField
          value={fideIdSearch}
          onChange={(e) => setFideIdSearch(e.target.value)}
          placeholder="FIDE ID"
          fullWidth
        />

        {/* Line 4: Clear & Search buttons (right-aligned) */}
        <div ref={buttonContainerRef} className="flex justify-end gap-4 pt-2">
          <Button
            type="button"
            onClick={clearSearches}
            variant="outlined"
          >
            {t.common.actions.clear}
          </Button>
          <Button
            type="submit"
            disabled={isSearching}
            variant="outlined"
          >
            {isSearching ? '...' : t.common.actions.search}
          </Button>
        </div>

        {/* Dropdown for multiple name search results */}
        <DropdownMenu
          items={dropdownItems}
          isVisible={showDropdown}
          onItemClick={handlePlayerSelect}
          onClose={() => setShowDropdown(false)}
          anchorElement={buttonContainerRef.current}
          maxItems={5}
        />
      </form>

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
