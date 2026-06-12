'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is below `breakpoint` (default 640px — the
 * Tailwind `sm` breakpoint). Defaults to false on the server / first render to
 * avoid hydration mismatches, then corrects on mount and on resize.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);

  return isMobile;
}
