'use client';

import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export type BadgeColor = 'amber' | 'blue' | 'gray' | 'green' | 'yellow' | 'red' | 'purple';

// Explicit class maps — no dynamic class construction (Tailwind JIT can't see it).
const COLOR_CLASSES: Record<BadgeColor, string> = {
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  /** 'pill' = fully rounded (default); 'rounded' = lightly rounded corners. */
  shape?: 'pill' | 'rounded';
  /**
   * When set, the badge becomes informational: it shows an info icon and reveals
   * this text in a small popover on hover/focus (instant — no native-title delay).
   */
  tooltip?: string;
  className?: string;
}

/** Small label pill. Pass `tooltip` to make it a hoverable info badge. */
export function Badge({ children, color = 'gray', shape = 'pill', tooltip, className = '' }: BadgeProps) {
  const pill = `inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium align-middle ${
    shape === 'pill' ? 'rounded-full' : 'rounded'
  } ${COLOR_CLASSES[color]}`;

  if (!tooltip) {
    return <span className={`${pill} ${className}`}>{children}</span>;
  }

  return (
    <span className={`group relative inline-flex ${className}`}>
      <span className={`${pill} cursor-help`} tabIndex={0}>
        {children}
        <InformationCircleIcon className="w-3.5 h-3.5" />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-2 py-1 text-xs font-normal leading-snug text-white shadow-lg group-hover:block group-focus-within:block dark:bg-gray-700"
      >
        {tooltip}
      </span>
    </span>
  );
}

export default Badge;
