'use client';

import { useState, useEffect } from 'react';

export interface ResponsiveDataPointsOptions {
  /** Max data points for small screens (default: 12) */
  smallScreenMax?: number;
  /** Max data points for large screens (default: 24) */
  largeScreenMax?: number;
  /** Breakpoint in pixels (default: 768) */
  breakpoint?: number;
}

/**
 * Hook that returns the recommended max data points based on screen width.
 * Updates on window resize.
 */
export function useResponsiveDataPoints(options?: ResponsiveDataPointsOptions): number {
  const { smallScreenMax = 12, largeScreenMax = 24, breakpoint = 768 } = options ?? {};
  const [maxPoints, setMaxPoints] = useState(largeScreenMax);

  useEffect(() => {
    const updateMaxPoints = () => {
      setMaxPoints(window.innerWidth < breakpoint ? smallScreenMax : largeScreenMax);
    };
    updateMaxPoints();
    window.addEventListener('resize', updateMaxPoints);
    return () => window.removeEventListener('resize', updateMaxPoints);
  }, [smallScreenMax, largeScreenMax, breakpoint]);

  return maxPoints;
}
