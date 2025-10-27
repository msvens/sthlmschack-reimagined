'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { PageSpacing } from '@/components/layout/PageSpacing';
import { Card } from '@/components/layout/Card';
import { DropdownMenu, DropdownMenuItem } from '@/components/layout/DropdownMenu';
import { PlayerService } from '@/lib/api';
import { PlayerInfoDto } from '@/lib/api/types';

export default function PlayersPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = getTranslation(language);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlayerInfoDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const nameSearchRef = useRef<HTMLFormElement>(null);
  const playerService = new PlayerService();

  const handleNameSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSearching(true);
    setShowDropdown(false);

    try {
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
      } else {
        console.error('Search failed:', response.error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMemberIdSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdSearch.trim()) return;
    
    setIsSearching(true);
    // Navigate directly to the player page
    const memberId = parseInt(memberIdSearch.trim());
    if (!isNaN(memberId)) {
      router.push(`/players/${memberId}`);
    } else {
      alert('Please enter a valid member ID (number)');
    }
    setIsSearching(false);
  };

  const clearSearches = () => {
    setFirstName('');
    setLastName('');
    setMemberIdSearch('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handlePlayerSelect = (item: DropdownMenuItem) => {
    router.push(`/players/${item.id}`);
    setShowDropdown(false);
  };

  const dropdownItems: DropdownMenuItem[] = searchResults.map(player => ({
    id: player.id,
    primary: `${player.firstName} ${player.lastName}`,
    secondary: player.club || undefined
  }));

  return (
    <>
    <PageSpacing />
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light tracking-wide mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
              {t.pages.players.title}
            </h1>
            <p className="text-lg font-light" style={{ color: 'var(--color-mui-text-secondary)' }}>
              {t.pages.players.subtitle}
            </p>
          </div>

          {/* Search Forms */}
          <div className="space-y-8 mb-12">
            {/* Search by Name */}
            <div className="relative">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.players.search.byName}
              </h3>
              <form ref={nameSearchRef} onSubmit={handleNameSearch} className="flex gap-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--color-mui-background-default)',
                    borderColor: 'var(--color-mui-divider)',
                    color: 'var(--color-mui-text-primary)'
                  }}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--color-mui-background-default)',
                    borderColor: 'var(--color-mui-divider)',
                    color: 'var(--color-mui-text-primary)'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching || !firstName.trim() || !lastName.trim()}
                  className="px-6 py-2 rounded font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-mui-primary-main)',
                    color: 'var(--color-mui-primary-contrast)'
                  }}
                >
                  {isSearching ? '...' : t.pages.players.search.searchButton}
                </button>
              </form>
              <p className="text-sm mt-2" style={{ color: 'var(--color-mui-text-secondary)' }}>
                Enter both first and last name to search for players.
              </p>

              <DropdownMenu
                items={dropdownItems}
                isVisible={showDropdown}
                onItemClick={handlePlayerSelect}
                onClose={() => setShowDropdown(false)}
                anchorElement={nameSearchRef.current}
                maxItems={5}
              />
            </div>

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{ backgroundColor: 'var(--color-mui-divider)' }}
            />

            {/* Search by Member ID */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.players.search.byMemberId}
              </h3>
              <form onSubmit={handleMemberIdSearch} className="flex gap-4">
                <input
                  type="text"
                  value={memberIdSearch}
                  onChange={(e) => setMemberIdSearch(e.target.value)}
                  placeholder={t.pages.players.search.memberIdPlaceholder}
                  className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--color-mui-background-default)',
                    borderColor: 'var(--color-mui-divider)',
                    color: 'var(--color-mui-text-primary)'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching || !memberIdSearch.trim()}
                  className="px-6 py-2 rounded font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-mui-primary-main)',
                    color: 'var(--color-mui-primary-contrast)'
                  }}
                >
                  {isSearching ? '...' : t.pages.players.search.searchButton}
                </button>
              </form>
              <p className="text-sm mt-2" style={{ color: 'var(--color-mui-text-secondary)' }}>
                Enter a member ID to go directly to that player&apos;s page.
              </p>
            </div>

            {/* Clear Button */}
            <div className="text-center">
              <button
                onClick={clearSearches}
                className="px-4 py-2 rounded border transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-mui-divider)',
                  color: 'var(--color-mui-text-secondary)'
                }}
              >
                {t.pages.players.search.clearButton}
              </button>
            </div>
          </div>

          {/* Example Member IDs */}
          <Card>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
              Example Member IDs to try:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMemberIdSearch('642062')}
                className="px-3 py-1 rounded text-sm border transition-colors"
                style={{
                  backgroundColor: 'var(--color-mui-background-default)',
                  borderColor: 'var(--color-mui-divider)',
                  color: 'var(--color-mui-text-primary)'
                }}
              >
                642062 (Olle Svensson)
              </button>
              <button
                onClick={() => setMemberIdSearch('1786741')}
                className="px-3 py-1 rounded text-sm border transition-colors"
                style={{
                  backgroundColor: 'var(--color-mui-background-default)',
                  borderColor: 'var(--color-mui-divider)',
                  color: 'var(--color-mui-text-primary)'
                }}
              >
                1786741 (FIDE ID)
              </button>
            </div>
          </Card>
        </div>
      </div>
      </>
  );
}
