'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/components/Link';
import type { NavDropdownItem, DropdownMenuItem } from './types';

interface NavDropdownProps {
  item: NavDropdownItem;
  display: 'icon' | 'text' | 'both';
}

function DropdownItem({ menuItem }: { menuItem: DropdownMenuItem }) {
  if (menuItem.kind === 'divider') {
    return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
  }

  const Icon = menuItem.icon;
  const baseClass =
    'w-full text-left flex items-center gap-2 px-4 py-2 text-sm transition-colors';

  if (menuItem.kind === 'link') {
    return (
      <Link
        href={menuItem.href}
        color="inherit"
        underline="never"
        className={`${baseClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
        <span>{menuItem.label}</span>
      </Link>
    );
  }

  if (menuItem.kind === 'toggle') {
    return (
      <button
        onClick={menuItem.onToggle}
        className={`${baseClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
        <span className="flex-1">{menuItem.label}</span>
        <span
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
            menuItem.isOn ? 'bg-gray-900 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-gray-900 transition-transform ${
              menuItem.isOn ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </span>
      </button>
    );
  }

  // kind === 'action'
  const activeClass = menuItem.isActive
    ? 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <button onClick={menuItem.onClick} className={`${baseClass} ${activeClass}`}>
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      <span>{menuItem.label}</span>
    </button>
  );
}

export function NavDropdown({ item, display }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const activeClass = 'text-gray-600 dark:text-gray-400';

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${activeClass}`}
      >
        {(display === 'icon' || display === 'both') && Icon && (
          <Icon className="w-5 h-5" aria-hidden="true" />
        )}
        {(display === 'text' || display === 'both') && (
          <span>{item.label}</span>
        )}
        {display === 'icon' && !Icon && (
          <span>{item.label}</span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-2 w-52 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg py-1 transition-all duration-150 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {item.items.map((menuItem, i) => (
          <DropdownItem key={menuItem.kind === 'divider' ? `divider-${i}` : menuItem.id} menuItem={menuItem} />
        ))}
      </div>
    </div>
  );
}
