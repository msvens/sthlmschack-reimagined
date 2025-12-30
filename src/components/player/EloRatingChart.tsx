'use client';

import React from 'react';
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

export interface RatingDataPoint {
  /** Date string (e.g., "2024-01" or "2024-01-15") */
  date: string;
  /** Standard/classical rating */
  standard?: number;
  /** Rapid rating */
  rapid?: number;
  /** Blitz rating */
  blitz?: number;
  /** LASK rating (Swedish national rating) */
  lask?: number;
}

export interface EloRatingChartProps {
  /** Array of rating data points */
  data: RatingDataPoint[];
  /** Height of the chart in pixels (default: 400) */
  height?: number;
  /** Labels for the legend */
  labels?: {
    standard: string;
    rapid: string;
    blitz: string;
    lask: string;
  };
}

export function EloRatingChart({
  data,
  height = 400,
  labels = {
    standard: 'ELO',
    rapid: 'Snabb-ELO',
    blitz: 'Blixt-ELO',
    lask: 'LASK'
  }
}: EloRatingChartProps) {
  // Format date for display (show only month-year)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' });
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

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-600 dark:text-gray-400" style={{ height }}>
        No rating history available
      </div>
    );
  }

  return (
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
  );
}