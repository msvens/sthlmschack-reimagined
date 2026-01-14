'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { SearchableSelectableList, SearchableSelectableListItem } from '@/components/SearchableSelectableList';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { RatingTable } from '@/components/RatingTable';
import { getTranslation } from '@/lib/translations';
import { RatingsService } from '@/lib/api/services/ratings';
import { RatingType, PlayerCategory } from '@/lib/api/types';
import type { ClubDTO, DistrictDTO, PlayerInfoDto } from '@/lib/api/types';

export default function OrganizationsPage() {
  const { language } = useLanguage();
  const { districts, getAllClubs, getClubsByDistrict, getClub, loading, error } = useOrganizations();
  const t = getTranslation(language);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  // Convert districts to dropdown items (with "All" option)
  const districtItems: SearchableSelectableListItem[] = useMemo(() => {
    const allOption: SearchableSelectableListItem = {
      id: 'all',
      label: t.pages.organizations.allDistricts,
    };
    const districtOptions = districts.map(district => ({
      id: district.id,
      label: district.name,
      subtitle: district.city
    }));
    return [allOption, ...districtOptions];
  }, [districts, t]);

  // Get filtered clubs based on selected district
  // By default, only show active clubs with rating players (matching official UI)
  const filteredClubs = useMemo(() => {
    const filterOptions = { activeOnly: true, hasRatingPlayersOnly: true };

    if (!selectedDistrictId) {
      return getAllClubs(filterOptions);
    }
    return getClubsByDistrict(selectedDistrictId, filterOptions);
  }, [selectedDistrictId, getAllClubs, getClubsByDistrict]);

  // Convert clubs to dropdown items (with "All" option)
  const clubItems: SearchableSelectableListItem[] = useMemo(() => {
    const allOption: SearchableSelectableListItem = {
      id: 'all',
      label: t.pages.organizations.allClubs,
    };
    const clubOptions = filteredClubs.map(club => ({
      id: club.id,
      label: club.name,
      subtitle: club.city
    }));
    return [allOption, ...clubOptions];
  }, [filteredClubs, t]);

  // Get selected district details
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null;
    return districts.find(d => d.id === selectedDistrictId) || null;
  }, [districts, selectedDistrictId]);

  // Get selected club details
  const selectedClub = useMemo(() => {
    if (!selectedClubId) return null;
    return getClub(selectedClubId) || null;
  }, [selectedClubId, getClub]);

  const handleDistrictSelect = (id: string | number) => {
    // Handle "all" option
    if (id === 'all') {
      setSelectedDistrictId(null);
      setSelectedClubId(null);
    } else {
      setSelectedDistrictId(id as number);
      setSelectedClubId(null); // Reset club selection when district changes
    }
  };

  const handleClubSelect = (id: string | number) => {
    // Handle "all" option
    if (id === 'all') {
      setSelectedClubId(null);
    } else {
      setSelectedClubId(id as number);
    }
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
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            {t.pages.organizations.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.pages.organizations.subtitle}
          </p>
        </div>

        {/* Dropdowns */}
        <div className="space-y-4">
          {/* District Selector */}
          <div className="relative">
            <SearchableSelectableList
              items={districtItems}
              selectedId={selectedDistrictId || 'all'}
              onSelect={handleDistrictSelect}
              title={t.pages.organizations.districtLabel}
              placeholder={t.pages.organizations.selectDistrict}
            />
          </div>

          {/* Club Selector */}
          <div className="relative">
            <SearchableSelectableList
              items={clubItems}
              selectedId={selectedClubId || 'all'}
              onSelect={handleClubSelect}
              title={t.pages.organizations.clubLabel}
              placeholder={t.pages.organizations.selectClub}
            />
          </div>
        </div>

        {/* Info Display */}
        {selectedClub ? (
          <ClubInfo club={selectedClub} t={t} />
        ) : selectedDistrict ? (
          <DistrictInfo district={selectedDistrict} clubCount={filteredClubs.length} t={t} />
        ) : null}
      </div>
    </PageLayout>
  );
}

