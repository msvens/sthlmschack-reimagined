'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { RatingFilters, RatingFiltersValue, getDefaultRatingFilters } from '@/components/organizations/RatingFilters';
import { RatingTable } from '@/components/RatingTable';
import { Link } from '@/components/Link';
import { TextDisplay } from '@/components/TextDisplay';
import { getTranslation } from '@/lib/translations';
import { RatingsService, type PlayerInfoDto, type ClubDTO } from '@/lib/api';

export default function ClubDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const { getClub, getDistrict, loading: orgsLoading } = useOrganizations();
  const t = getTranslation(language);

  const clubId = params.id ? parseInt(params.id as string) : null;

  const [filters, setFilters] = useState<RatingFiltersValue>(getDefaultRatingFilters);
  const [ratingData, setRatingData] = useState<PlayerInfoDto[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Get club info
  const club: ClubDTO | undefined = clubId ? getClub(clubId) : undefined;

  // Get parent district info
  const parentDistrictId = club?.districts?.find(d => d.active === 1)?.districtid;
  const parentDistrict = parentDistrictId ? getDistrict(parentDistrictId) : undefined;

  // Format school club as Yes/No
  const isSchoolClub = club?.schoolClub === 1 ? t.pages.organizations.yes : t.pages.organizations.no;

  // Fetch rating list when club or filters change
  useEffect(() => {
    if (!clubId) return;

    const fetchRatings = async () => {
      setLoadingRatings(true);
      try {
        const ratingsService = new RatingsService();
        const response = await ratingsService.getClubRatingList(
          clubId,
          filters.ratingDate,
          filters.ratingType,
          filters.memberType
        );

        if (response.data) {
          setRatingData(response.data);
        } else {
          setRatingData([]);
        }
      } catch (error) {
        console.error('Failed to load ratings:', error);
        setRatingData([]);
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [clubId, filters]);

  if (!clubId) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Club not found
        </div>
      </PageLayout>
    );
  }

  if (orgsLoading) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {t.pages.organizations.loading}
        </div>
      </PageLayout>
    );
  }

  if (!club) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Club not found
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="4xl">
      <div className="space-y-6">
        {/* Club header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
            {club.name}
          </h1>
          {parentDistrict && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t.pages.organizations.clubs.district}:{' '}
              <Link href={`/organizations/districts/${parentDistrict.id}`} color="blue">
                {parentDistrict.name}
              </Link>
            </div>
          )}
        </div>

        {/* Club info grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoField
            label={t.pages.organizations.street}
            value={club.street || '-'}
          />
          <InfoField
            label={t.pages.organizations.website}
            value={
              club.url ? (
                <a
                  href={club.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {club.url}
                </a>
              ) : '-'
            }
          />
          <InfoField
            label={t.pages.organizations.city}
            value={club.city || '-'}
          />
          <InfoField
            label={t.pages.organizations.email}
            value={club.email || '-'}
          />
          <InfoField
            label={t.pages.organizations.schoolClub}
            value={isSchoolClub}
          />
        </div>

        {/* Club description */}
        {club.vbdescr && (
          <TextDisplay
            text={club.vbdescr}
            maxLines={2}
            className="text-sm"
          />
        )}

        {/* Rating List Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {t.pages.organizations.ratingList.title}
          </h3>

          <RatingFilters
            value={filters}
            onChange={setFilters}
            t={t}
          />

          <RatingTable
            players={ratingData}
            ratingType={filters.ratingType}
            loading={loadingRatings}
            t={t}
          />
        </div>
      </div>
    </PageLayout>
  );
}

// Helper component for displaying labeled fields
function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>{' '}
      <span className="text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  );
}
