'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '@/context/OrganizationsContext';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function DistrictsPage() {
  const router = useRouter();
  const { districts, loading } = useOrganizations();
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Redirect to first district when data is loaded
  useEffect(() => {
    if (!loading && districts.length > 0) {
      router.replace(`/organizations/districts/${districts[0].id}`);
    }
  }, [loading, districts, router]);

  if (loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        {t.pages.organizations.loading}
      </div>
    );
  }

  // Show message while redirecting or if no districts
  return (
    <div className="p-6 rounded-lg border text-center bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400">
        {t.pages.organizations.districts.selectDistrict}
      </p>
    </div>
  );
}
