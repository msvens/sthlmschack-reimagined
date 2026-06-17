'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** The club search now lives in the Clubs tab on /organizations. */
export default function ClubsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/organizations?tab=clubs');
  }, [router]);
  return null;
}
