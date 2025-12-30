'use client';

import { useRef, useEffect } from 'react';

export interface DropdownMenuItem {
  id: string | number;
  primary: string;
  secondary?: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  isVisible: boolean;
  onItemClick: (item: DropdownMenuItem) => void;
  onClose: () => void;
  anchorElement?: HTMLElement | null;
  maxItems?: number;
  className?: string;
}

export function DropdownMenu({
  items,
  isVisible,
  onItemClick,
  onClose,
  anchorElement,
  maxItems = 5,
  className = ''
}: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose, anchorElement]);

  // Handle keyboard navigation and scroll events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = (event: Event) => {
      if (isVisible) {
        // Don't close if the scroll is happening within the dropdown itself
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, onClose]);

  // Position the dropdown relative to the anchor element
  useEffect(() => {
    if (isVisible && dropdownRef.current && anchorElement) {
      const anchorRect = anchorElement.getBoundingClientRect();
      const dropdown = dropdownRef.current;

      // Position dropdown below the anchor element, aligned to the right
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${anchorRect.bottom + 8}px`;
      dropdown.style.right = `${window.innerWidth - anchorRect.right}px`;
      dropdown.style.width = 'auto';
      dropdown.style.minWidth = 'auto';
      dropdown.style.maxWidth = 'none';
      dropdown.style.zIndex = '1000';
    }
  }, [isVisible, anchorElement]);

  if (!isVisible || items.length === 0) {
    return null;
  }

  // Show all items when there are more than maxItems to enable scrolling
  const displayItems = items.length > maxItems ? items : items.slice(0, maxItems);

  return (
    <div
      ref={dropdownRef}
      className={`shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}
      style={{
        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.15)',
        display: 'inline-block',
        width: 'fit-content'
      }}
    >
      <div
        className="overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          maxHeight: items.length > maxItems ? '240px' : 'auto'
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="block px-3 py-2 text-left text-gray-900 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/10 transition-colors focus:outline-none relative whitespace-nowrap text-sm w-full"
          >
            <div>
              {item.secondary ? `${item.primary} (${item.secondary})` : item.primary}
            </div>
            {index < items.length - 1 && (
              <div
                className="absolute left-0 right-0 h-px bottom-0 bg-gray-200 dark:bg-gray-700 opacity-30"
              />
            )}
          </button>
        ))}

        {items.length > maxItems && (
          <div
            className="px-3 py-2 text-xs text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg opacity-80"
          >
            +{items.length - maxItems} more results
          </div>
        )}
      </div>
    </div>
  );
}