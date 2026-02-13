'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@/components/DatePicker';
import { getPlayerRatingHistory, type RatingDataPoint } from '@/lib/api';
import { useResponsiveDataPoints } from '@/hooks';

export interface EloRatingChartProps {
  /** Player ID to fetch rating history for */
  memberId: number;
  /** Height of the chart in pixels (default: 400) */
  height?: number;
  /** Labels for the legend */
  labels?: {
    standard: string;
    rapid: string;
    blitz: string;
    lask: string;
  };
  /** Show date range pickers (default: true) */
  showDatePickers?: boolean;
  /** Locale code for date picker formatting (e.g. 'sv', 'en') */
  language?: string;
  /** Initial date range in YYYY-MM format. Defaults to last 12 months. */
  initialPeriod?: {
    start: string;
    end: string;
  };
  /** Max data points (0 = responsive default, -1 = unlimited) */
  maxDataPoints?: number;
}

function getDefaultPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return {
    start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    end: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  };
}

export function EloRatingChart({
  memberId,
  height = 400,
  labels = {
    standard: 'ELO',
    rapid: 'Snabb-ELO',
    blitz: 'Blixt-ELO',
    lask: 'LASK'
  },
  showDatePickers = true,
  language,
  initialPeriod,
  maxDataPoints = 0,
}: EloRatingChartProps) {
  const defaultPeriod = initialPeriod ?? getDefaultPeriod();
  const [startMonth, setStartMonth] = useState(defaultPeriod.start);
  const [endMonth, setEndMonth] = useState(defaultPeriod.end);
  const [data, setData] = useState<RatingDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine effective max data points: 0 = responsive, -1 = unlimited, >0 = fixed
  const responsiveMax = useResponsiveDataPoints();
  const effectiveMax = maxDataPoints === 0 ? responsiveMax :
                       maxDataPoints === -1 ? 0 : maxDataPoints;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPlayerRatingHistory(memberId, startMonth, endMonth, effectiveMax);
        if (response.status === 200 && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Error fetching rating history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, startMonth, endMonth, effectiveMax]);

  // Format date for display (numeric YYYY-MM format, language-agnostic)
  const formatDate = (dateString: string) => {
    try {
      // If dateString is already in YYYY-MM format, return as-is
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Otherwise parse and format as YYYY-MM
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch {
      return dateString;
    }
  };

  // Custom tooltip to show all ratings at a point
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; payload: RatingDataPoint }> }) => {
    if (active && payload && payload.length > 0) {
      const date = payload[0]?.payload?.date;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 shadow-lg">
          <p className="text-xs font-medium text-gray-900 dark:text-gray-200 mb-0.5">
            {formatDate(date)}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {showDatePickers && (
        <div className="flex gap-3 mb-4">
          <DatePicker
            value={startMonth}
            onChange={setStartMonth}
            mode="month"
            compact
            language={language}
          />
          <DatePicker
            value={endMonth}
            onChange={setEndMonth}
            mode="month"
            compact
            language={language}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center text-gray-600 dark:text-gray-400" style={{ height }}>
          Loading...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-3 text-sm text-gray-500 dark:text-gray-400">
          No rating history available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.5} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              stroke="currentColor"
              strokeWidth={0.5}
            />
            <YAxis
              domain={[1200, 'auto']}
              width={40}
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              stroke="currentColor"
              strokeWidth={0.5}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend
              wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
              iconType="circle"
              iconSize={8}
            />

            {/* LASK - Muted Amber */}
            <Line
              type="monotone"
              dataKey="lask"
              name={labels.lask}
              stroke="#d97706"
              strokeWidth={1}
              dot={{ fill: '#d97706', r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />

            {/* Standard ELO - Muted Blue */}
            <Line
              type="monotone"
              dataKey="standard"
              name={labels.standard}
              stroke="#0284c7"
              strokeWidth={1}
              dot={{ fill: '#0284c7', r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />

            {/* Rapid ELO - Muted Rose */}
            <Line
              type="monotone"
              dataKey="rapid"
              name={labels.rapid}
              stroke="#be123c"
              strokeWidth={1}
              dot={{ fill: '#be123c', r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />

            {/* Blitz ELO - Muted Emerald */}
            <Line
              type="monotone"
              dataKey="blitz"
              name={labels.blitz}
              stroke="#059669"
              strokeWidth={1}
              dot={{ fill: '#059669', r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
}