'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// --- Props ---

interface DatePickerProps {
  value: string;                    // YYYY-MM-DD or YYYY-MM depending on mode
  onChange: (date: string) => void;
  mode?: 'date' | 'month';         // default: 'date'
  compact?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  language?: string;                // locale code (e.g. 'sv', 'en')
}

// --- Pure helpers ---

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-first: Mon=0..Sun=6
  const offset = (firstDayOfWeek + 6) % 7;
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  // Previous month days
  for (let i = offset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month - 1;
    const y = m < 0 ? year - 1 : year;
    days.push({ date: d, month: (m + 12) % 12, year: y, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: d, month, year, isCurrentMonth: true });
  }

  // Next month days to fill 42 cells (6 rows)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 1;
    const y = m > 11 ? year + 1 : year;
    days.push({ date: d, month: m % 12, year: y, isCurrentMonth: false });
  }

  return days;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toMonthString(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function formatDisplayDate(value: string, mode: 'date' | 'month', locale?: string): string {
  if (!value) return '';
  if (mode === 'month') {
    const [y, m] = value.split('-').map(Number);
    if (isNaN(y) || isNaN(m)) return value;
    const d = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(d);
  }
  const [y, m, d] = value.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return value;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

// Locale-aware weekday headers (Mon-first)
function getWeekdayHeaders(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  // Jan 5 2026 is a Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 0, 5 + i);
    return formatter.format(d);
  });
}

// Locale-aware month names
function getMonthNames(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2026, i, 1)));
}

// --- Component ---

export function DatePicker({
  value,
  onChange,
  mode = 'date',
  compact = false,
  fullWidth = false,
  disabled = false,
  label,
  placeholder,
  language,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      return new Date(parts[0], (parts[1] || 1) - 1, 1);
    }
    return new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse selected value for highlighting
  const selectedYear = value ? Number(value.split('-')[0]) : null;
  const selectedMonth = value ? Number(value.split('-')[1]) - 1 : null;
  const selectedDay = mode === 'date' && value ? Number(value.split('-')[2]) : null;

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen && value) {
      const parts = value.split('-').map(Number);
      setViewDate(new Date(parts[0], (parts[1] || 1) - 1, 1));
    }
    setIsOpen(prev => !prev);
  }, [disabled, isOpen, value]);

  const navigate = useCallback((direction: number) => {
    setViewDate(prev => {
      if (mode === 'date') {
        return new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      }
      return new Date(prev.getFullYear() + direction, prev.getMonth(), 1);
    });
  }, [mode]);

  const handleDayClick = useCallback((day: CalendarDay) => {
    onChange(toDateString(day.year, day.month, day.date));
    setIsOpen(false);
  }, [onChange]);

  const handleMonthClick = useCallback((monthIndex: number) => {
    onChange(toMonthString(viewYear, monthIndex));
    setIsOpen(false);
  }, [onChange, viewYear]);

  // Styling
  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClasses = compact ? 'px-3 py-1.5 text-sm' : 'px-3 py-2';

  const displayText = value ? formatDisplayDate(value, mode, language) : (placeholder || '');

  const weekdays = getWeekdayHeaders(language);
  const monthNames = getMonthNames(language);

  // Header label
  const headerLabel = mode === 'date'
    ? new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long' }).format(viewDate)
    : String(viewYear);

  return (
    <div className={`relative ${widthClass}`} ref={containerRef}>
      {label && (
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`${sizeClasses} bg-transparent border border-gray-300 dark:border-gray-600 rounded text-left flex items-center justify-between gap-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-900 dark:hover:border-white'
        } ${widthClass} ${value ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}
      >
        <span className="truncate">{displayText}</span>
        <svg className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Popup */}
      {isOpen && (
        <div className={`absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 ${
          mode === 'date' ? 'w-72' : 'w-56'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
              {headerLabel}
            </span>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Date mode: day grid */}
          {mode === 'date' && (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {weekdays.map((wd, i) => (
                  <div key={i} className="w-9 h-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    {wd}
                  </div>
                ))}
              </div>
              {/* Day grid */}
              <div className="grid grid-cols-7">
                {getCalendarDays(viewYear, viewMonth).map((day, i) => {
                  const isSelected = day.isCurrentMonth &&
                    day.year === selectedYear && day.month === selectedMonth && day.date === selectedDay;
                  const isToday = day.isCurrentMonth &&
                    day.year === todayYear && day.month === todayMonth && day.date === todayDate;

                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleDayClick(day)}
                      className={`w-9 h-9 rounded-full text-sm flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                            ? 'border border-blue-500 text-blue-600 dark:text-blue-400'
                            : day.isCurrentMonth
                              ? 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                              : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {day.date}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Month mode: month grid */}
          {mode === 'month' && (
            <div className="grid grid-cols-3 gap-1">
              {monthNames.map((name, i) => {
                const isSelected = viewYear === selectedYear && i === selectedMonth;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleMonthClick(i)}
                    className={`px-3 py-2 rounded text-sm ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
