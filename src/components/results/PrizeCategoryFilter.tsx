'use client';

import React from 'react';
import { SelectableList } from '../SelectableList';
import { prizeCategoryLabel } from '@/lib/results/prizeCategories';
import type { PrizeCategoryDto } from '@/lib/api';

/** Sentinel id for "no category selected"; SelectableList needs a concrete id. */
export const ALL_PRIZES = 'all';

export interface PrizeCategoryFilterProps {
  /** Categories of a single prize type, already filtered and sorted. */
  categories: PrizeCategoryDto[];
  /** Currently selected category id, or null when showing everyone. */
  selectedId: number | null;
  /** Receives the category id, or null when the "all" entry is chosen. */
  onSelect: (categoryId: number | null) => void;
  /** Dropdown heading, e.g. "Rankingpriser". */
  title: string;
  /** Label for the clear-selection entry, e.g. "Alla". */
  allLabel: string;
  compact?: boolean;
}

/**
 * Dropdown over one prize type's categories, e.g. "Rankingpriser: R1 (1575–1718)".
 * Renders nothing when the group offers no categories of this type.
 */
export function PrizeCategoryFilter({
  categories,
  selectedId,
  onSelect,
  title,
  allLabel,
  compact = false,
}: PrizeCategoryFilterProps) {
  if (categories.length === 0) return null;

  const items = [
    { id: ALL_PRIZES, label: allLabel },
    ...categories.map((c) => ({ id: c.id, label: prizeCategoryLabel(c) })),
  ];

  return (
    <SelectableList
      items={items}
      selectedId={selectedId ?? ALL_PRIZES}
      onSelect={(id) => onSelect(id === ALL_PRIZES ? null : (id as number))}
      variant="dropdown"
      title={title}
      compact={compact}
    />
  );
}
