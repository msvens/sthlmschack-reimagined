'use client';

import React from 'react';

export interface SelectableListItem {
  /** Unique identifier for the item */
  id: string | number;
  /** Display label */
  label: string;
  /** Optional subtitle or additional info */
  subtitle?: string;
  /** Optional tooltip text */
  tooltip?: string;
}

export interface SelectableListProps {
  /** Array of items to display */
  items: SelectableListItem[];
  /** Currently selected item ID */
  selectedId: string | number | null;
  /** Callback when item is selected */
  onSelect: (id: string | number) => void;
  /** Optional title for the list */
  title?: string;
  /** Custom container className */
  className?: string;
  /** Responsive breakpoint - when to switch from horizontal to vertical */
  breakpoint?: 'sm' | 'md' | 'lg';
}

export function SelectableList({
  items,
  selectedId,
  onSelect,
  title,
  className = '',
  breakpoint = 'md'
}: SelectableListProps) {
  const responsiveClasses = {
    sm: {
      container: 'flex sm:flex-col gap-2 sm:gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0',
      item: 'flex-shrink-0 sm:flex-shrink sm:w-full whitespace-nowrap sm:whitespace-normal'
    },
    md: {
      container: 'flex md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0',
      item: 'flex-shrink-0 md:flex-shrink md:w-full whitespace-nowrap md:whitespace-normal'
    },
    lg: {
      container: 'flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0',
      item: 'flex-shrink-0 lg:flex-shrink lg:w-full whitespace-nowrap lg:whitespace-normal'
    }
  };

  const classes = responsiveClasses[breakpoint];

  return (
    <div className={`p-2 ${className}`}>
      {title && (
        <h2 className={`text-sm font-semibold mb-3 ${breakpoint}:mb-2 text-gray-900 dark:text-white`}>
          {title}
        </h2>
      )}

      <div className={classes.container}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`${classes.item} text-left px-3 py-2 transition-colors text-xs border-b rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedId === item.id
                ? 'font-medium border-current'
                : 'border-transparent'
            }`}
            title={item.tooltip}
          >
            <div className="font-medium">{item.label}</div>
            {item.subtitle && (
              <div className="text-xs opacity-70 mt-1">{item.subtitle}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectableList;