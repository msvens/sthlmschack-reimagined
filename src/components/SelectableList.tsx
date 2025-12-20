'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  /** Show title outside the component */
  showTitle?: boolean;
  /** Custom container className */
  className?: string;
  /** Display variant */
  variant?: 'vertical' | 'horizontal' | 'dropdown';
  /** Compact mode - smaller padding and font size */
  compact?: boolean;
  /** Transparent background for dropdown (default: false) */
  transparent?: boolean;
}

export function SelectableList({
  items,
  selectedId,
  onSelect,
  title,
  showTitle = true,
  className = '',
  variant = 'vertical',
  compact = false,
  transparent = false
}: SelectableListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected item
  const selectedItem = items.find((item) => item.id === selectedId);

  // Click outside handler for dropdown
  useEffect(() => {
    if (variant !== 'dropdown' || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant, isOpen]);

  const handleItemSelect = (id: string | number) => {
    onSelect(id);
    if (variant === 'dropdown') {
      setIsOpen(false);
    }
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    const triggerPadding = compact ? 'px-3 py-2' : 'px-4 py-3';
    const itemPadding = compact ? 'px-3 py-1.5' : 'px-4 py-3';
    const fontSize = compact ? 'text-xs' : 'text-sm';

    // Background classes based on transparent prop
    const triggerBg = transparent
      ? 'bg-white/90 dark:bg-dark-bg/90 hover:bg-gray-50/90 dark:hover:bg-gray-800/90'
      : 'bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800';
    const listBg = transparent
      ? 'bg-white/90 dark:bg-dark-bg/90'
      : 'bg-white dark:bg-dark-bg';
    const itemHoverBg = transparent
      ? 'hover:bg-gray-100/90 dark:hover:bg-gray-800/90'
      : 'hover:bg-gray-100 dark:hover:bg-gray-800';
    const itemSelectedBg = transparent
      ? 'bg-gray-50/90 dark:bg-gray-900/90'
      : 'bg-gray-50 dark:bg-gray-900';

    return (
      <div className={className}>
        {/* Title outside the box */}
        {title && showTitle && (
          <h2 className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400">
            {title}
          </h2>
        )}

        {/* Dropdown container with relative positioning */}
        <div ref={dropdownRef} className="relative">
          {/* Trigger button - takes up normal space */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full ${triggerPadding} text-left flex items-center justify-between border shadow-lg transition-colors ${triggerBg} border-gray-200 dark:border-gray-700 ${
              isOpen
                ? 'rounded-t-lg border-b-0'
                : 'rounded-lg'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`${fontSize} font-medium truncate text-gray-900 dark:text-white`}>
                {selectedItem?.label || 'Select an option'}
              </div>
            </div>
            <svg
              className={`ml-2 h-5 w-5 flex-shrink-0 transition-transform text-gray-400 ${
                isOpen ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Expanded items list - absolutely positioned overlay */}
          {isOpen && (
            <div className={`absolute z-50 left-0 right-0 top-full rounded-b-lg border border-t-0 shadow-lg overflow-hidden ${listBg} border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200`}>
              <div className="max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`w-full text-left ${itemPadding} transition-colors ${itemHoverBg} ${
                      selectedId === item.id
                        ? `${itemSelectedBg} font-medium text-gray-900 dark:text-white`
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title={item.tooltip}
                  >
                    <div className={fontSize}>{item.label}</div>
                    {item.subtitle && (
                      <div className="text-xs opacity-70 mt-1">{item.subtitle}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <div className={`p-2 ${className}`}>
        {title && (
          <h2 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
            {title}
          </h2>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item.id)}
              className={`flex-shrink-0 text-left px-3 py-2 transition-colors text-xs border-b rounded whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedId === item.id
                  ? 'font-medium border-current text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
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

  // Vertical variant (default)
  return (
    <div className={`p-2 ${className}`}>
      {title && (
        <h2 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h2>
      )}

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemSelect(item.id)}
            className={`w-full text-left px-3 py-2 transition-colors text-xs border-b rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedId === item.id
                ? 'font-medium border-current text-gray-900 dark:text-white'
                : 'border-transparent text-gray-600 dark:text-gray-400'
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