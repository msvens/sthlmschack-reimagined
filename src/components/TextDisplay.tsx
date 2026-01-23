'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface TextDisplayProps {
  /** The text content to display */
  text: string;
  /** Optional label shown before the text */
  label?: string;
  /** Number of lines to show when collapsed on small screens. If not set, shows all text. */
  maxLines?: number;
  /** Custom className for the container */
  className?: string;
}

export function TextDisplay({
  text,
  label,
  maxLines,
  className = '',
}: TextDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  // Track screen size - large screens don't truncate
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if text overflows the collapsed height (only on small screens)
  useEffect(() => {
    if (!maxLines || !textRef.current || isLargeScreen) {
      setNeedsExpansion(false);
      return;
    }

    const element = textRef.current;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
    const maxHeight = lineHeight * maxLines;
    setNeedsExpansion(element.scrollHeight > maxHeight + 2);
  }, [text, maxLines, isLargeScreen]);

  // Only apply line-clamp on small screens when not expanded
  const shouldTruncate = maxLines && !isExpanded && !isLargeScreen;
  const lineClampStyle = shouldTruncate
    ? {
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }
    : {};

  return (
    <div className={className}>
      {label && (
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {label}:{' '}
        </span>
      )}

      <span
        ref={textRef}
        className="text-gray-600 dark:text-gray-400"
        style={lineClampStyle}
      >
        {text}
      </span>

      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}