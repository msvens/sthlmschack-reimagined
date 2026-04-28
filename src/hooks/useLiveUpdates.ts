'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LiveUpdatesState {
  enabled: boolean;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

export interface UseLiveUpdatesOptions {
  /** Polling interval in milliseconds. Default: 30000 (30 seconds) */
  pollInterval?: number;
  /** Callback to refresh data */
  onRefresh: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL = 30000; // 30 seconds

export function useLiveUpdates(options: UseLiveUpdatesOptions) {
  const { pollInterval = DEFAULT_POLL_INTERVAL, onRefresh } = options;

  const [enabled, setEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use ref to track if a refresh is in progress to avoid overlapping
  const refreshInProgress = useRef(false);

  // Tracks whether the polling effect has run once. On the very first run
  // we skip the immediate refresh — the consumer's own initial fetch covers it,
  // and a duplicate fetch would just race itself for the same data. On any
  // later transition into `enabled` (user toggled off→on), refresh immediately.
  const hasMountedRef = useRef(false);

  const doRefresh = useCallback(async () => {
    if (refreshInProgress.current) return;

    refreshInProgress.current = true;
    setIsRefreshing(true);

    try {
      await onRefresh();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Live update refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      refreshInProgress.current = false;
    }
  }, [onRefresh]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    await doRefresh();
  }, [doRefresh]);

  // Set up polling when enabled
  useEffect(() => {
    if (!enabled) return;

    if (hasMountedRef.current) {
      doRefresh();
    }
    hasMountedRef.current = true;

    const intervalId = setInterval(() => {
      doRefresh();
    }, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, pollInterval, doRefresh]);

  return {
    state: {
      enabled,
      lastUpdated,
      isRefreshing,
    },
    setEnabled,
    manualRefresh,
  };
}
