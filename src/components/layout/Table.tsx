'use client';

import React from 'react';

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
  /** Custom table container className */
  className?: string;
  /** Custom table container style */
  style?: React.CSSProperties;
  /** Optional row key extractor function */
  getRowKey?: (row: T, index: number) => string | number;
  /** Optional row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Compact table variant */
  size?: 'small' | 'medium';
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
  className = '',
  style,
  getRowKey,
  onRowClick,
  size = 'medium'
}: TableProps<T>) {
  const paddingClass = size === 'small' ? 'p-2' : 'p-3';

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
          <div style={{ color: 'var(--color-mui-text-secondary)' }}>
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
          <div style={{ color: 'var(--color-mui-error-main)' }}>
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
          <div style={{ color: 'var(--color-mui-text-secondary)' }}>
            {emptyMessage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`} style={style}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid var(--color-mui-divider)` }}>
            {columns.map((column) => (
              <th
                key={column.id}
                className={`${paddingClass} font-medium ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                } ${column.noWrap ? 'whitespace-nowrap' : ''}`}
                style={{
                  color: 'var(--color-mui-text-primary)',
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
          {data.map((row, index) => (
            <tr
              key={getKey(row, index)}
              className={`${
                hover ? 'hover:bg-black/5 hover:dark:bg-white/10 transition-colors' : ''
              } ${onRowClick ? 'cursor-pointer' : ''} ${
                striped && index % 2 === 1 ? 'bg-black/[0.02] dark:bg-white/10' : ''
              }`}
              style={{
                borderBottom: `1px solid var(--color-mui-divider)`
              }}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`${paddingClass} ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${column.noWrap ? 'whitespace-nowrap' : ''}`}
                  style={{
                    color: 'var(--color-mui-text-secondary)',
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
  );
}

export default Table;