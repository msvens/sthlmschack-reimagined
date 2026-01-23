'use client';

import { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface PaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons to show (default: 7) */
  maxPageButtons?: number;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  maxPageButtons = 7,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const sideButtons = Math.floor((maxPageButtons - 3) / 2);

    pages.push(1);

    let start = Math.max(2, currentPage - sideButtons);
    let end = Math.min(totalPages - 1, currentPage + sideButtons);

    if (currentPage <= sideButtons + 2) {
      end = Math.min(totalPages - 1, maxPageButtons - 2);
    }

    if (currentPage >= totalPages - sideButtons - 1) {
      start = Math.max(2, totalPages - maxPageButtons + 3);
    }

    if (start > 2) {
      pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxPageButtons]);

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className={`p-2 rounded-lg transition-colors ${
          canGoPrev
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-400 dark:text-gray-500"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={`p-2 rounded-lg transition-colors ${
          canGoNext
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
}

/** Helper to get paginated slice of data */
export function paginateData<T>(data: T[], currentPage: number, pageSize: number): T[] {
  const startIndex = (currentPage - 1) * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
}
