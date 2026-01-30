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

  const [enabled, setEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use ref to track if a refresh is in progress to avoid overlapping
  const refreshInProgress = useRef(false);

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

    // Do an initial refresh when enabling
    doRefresh();

    // Set up interval for subsequent refreshes
    const intervalId = setInterval(() => {
      doRefresh();
    }, pollInterval);

    // Cleanup on disable or unmount
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
