'use client';

import { useMemo } from 'react';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { RatingType, PlayerCategory } from '@/lib/api';
import type { getTranslation } from '@/lib/translations';

export interface RatingFiltersValue {
  ratingDate: Date;
  ratingType: RatingType;
  memberType: PlayerCategory;
}

export interface RatingFiltersProps {
  value: RatingFiltersValue;
  onChange: (value: RatingFiltersValue) => void;
  t: ReturnType<typeof getTranslation>;
  /** Number of months to show in date picker (default: 12) */
  monthsToShow?: number;
}

/** Helper to format date as YYYY-MM-DD in local timezone */
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function RatingFilters({
  value,
  onChange,
  t,
  monthsToShow = 12,
}: RatingFiltersProps) {
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

  // Create date dropdown items (12 months starting from current month)
  const dateItems: SelectableListItem[] = useMemo(() => {
    const items: SelectableListItem[] = [];
    const now = new Date();

    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = formatDateLocal(date);
      items.push({
        id: dateStr,
        label: dateStr
      });
    }

    return items;
  }, [monthsToShow]);

  const handleDateChange = (id: string | number) => {
    onChange({
      ...value,
      ratingDate: new Date(id as string),
    });
  };

  const handleRatingTypeChange = (id: string | number) => {
    onChange({
      ...value,
      ratingType: id as RatingType,
    });
  };

  const handleMemberTypeChange = (id: string | number) => {
    onChange({
      ...value,
      memberType: id as PlayerCategory,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <SelectableList
        items={dateItems}
        selectedId={formatDateLocal(value.ratingDate)}
        onSelect={handleDateChange}
        title={t.pages.organizations.ratingList.dateLabel}
        variant="dropdown"
        density="compact"
      />
      <SelectableList
        items={ratingTypeItems}
        selectedId={value.ratingType}
        onSelect={handleRatingTypeChange}
        title={t.pages.organizations.ratingList.ratingTypeLabel}
        variant="dropdown"
        density="compact"
      />
      <SelectableList
        items={memberTypeItems}
        selectedId={value.memberType}
        onSelect={handleMemberTypeChange}
        title={t.pages.organizations.ratingList.memberTypeLabel}
        variant="dropdown"
        density="compact"
      />
    </div>
  );
}

/** Helper to get default filter values */
export function getDefaultRatingFilters(): RatingFiltersValue {
  const now = new Date();
  return {
    ratingDate: new Date(now.getFullYear(), now.getMonth(), 1),
    ratingType: RatingType.STANDARD,
    memberType: PlayerCategory.ALL,
  };
}