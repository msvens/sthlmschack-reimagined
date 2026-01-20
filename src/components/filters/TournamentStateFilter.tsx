'use client';

import { SelectableList, SelectableListItem } from '../SelectableList';
import { getTranslation } from '@/lib/translations';
import { TournamentState } from '@/lib/api';
import { StateCounts } from '@/lib/utils/tournamentFilters';

interface TournamentStateFilterProps {
  selectedState: number | null;
  onStateSelect: (state: number | null) => void;
  counts?: StateCounts;
  language: 'sv' | 'en';
  variant?: 'dropdown' | 'vertical';
  compact?: boolean;
  transparent?: boolean;
  showLabel?: boolean;
}

export function TournamentStateFilter({
  selectedState,
  onStateSelect,
  counts,
  language,
  variant = 'dropdown',
  compact,
  transparent,
  showLabel = true,
}: TournamentStateFilterProps) {
  const t = getTranslation(language);
  const stateTranslations = t.components.tournamentStateFilter;

  const items: SelectableListItem[] = [
    {
      id: 'all',
      label: counts ? `${stateTranslations.all} (${counts.all})` : stateTranslations.all,
    },
  ];

  // Add registration option
  if (!counts || counts.registration > 0) {
    items.push({
      id: TournamentState.REGISTRATION,
      label: counts
        ? `${stateTranslations.registration} (${counts.registration})`
        : stateTranslations.registration,
    });
  }

  // Add started option
  if (!counts || counts.started > 0) {
    items.push({
      id: TournamentState.STARTED,
      label: counts
        ? `${stateTranslations.started} (${counts.started})`
        : stateTranslations.started,
    });
  }

  // Add finished option
  if (!counts || counts.finished > 0) {
    items.push({
      id: TournamentState.FINISHED,
      label: counts
        ? `${stateTranslations.finished} (${counts.finished})`
        : stateTranslations.finished,
    });
  }

  const handleSelect = (id: string | number) => {
    if (id === 'all') {
      onStateSelect(null);
    } else {
      onStateSelect(Number(id));
    }
  };

  return (
    <SelectableList
      items={items}
      selectedId={selectedState ?? 'all'}
      onSelect={handleSelect}
      title={showLabel ? stateTranslations.label : undefined}
      variant={variant}
      compact={compact}
      transparent={transparent}
    />
  );
}
