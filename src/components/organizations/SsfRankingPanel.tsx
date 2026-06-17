'use client';

/**
 * Federation (SSF) ranking content — filters + rating table. Extracted from the
 * standalone /organizations/ssf page so both that route and the SSF Ranking tab
 * render the same thing.
 */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { RatingFilters, RatingFiltersValue, getDefaultRatingFilters } from '@/components/organizations/RatingFilters';
import { RatingTable } from '@/components/RatingTable';
import { getTranslation } from '@/lib/translations';
import { RatingsService, type PlayerInfoDto } from '@/lib/api';

export function SsfRankingPanel() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [filters, setFilters] = useState<RatingFiltersValue>(getDefaultRatingFilters);
  const [ratingData, setRatingData] = useState<PlayerInfoDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const ratingsService = new RatingsService();
        const response = await ratingsService.getFederationRatingList(
          filters.ratingDate,
          filters.ratingType,
          filters.memberType,
        );
        setRatingData(response.data ?? []);
      } catch (error) {
        console.error('Failed to load ratings:', error);
        setRatingData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [filters]);

  return (
    <div className="space-y-6">
      <RatingFilters value={filters} onChange={setFilters} t={t} />
      <RatingTable players={ratingData} ratingType={filters.ratingType} loading={loading} t={t} />
    </div>
  );
}
