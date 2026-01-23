'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageTitle } from '@/components/PageTitle';
import { RatingFilters, RatingFiltersValue, getDefaultRatingFilters } from '@/components/organizations/RatingFilters';
import { RatingTable } from '@/components/RatingTable';
import { getTranslation } from '@/lib/translations';
import { RatingsService } from '@/lib/api/services/ratings';
import type { PlayerInfoDto } from '@/lib/api/types';

export default function SSFRankingPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [filters, setFilters] = useState<RatingFiltersValue>(getDefaultRatingFilters);
  const [ratingData, setRatingData] = useState<PlayerInfoDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rating list when filters change
  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const ratingsService = new RatingsService();
        const response = await ratingsService.getFederationRatingList(
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
        setLoading(false);
      }
    };

    fetchRatings();
  }, [filters]);

  const handleFiltersChange = (newFilters: RatingFiltersValue) => {
    setFilters(newFilters);
  };

  return (
    <PageLayout maxWidth="4xl">
      <div className="space-y-6">
        <PageTitle
          title={t.pages.organizations.ssf.title}
          subtitle={t.pages.organizations.ssf.subtitle}
        />

        <RatingFilters
          value={filters}
          onChange={handleFiltersChange}
          t={t}
        />

        <RatingTable
          players={ratingData}
          ratingType={filters.ratingType}
          loading={loading}
          t={t}
        />
      </div>
    </PageLayout>
  );
}
