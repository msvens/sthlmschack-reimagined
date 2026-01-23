'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pagination } from '@/components/Pagination';

export interface PaginationLabels {
  showing: string;
  of: string;
  itemName?: string;
}

export interface PaginationConfig {
  /** Number of rows per page (default: 50) */
  pageSize?: number;
  /** Labels for pagination info. If omitted, shows "1-50 / 3334" format */
  labels?: PaginationLabels;
  /** Whether to show pagination info above table (default: true) */
  showInfo?: boolean;
}

export interface TableColumn<T = Record<string, unknown>> {
  /** Unique identifier for the column */
  id: string;
  /** Display header text */
  header: string;
  /** Field key in the data object, or accessor function */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether content should not wrap */
  noWrap?: boolean;
  /** Custom cell width */
  width?: string | number;
  /** Custom header styling */
  headerStyle?: React.CSSProperties;
  /** Custom cell styling */
  cellStyle?: React.CSSProperties;
  /** Custom header CSS classes */
  headerClassName?: string;
  /** Custom cell CSS classes */
  cellClassName?: string;
}

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface DensityThresholds {
  /** Row count threshold for comfortable density (below this) */
  comfortable: number;
  /** Row count threshold for normal density (below this, above comfortable) */
  normal: number;
  /** Above normal threshold = compact */
}

export interface TableProps<T = Record<string, unknown>> {
  /** Array of data objects to display */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Optional loading state */
  loading?: boolean;
  /** Optional error state */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom loading message */
  loadingMessage?: string;
  /** Enable hover effects on rows */
  hover?: boolean;
  /** Enable alternating row colors */
  striped?: boolean;
  /** Show borders around table */
  border?: boolean;
  /** Custom table container className */
  className?: string;
  /** Custom table container style */
  style?: React.CSSProperties;
  /** Optional row key extractor function */
  getRowKey?: (row: T, index: number) => string | number;
  /** Optional row click handler */
  onRowClick?: (row: T, index: number) => void;
  /**
   * Table density - controls padding and font size.
   * If not provided, auto-density is enabled (compact on mobile, row-count based on desktop)
   */
  density?: TableDensity;
  /**
   * Thresholds for auto-density selection on desktop.
   * Default: comfortable <= 10 rows, normal <= 20 rows, compact > 20 rows
   */
  densityThresholds?: DensityThresholds;
  /** @deprecated Use density prop instead */
  size?: 'small' | 'medium';
  /**
   * Enable pagination. Pass true for defaults or a config object.
   * Default pageSize is 50. Info text shows "1-50 / 3334" unless labels provided.
   */
  pagination?: boolean | PaginationConfig;
}

export function Table<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  hover = true,
  striped = true,
  border = true,
  className = '',
  style,
  getRowKey,
  onRowClick,
  density,
  densityThresholds = {
    comfortable: 10,
    normal: 20
  },
  size = 'medium',
  pagination
}: TableProps<T>) {
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Parse pagination config
  const paginationConfig = useMemo(() => {
    if (!pagination) return null;
    if (pagination === true) {
      return { pageSize: 50, labels: undefined, showInfo: true };
    }
    return {
      pageSize: pagination.pageSize ?? 50,
      labels: pagination.labels,
      showInfo: pagination.showInfo ?? true
    };
  }, [pagination]);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!paginationConfig) return data;
    const startIndex = (currentPage - 1) * paginationConfig.pageSize;
    return data.slice(startIndex, startIndex + paginationConfig.pageSize);
  }, [data, currentPage, paginationConfig]);

  // Format pagination info text
  const getPaginationInfo = () => {
    if (!paginationConfig || data.length === 0) return null;
    const startItem = (currentPage - 1) * paginationConfig.pageSize + 1;
    const endItem = Math.min(currentPage * paginationConfig.pageSize, data.length);
    const total = data.length;

    if (paginationConfig.labels) {
      const { showing, of, itemName } = paginationConfig.labels;
      const itemText = itemName ? ` ${itemName}` : '';
      return `${showing} ${startItem}-${endItem} ${of} ${total}${itemText}`;
    }

    return `${startItem}-${endItem} / ${total}`;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine effective density
  const getEffectiveDensity = (): TableDensity => {
    // If density is explicitly set, use it
    if (density) {
      return density;
    }

    // Mobile is always compact
    if (isMobile) {
      return 'compact';
    }

    // Desktop: auto-density based on visible row count
    const rowCount = paginatedData.length;
    if (rowCount <= densityThresholds.comfortable) {
      return 'comfortable';
    } else if (rowCount <= densityThresholds.normal) {
      return 'normal';
    } else {
      return 'compact';
    }
  };

  const effectiveDensity = getEffectiveDensity();

  // Map density to classes
  const densityClasses = {
    compact: {
      padding: 'py-1 px-2',
      fontSize: 'text-xs',
      lineHeight: 'leading-tight'
    },
    normal: {
      padding: 'p-2',
      fontSize: 'text-sm',
      lineHeight: 'leading-normal'
    },
    comfortable: {
      padding: 'p-3',
      fontSize: 'text-sm',
      lineHeight: 'leading-relaxed'
    }
  };

  const paddingClass = densityClasses[effectiveDensity].padding;
  const fontSizeClass = densityClasses[effectiveDensity].fontSize;
  const lineHeightClass = densityClasses[effectiveDensity].lineHeight;

  // Helper function to get cell content
  const getCellContent = (row: T, column: TableColumn<T>): React.ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    // Type-safe property access
    const value = row[column.accessor];
    if (value === undefined || value === null) {
      return '-';
    }
    // Convert non-ReactNode types to strings
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    // For objects or other types, convert to string representation
    return String(value);
  };

  // Helper function to get row key
  const getKey = (row: T, index: number) => {
    if (getRowKey) {
      return getRowKey(row, index);
    }
    return index;
  };

  // Loading state
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <div className="p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400">
            {loadingMessage}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="overflow-x-auto">
        <div className="p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400">
            {emptyMessage}
          </div>
        </div>
      </div>
    );
  }

  const paginationInfo = getPaginationInfo();

  return (
    <div className={`${className}`} style={style}>
      {/* Pagination info */}
      {paginationConfig && paginationConfig.showInfo && paginationInfo && (
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          {paginationInfo}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`w-full ${fontSizeClass} ${lineHeightClass}`}>
          <thead>
            <tr className={border ? "border-b border-gray-200 dark:border-gray-700" : ""}>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`${paddingClass} font-medium text-gray-900 dark:text-gray-200 ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${column.noWrap ? 'whitespace-nowrap' : ''} ${column.headerClassName || ''}`}
                  style={{
                    width: column.width,
                    ...column.headerStyle
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
            <tr
              key={getKey(row, index)}
              className={`${border ? 'border-b border-gray-200 dark:border-gray-700' : ''} ${
                hover ? 'hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors' : ''
              } ${onRowClick ? 'cursor-pointer' : ''} ${
                striped && index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/30' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`${paddingClass} text-gray-900 dark:text-gray-400 ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${column.noWrap ? 'whitespace-nowrap' : ''} ${column.cellClassName || ''}`}
                  style={{
                    ...column.cellStyle
                  }}
                >
                  {getCellContent(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination controls */}
      {paginationConfig && data.length > paginationConfig.pageSize && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={data.length}
            pageSize={paginationConfig.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default Table;