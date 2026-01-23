'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { SearchableSelectableList, SearchableSelectableListItem } from '@/components/SearchableSelectableList';
import { Link } from '@/components/Link';
import { getTranslation } from '@/lib/translations';

export default function OrganizationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { getAllClubs, districts, loading, error } = useOrganizations();
  const t = getTranslation(language);

  // Get all active clubs with rating players
  const clubs = useMemo(() => {
    return getAllClubs({ activeOnly: true, hasRatingPlayersOnly: true });
  }, [getAllClubs]);

  // Convert clubs to searchable items
  const clubItems: SearchableSelectableListItem[] = useMemo(() => {
    return clubs.map(club => ({
      id: club.id,
      label: club.name,
      subtitle: club.city || undefined,
    }));
  }, [clubs]);

  const handleClubSelect = (id: string | number) => {
    router.push(`/organizations/clubs/${id}`);
  };

  if (loading) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {t.pages.organizations.loading}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="4xl">
      <div className="space-y-8">
        <PageTitle
          title={t.pages.organizations.title}
          subtitle={t.pages.organizations.subtitle}
        />

        {/* Club search */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t.pages.organizations.navigation.searchClubs}
          </h2>
          <div className="max-w-md">
            <SearchableSelectableList
              items={clubItems}
              selectedId={null}
              onSelect={handleClubSelect}
              placeholder={t.pages.organizations.clubs.searchPlaceholder}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {clubs.length} {t.pages.organizations.clubs.activeClubs}
          </div>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SSF Ranking card */}
          <Link href="/organizations/ssf" className="block group">
            <div className="p-6 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {t.pages.organizations.navigation.ssfRanking}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t.pages.organizations.ssf.description}
              </p>
            </div>
          </Link>

          {/* Districts card */}
          <Link href="/organizations/districts" className="block group">
            <div className="p-6 rounded-lg border bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {t.pages.organizations.navigation.districts}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {districts.length} {t.pages.organizations.districts.title.toLowerCase()}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
