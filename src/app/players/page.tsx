'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { PageSpacing } from '@/components/layout/PageSpacing';
import { Card } from '@/components/layout/Card';

export default function PlayersPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = getTranslation(language); 
  const [nameSearch, setNameSearch] = useState('');
  const [memberIdSearch, setMemberIdSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleNameSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameSearch.trim()) return;
    
    setIsSearching(true);
    // For now, we'll just show a placeholder message
    // In the future, this will integrate with the PlayerService API
    console.log('Searching for player by name:', nameSearch);
    setIsSearching(false);
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
    setNameSearch('');
    setMemberIdSearch('');
  };

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
            <Card>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-mui-text-primary)' }}>
                {t.pages.players.search.byName}
              </h3>
              <form onSubmit={handleNameSearch} className="flex gap-4">
                <input
                  type="text"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder={t.pages.players.search.searchPlaceholder}
                  className="flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--color-mui-background-default)',
                    borderColor: 'var(--color-mui-divider)',
                    color: 'var(--color-mui-text-primary)'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching || !nameSearch.trim()}
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
                Name search functionality coming soon. This will search through player names and show results.
              </p>
            </Card>

            {/* Search by Member ID */}
            <Card>
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
            </Card>

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
