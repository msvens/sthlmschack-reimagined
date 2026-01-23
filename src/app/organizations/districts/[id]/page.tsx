'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { PageTitle } from '@/components/PageTitle';
import { DistrictSelector } from '@/components/organizations/DistrictSelector';
import { RatingFilters, RatingFiltersValue, getDefaultRatingFilters } from '@/components/organizations/RatingFilters';
import { RatingTable } from '@/components/RatingTable';
import { getTranslation } from '@/lib/translations';
import { RatingsService } from '@/lib/api/services/ratings';
import type { PlayerInfoDto, DistrictDTO } from '@/lib/api/types';

export default function DistrictDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const { getDistrict, loading: orgsLoading } = useOrganizations();
  const t = getTranslation(language);

  const districtId = params.id ? parseInt(params.id as string) : null;

  const [filters, setFilters] = useState<RatingFiltersValue>(getDefaultRatingFilters);
  const [ratingData, setRatingData] = useState<PlayerInfoDto[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Get district info
  const district: DistrictDTO | undefined = districtId ? getDistrict(districtId) : undefined;

  // Fetch rating list when district or filters change
  useEffect(() => {
    if (!districtId) return;

    const fetchRatings = async () => {
      setLoadingRatings(true);
      try {
        const ratingsService = new RatingsService();
        const response = await ratingsService.getDistrictRatingList(
          districtId,
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
  }, [districtId, filters]);

  if (!districtId) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        {t.pages.organizations.districts.selectDistrict}
      </div>
    );
  }

  if (orgsLoading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        {t.pages.organizations.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page title with district name */}
      <PageTitle
        title={district?.name || t.pages.organizations.districts.title}
        subtitle={t.pages.organizations.districts.subtitle}
      />

      {/* District Info */}
      {district && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {district.city && <span>{district.city}</span>}
          {district.email && <span>{district.email}</span>}
          {district.url && (
            <a
              href={district.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {district.url}
            </a>
          )}
        </div>
      )}

      {/* District selector dropdown */}
      <DistrictSelector selectedDistrictId={districtId} t={t} />

      {/* Rating filters */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
          {t.pages.organizations.ratingList.title}
        </h3>
        <RatingFilters
          value={filters}
          onChange={setFilters}
          t={t}
        />
      </div>

      {/* Rating table */}
      <RatingTable
        players={ratingData}
        ratingType={filters.ratingType}
        loading={loadingRatings}
        t={t}
      />
    </div>
  );
}
