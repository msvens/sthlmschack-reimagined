'use client';

import { SelectableList, SelectableListItem } from '../SelectableList';
import { getTranslation } from '@/lib/translations';
import { TypeCounts, getAllTournamentTypes, getTournamentTypeKey } from '@/lib/utils/tournamentFilters';

interface TournamentTypeFilterProps {
  selectedType: number | null;
  onTypeSelect: (type: number | null) => void;
  counts?: TypeCounts;
  language: 'sv' | 'en';
  variant?: 'dropdown' | 'vertical';
  compact?: boolean;
  transparent?: boolean;
  showLabel?: boolean;
}

export function TournamentTypeFilter({
  selectedType,
  onTypeSelect,
  counts,
  language,
  variant = 'dropdown',
  compact,
  transparent,
  showLabel = true,
}: TournamentTypeFilterProps) {
  const t = getTranslation(language);
  const typeTranslations = t.components.tournamentTypeFilter;

  // Build items starting with "All"
  const items: SelectableListItem[] = [
    {
      id: 'all',
      label: counts ? `${typeTranslations.all} (${counts.all})` : typeTranslations.all,
    },
  ];

  // Add each tournament type
  getAllTournamentTypes().forEach(type => {
    const count = counts?.[type];
    // Skip types with no tournaments if counts are provided
    if (counts && (!count || count === 0)) {
      return;
    }

    const key = getTournamentTypeKey(type) as keyof typeof typeTranslations;
    const label = typeTranslations[key] || `Type ${type}`;

    items.push({
      id: type,
      label: count !== undefined ? `${label} (${count})` : label,
    });
  });

  const handleSelect = (id: string | number) => {
    if (id === 'all') {
      onTypeSelect(null);
    } else {
      onTypeSelect(Number(id));
    }
  };

  return (
    <SelectableList
      items={items}
      selectedId={selectedType ?? 'all'}
      onSelect={handleSelect}
      title={showLabel ? typeTranslations.label : undefined}
      variant={variant}
      compact={compact}
      transparent={transparent}
    />
  );
}
