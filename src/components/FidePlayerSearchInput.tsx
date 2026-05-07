'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { FideService, FidePlayer } from '@/lib/api';

interface FidePlayerSearchInputProps {
  onSelect: (player: FidePlayer) => void;
  placeholder?: string;
  compact?: boolean;
  label?: string;
  fullWidth?: boolean;
  noResultsMessage?: string;
  searchLabel?: string;
  /** Persistent helper text shown below the input to guide the user */
  helperText?: string;
}

export function FidePlayerSearchInput({
  onSelect,
  placeholder = 'Search by name...',
  compact = false,
  label,
  fullWidth = false,
  noResultsMessage = 'No players found',
  searchLabel = 'Search',
  helperText,
}: FidePlayerSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FidePlayer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const fideService = useRef(new FideService('/api/chesstools')).current;

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, closeDropdown]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, closeDropdown]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setError('');
    setShowDropdown(false);

    try {
      const response = await fideService.searchPlayers(trimmed);
      if (response.status === 200 && response.data && response.data.length > 0) {
        setResults(response.data);
        setShowDropdown(true);
        setError('');
      } else {
        setResults([]);
        setError(noResultsMessage);
      }
    } catch {
      setResults([]);
      setError(noResultsMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  const formatTitlePrefix = (player: FidePlayer): string => {
    const title = player.title || player.w_title || player.o_title || player.foa_title;
    return title ? `${title} ` : '';
  };

  const handleSelect = (player: FidePlayer) => {
    setQuery(`${formatTitlePrefix(player)}${player.name}`);
    setShowDropdown(false);
    setError('');
    onSelect(player);
  };

  return (
    <div ref={wrapperRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2" onKeyDown={handleKeyDown}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          compact={compact}
          fullWidth
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          variant="outlined"
          compact={compact}
        >
          {isSearching ? '...' : searchLabel}
        </Button>
      </div>

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 shadow-lg bg-gray-100 dark:bg-gray-800 overflow-hidden"
          style={{
            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div
            className="overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
              maxHeight: results.length > 8 ? '320px' : 'auto',
            }}
          >
            {results.map((player, index) => (
              <button
                key={player.fideid}
                onClick={() => handleSelect(player)}
                className="block px-3 py-2 text-left text-gray-900 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/10 transition-colors focus:outline-none relative whitespace-nowrap text-sm w-full"
              >
                <div>
                  {formatTitlePrefix(player)}{player.name}
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({player.country}{player.rating ? ` • ${player.rating}` : ''})
                  </span>
                </div>
                {index < results.length - 1 && (
                  <div className="absolute left-0 right-0 h-px bottom-0 bg-gray-200 dark:bg-gray-700 opacity-30" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error / no results message */}
      {error && !showDropdown ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{error}</p>
      ) : helperText && !showDropdown ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
