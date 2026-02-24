'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SearchableSelectableListItem {
  /** Unique identifier for the item */
  id: string | number;
  /** Display label */
  label: string;
  /** Optional subtitle or additional info */
  subtitle?: string;
  /** Optional tooltip text */
  tooltip?: string;
}

export type ListDensity = 'compact' | 'normal' | 'comfortable';

export interface DensityThresholds {
  /** Item count threshold for comfortable density (below this) */
  comfortable: number;
  /** Item count threshold for normal density (below this, above comfortable) */
  normal: number;
  /** Above normal threshold = compact */
}

export interface SearchableSelectableListProps {
  /** Array of items to display */
  items: SearchableSelectableListItem[];
  /** Currently selected item ID */
  selectedId: string | number | null;
  /** Callback when item is selected */
  onSelect: (id: string | number) => void;
  /** Optional title for the list */
  title?: string;
  /** Placeholder when no item selected */
  placeholder?: string;
  /** Custom container className */
  className?: string;
  /**
   * List density - controls padding and font size.
   * If not provided, auto-density is enabled (compact on mobile, item-count based on desktop)
   */
  density?: ListDensity;
  /**
   * Thresholds for auto-density selection on desktop.
   * Default: comfortable <= 10 items, normal <= 20 items, compact > 20 items
   */
  densityThresholds?: DensityThresholds;
  /** @deprecated Use density prop instead */
  compact?: boolean;
}

export function SearchableSelectableList({
  items,
  selectedId,
  onSelect,
  title,
  placeholder = 'Select...',
  className = '',
  density,
  densityThresholds = {
    comfortable: 10,
    normal: 20
  },
  compact = false
}: SearchableSelectableListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine effective density
  const getEffectiveDensity = (): ListDensity => {
    // If density is explicitly set, use it
    if (density) {
      return density;
    }

    // Backward compatibility: compact prop
    if (compact) {
      return 'compact';
    }

    // Mobile is always compact
    if (isMobile) {
      return 'compact';
    }

    // Desktop: auto-density based on item count
    const itemCount = items.length;
    if (itemCount <= densityThresholds.comfortable) {
      return 'comfortable';
    } else if (itemCount <= densityThresholds.normal) {
      return 'normal';
    } else {
      return 'compact';
    }
  };

  const effectiveDensity = getEffectiveDensity();

  // Map density to classes
  const densityClasses = {
    compact: {
      triggerPadding: 'px-3 py-1.5',
      itemPadding: 'px-3 py-1',
      fontSize: 'text-xs',
      subtitleSize: 'text-[10px]',
      lineHeight: 'leading-tight'
    },
    normal: {
      triggerPadding: 'px-3 py-2',
      itemPadding: 'px-3 py-1.5',
      fontSize: 'text-sm',
      subtitleSize: 'text-xs',
      lineHeight: 'leading-normal'
    },
    comfortable: {
      triggerPadding: 'px-4 py-3',
      itemPadding: 'px-4 py-3',
      fontSize: 'text-sm',
      subtitleSize: 'text-xs',
      lineHeight: 'leading-relaxed'
    }
  };

  const triggerPadding = densityClasses[effectiveDensity].triggerPadding;
  const itemPadding = densityClasses[effectiveDensity].itemPadding;
  const fontSize = densityClasses[effectiveDensity].fontSize;
  const subtitleSize = densityClasses[effectiveDensity].subtitleSize;
  const lineHeight = densityClasses[effectiveDensity].lineHeight;

  // Get selected item
  const selectedItem = items.find((item) => item.id === selectedId);

  // Filter items based on search text
  const filteredItems = filterText.trim()
    ? items.filter(item =>
        item.label.toLowerCase().includes(filterText.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(filterText.toLowerCase())
      )
    : items;

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilterText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleItemSelect = (id: string | number) => {
    onSelect(id);
    setIsOpen(false);
    setFilterText('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Title */}
      {title && (
        <h2 className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400 uppercase">
          {title}
        </h2>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${triggerPadding} ${fontSize} ${lineHeight} text-left bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors flex items-center justify-between`}
      >
        <span className="text-gray-900 dark:text-gray-200">
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Type to filter..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Items list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`w-full ${itemPadding} ${fontSize} ${lineHeight} text-left transition-colors ${
                      isSelected
                        ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={item.tooltip}
                  >
                    <div>{item.label}</div>
                    {item.subtitle && (
                      <div className={`${subtitleSize} text-gray-500 dark:text-gray-400 mt-0.5`}>
                        {item.subtitle}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className={`${itemPadding} ${fontSize} text-center text-gray-500 dark:text-gray-400`}>
                No results found
              </div>
            )}
          </div>

          {/* Results count */}
          {filterText && (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {filteredItems.length} of {items.length} items
            </div>
          )}
        </div>
      )}
    </div>
  );
}