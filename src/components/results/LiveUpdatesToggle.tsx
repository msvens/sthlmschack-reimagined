'use client';

import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface LiveUpdatesToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onManualRefresh: () => void;
}

export function LiveUpdatesToggle({
  enabled,
  onToggle,
  lastUpdated,
  isRefreshing,
  onManualRefresh,
}: LiveUpdatesToggleProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(language === 'sv' ? 'sv-SE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Manual Refresh Button */}
      <button
        onClick={onManualRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={t.pages.tournamentResults.liveUpdates.refresh}
        aria-label={t.pages.tournamentResults.liveUpdates.refresh}
      >
        <svg
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Live Updates Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className={`transition-colors ${
          enabled
            ? 'text-green-600 dark:text-green-400 font-medium'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {t.pages.tournamentResults.liveUpdates.label}
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-dark-bg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </label>

      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <span className="text-gray-500 dark:text-gray-500 text-xs">
          {t.pages.tournamentResults.liveUpdates.lastUpdated}: {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  );
}