// Club Info Component
function ClubInfo({ club, t }: { club: ClubDTO; t: ReturnType<typeof getTranslation> }) {
  // Helper to get first day of current month
  const getFirstOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const [ratingDate, setRatingDate] = useState<Date>(getFirstOfMonth());
  const [ratingType, setRatingType] = useState<RatingType>(RatingType.STANDARD);
  const [memberType, setMemberType] = useState<PlayerCategory>(PlayerCategory.ALL);
  const [ratingData, setRatingData] = useState<PlayerInfoDto[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Extract year from regYear timestamp
  const regYear = club.regYear?.startDate
    ? new Date(club.regYear.startDate).getFullYear().toString()
    : '-';

  // Format school club as Yes/No
  const isSchoolClub = club.schoolClub === 1 ? t.pages.organizations.yes : t.pages.organizations.no;

  // Create rating type dropdown items
  const ratingTypeItems: SelectableListItem[] = useMemo(() => [
    { id: RatingType.STANDARD, label: t.pages.organizations.ratingList.standard },
    { id: RatingType.RAPID, label: t.pages.organizations.ratingList.rapid },
    { id: RatingType.BLITZ, label: t.pages.organizations.ratingList.blitz },
  ], [t]);

  // Create member type dropdown items
  const memberTypeItems: SelectableListItem[] = useMemo(() => [
    { id: PlayerCategory.ALL, label: t.pages.organizations.ratingList.memberTypes.all },
    { id: PlayerCategory.WOMEN, label: t.pages.organizations.ratingList.memberTypes.women },
    { id: PlayerCategory.JUNIORS, label: t.pages.organizations.ratingList.memberTypes.juniors },
    { id: PlayerCategory.CADETS, label: t.pages.organizations.ratingList.memberTypes.cadets },
    { id: PlayerCategory.MINORS, label: t.pages.organizations.ratingList.memberTypes.minors },
    { id: PlayerCategory.KIDS, label: t.pages.organizations.ratingList.memberTypes.kids },
    { id: PlayerCategory.VETERANS, label: t.pages.organizations.ratingList.memberTypes.veterans },
    { id: PlayerCategory.Y2C_ELEMENTARY, label: t.pages.organizations.ratingList.memberTypes.y2cElementary },
    { id: PlayerCategory.Y2C_GRADE5, label: t.pages.organizations.ratingList.memberTypes.y2cGrade5 },
    { id: PlayerCategory.Y2C_GRADE6, label: t.pages.organizations.ratingList.memberTypes.y2cGrade6 },
    { id: PlayerCategory.Y2C_MIDDLE_SCHOOL, label: t.pages.organizations.ratingList.memberTypes.y2cMiddleSchool },
  ], [t]);

  // Helper to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Create date dropdown items (12 months starting from current month)
  const dateItems: SelectableListItem[] = useMemo(() => {
    const items: SelectableListItem[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = formatDateLocal(date);
      items.push({
        id: dateStr,
        label: dateStr
      });
    }

    return items;
  }, []);

  // Fetch rating list when club, date, rating type, or member type changes
  useEffect(() => {
    const fetchRatings = async () => {
      setLoadingRatings(true);
      try {
        const ratingsService = new RatingsService();
        const response = await ratingsService.getClubRatingList(
          club.id,
          ratingDate,
          ratingType,
          memberType
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
  }, [club.id, ratingDate, ratingType, memberType]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{club.name}</h2>

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
        <InfoField
          label={t.pages.organizations.regYear}
          value={regYear}
        />
      </div>

      {/* Rating List Section */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
          {t.pages.organizations.ratingList.title}
        </h3>

        {/* Rating filters */}
        <div className="grid grid-cols-3 gap-4">
          <SelectableList
            items={dateItems}
            selectedId={formatDateLocal(ratingDate)}
            onSelect={(id) => setRatingDate(new Date(id as string))}
            title={t.pages.organizations.ratingList.dateLabel}
            variant="dropdown"
            density="compact"
          />
          <SelectableList
            items={ratingTypeItems}
            selectedId={ratingType}
            onSelect={(id) => setRatingType(id as RatingType)}
            title={t.pages.organizations.ratingList.ratingTypeLabel}
            variant="dropdown"
            density="compact"
          />
          <SelectableList
            items={memberTypeItems}
            selectedId={memberType}
            onSelect={(id) => setMemberType(id as PlayerCategory)}
            title={t.pages.organizations.ratingList.memberTypeLabel}
            variant="dropdown"
            density="compact"
          />
        </div>

        {/* Rating table */}
        <RatingTable
          players={ratingData}
          ratingType={ratingType}
          loading={loadingRatings}
          t={t}
        />
      </div>
    </div>
  );
}

// District Info Component
function DistrictInfo({ district, clubCount, t }: { district: DistrictDTO; clubCount: number; t: ReturnType<typeof getTranslation> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{district.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <InfoField
          label={t.pages.organizations.clubsCount}
          value={clubCount.toString()}
        />
        {district.city && (
          <InfoField
            label={t.pages.organizations.city}
            value={district.city}
          />
        )}
        {district.email && (
          <InfoField
            label={t.pages.organizations.email}
            value={district.email}
          />
        )}
        {district.url && (
          <InfoField
            label={t.pages.organizations.website}
            value={
              <a
                href={district.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {district.url}
              </a>
            }
          />
        )}
      </div>
    </div>
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