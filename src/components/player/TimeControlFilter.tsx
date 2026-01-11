'use client';

import React from 'react';
import { SelectableList } from '../SelectableList';

export type TimeControl = 'all' | 'standard' | 'rapid' | 'blitz';

export interface TimeControlCounts {
  all: number;
  standard: number;
  rapid: number;
  blitz: number;
}

export interface TimeControlFilterProps {
  selectedTimeControl: TimeControl;
  onTimeControlSelect: (timeControl: TimeControl) => void;
  counts: TimeControlCounts;
  labels: {
    all: string;
    standard: string;
    rapid: string;
    blitz: string;
    label: string;  // "Time Control" or "Tidskontroll"
  };
  compact?: boolean;
  variant?: 'vertical' | 'dropdown';
}

export function TimeControlFilter({
  selectedTimeControl,
  onTimeControlSelect,
  counts,
  labels,
  compact = false,
  variant = 'dropdown'
}: TimeControlFilterProps) {
  // Build items with counts
  const items = [
    {
      id: 'all',
      label: `${labels.all} (${counts.all})`
    },
    {
      id: 'standard',
      label: `${labels.standard} (${counts.standard})`
    },
    {
      id: 'rapid',
      label: `${labels.rapid} (${counts.rapid})`
    },
    {
      id: 'blitz',
      label: `${labels.blitz} (${counts.blitz})`
    }
  ];

  const handleSelect = (id: string | number) => {
    onTimeControlSelect(id as TimeControl);
  };

  return (
    <SelectableList
      items={items}
      selectedId={selectedTimeControl}
      onSelect={handleSelect}
      variant={variant}
      title={labels.label}
      compact={compact}
    />
  );
}