'use client';

import { SelectableList, SelectableListItem } from '../SelectableList';
import { getTranslation } from '@/lib/translations';
import { TournamentCategory, CategoryCounts } from '@/lib/utils/tournamentFilters';

interface TournamentCategoryFilterProps {
  selectedCategory: TournamentCategory;
  onCategorySelect: (category: TournamentCategory) => void;
  counts?: CategoryCounts;
  language: 'sv' | 'en';
  variant?: 'dropdown' | 'vertical';
  compact?: boolean;
  transparent?: boolean;
  showLabel?: boolean;
}

export function TournamentCategoryFilter({
  selectedCategory,
  onCategorySelect,
  counts,
  language,
  variant = 'dropdown',
  compact,
  transparent,
  showLabel = true,
}: TournamentCategoryFilterProps) {
  const t = getTranslation(language);

  const items: SelectableListItem[] = [
    {
      id: 'all',
      label: counts ? `${t.common.filters.all} (${counts.all})` : t.common.filters.all,
    },
    {
      id: 'team',
      label: counts ? `${t.components.tournamentCategoryFilter.team} (${counts.team})` : t.components.tournamentCategoryFilter.team,
    },
    {
      id: 'individual',
      label: counts ? `${t.components.tournamentCategoryFilter.individual} (${counts.individual})` : t.components.tournamentCategoryFilter.individual,
    },
  ];

  const handleSelect = (id: string | number) => {
    onCategorySelect(id as TournamentCategory);
  };

  return (
    <SelectableList
      items={items}
      selectedId={selectedCategory}
      onSelect={handleSelect}
      title={showLabel ? t.components.tournamentCategoryFilter.label : undefined}
      variant={variant}
      compact={compact}
      transparent={transparent}
    />
  );
}
