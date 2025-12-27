'use client';

import { SelectableList, SelectableListItem } from './SelectableList';
import { useOrganizations } from '@/context/OrganizationsContext';

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
}

export function DistrictFilter({
  selectedDistrictId,
  onDistrictSelect,
  variant,
  language,
  compact,
  transparent,
  districtCounts,
  totalCount
}: DistrictFilterProps) {
  const { districts, loading } = useOrganizations();

  if (loading) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {language === 'sv' ? 'Laddar organisationer...' : 'Loading organizations...'}
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
        ? `${language === 'sv' ? 'Alla' : 'All'} (${totalCount})`
        : language === 'sv' ? 'Alla distrikt' : 'All Districts',
      tooltip: language === 'sv' ? 'Visa alla' : 'Show all'
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
      label: `${language === 'sv' ? 'Övriga' : 'Other'} (${ovrigaCount})`,
      tooltip: language === 'sv' ? 'Turneringar utan distrikt' : 'Tournaments without district'
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
      title={language === 'sv' ? 'Distrikt' : 'District'}
      variant={variant}
      compact={compact}
      transparent={transparent}
    />
  );
}