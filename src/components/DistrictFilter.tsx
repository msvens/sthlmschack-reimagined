'use client';

import { SelectableList, SelectableListItem } from './SelectableList';
import { useOrganizations } from '@/context/OrganizationsContext';
import { getTranslation } from '@/lib/translations';

export interface DistrictCount {
  districtId: number | null; // null = "Övriga"
  count: number;
}

interface DistrictFilterProps {
  selectedDistrictId: number | null;
  onDistrictSelect: (districtId: number | null) => void;
  variant: 'vertical' | 'dropdown';
  language: 'sv' | 'en';
  compact?: boolean;
  transparent?: boolean;
  districtCounts?: DistrictCount[]; // Optional: show counts, hide empty districts
  totalCount?: number; // Total number of items for "All" option
  showLabel?: boolean; // Optional: show/hide the label. Defaults to true
}

export function DistrictFilter({
  selectedDistrictId,
  onDistrictSelect,
  variant,
  language,
  compact,
  transparent,
  districtCounts,
  totalCount,
  showLabel = true
}: DistrictFilterProps) {
  const { districts, loading } = useOrganizations();
  const t = getTranslation(language);

  if (loading) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t.components.districtFilter.loading}
      </div>
    );
  }

  // If districtCounts provided, filter to only show districts with items
  const filteredDistricts = districtCounts
    ? districts.filter(d => districtCounts.some(dc => dc.districtId === d.id && dc.count > 0))
    : districts;

  // Create selectable items with "All" option
  const districtItems: SelectableListItem[] = [
    {
      id: 'all',
      label: totalCount !== undefined
        ? `${t.common.filters.all} (${totalCount})`
        : t.components.districtFilter.allDistricts,
      tooltip: t.components.districtFilter.showAll
    },
    ...filteredDistricts.map(district => {
      const count = districtCounts?.find(dc => dc.districtId === district.id)?.count;
      return {
        id: district.id,
        label: count !== undefined ? `${district.name} (${count})` : district.name,
        tooltip: district.name
      };
    })
  ];

  // Add "Övriga" option if there are non-district items
  const ovrigaCount = districtCounts?.find(dc => dc.districtId === null)?.count;
  if (ovrigaCount && ovrigaCount > 0) {
    districtItems.push({
      id: 'ovriga',
      label: `${t.components.districtFilter.other} (${ovrigaCount})`,
      tooltip: t.components.districtFilter.tournamentsWithoutDistrict
    });
  }

  const handleSelect = (id: string | number) => {
    if (id === 'all') {
      onDistrictSelect(null);
    } else if (id === 'ovriga') {
      onDistrictSelect(-1); // Special value for "Övriga"
    } else {
      onDistrictSelect(Number(id));
    }
  };

  // Determine selected ID for display
  let displaySelectedId: string | number = 'all';
  if (selectedDistrictId === -1) {
    displaySelectedId = 'ovriga';
  } else if (selectedDistrictId !== null) {
    displaySelectedId = selectedDistrictId;
  }

  return (
    <SelectableList
      items={districtItems}
      selectedId={displaySelectedId}
      onSelect={handleSelect}
      title={showLabel ? t.components.districtFilter.district : undefined}
      variant={variant}
      compact={compact}
      transparent={transparent}
    />
  );
}