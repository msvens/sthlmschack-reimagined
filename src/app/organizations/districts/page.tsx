'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** The district list now lives in the Districts tab on /organizations. */
export default function DistrictsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/organizations?tab=districts');
  }, [router]);
  return null;
}
