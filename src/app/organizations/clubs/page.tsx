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

export default function ClubsSearchPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { getAllClubs, loading, error } = useOrganizations();
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
      <div className="space-y-6">
        <PageTitle
          title={t.pages.organizations.clubs.title}
          subtitle={t.pages.organizations.clubs.subtitle}
        />

        {/* Club search */}
        <div className="max-w-md">
          <SearchableSelectableList
            items={clubItems}
            selectedId={null}
            onSelect={handleClubSelect}
            placeholder={t.pages.organizations.clubs.searchPlaceholder}
          />
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {clubs.length} {t.pages.organizations.clubs.activeClubs}
        </div>

        {/* Browse by district link */}
        <div className="text-sm">
          <Link href="/organizations/districts" color="blue">
            {t.pages.organizations.clubs.browseByDistrict}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
