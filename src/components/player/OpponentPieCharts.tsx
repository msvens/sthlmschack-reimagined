'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ColorStats } from '@/lib/api';

export interface OpponentPieChartsProps {
  allStats: ColorStats;
  whiteStats: ColorStats;
  blackStats: ColorStats;
  labels: {
    all: string;
    white: string;
    black: string;
    wins: string;
    draws: string;
    losses: string;
  };
}

// Color scheme for chess results
const COLORS = {
  win: '#22c55e',   // Green
  draw: '#6b7280',  // Gray
  loss: '#ef4444'   // Red
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { total: number } }> }) {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    const total = data.payload.total;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 shadow-lg">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-200">
          {data.name}: {data.value} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

function PieChartCard({ title, data, isDark }: { title: string; data: Array<{ name: string; value: number }>; isDark: boolean }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-sm">
          No games
        </div>
      </div>
    );
  }

  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-200 mb-1 md:mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={200} className="md:h-[320px]">
        <PieChart>
          <Pie
            data={dataWithTotal}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="90%"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              if (midAngle === undefined || percent === undefined) return null;

              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const percentage = (percent * 100).toFixed(0);

              if (percent < 0.05) return null;

              return (
                <text
                  x={x}
                  y={y}
                  fill={isDark ? 'white' : '#1f2937'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-semibold"
                  style={{ textShadow: isDark ? '0 0 3px rgba(0,0,0,0.8)' : '0 0 3px rgba(255,255,255,0.8)' }}
                >
                  {`${percentage}%`}
                </text>
              );
            }}
            labelLine={false}
          >
            {dataWithTotal.map((entry, index) => {
              const color = index === 0 ? COLORS.win : index === 1 ? COLORS.draw : COLORS.loss;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OpponentPieCharts({
  allStats,
  whiteStats,
  blackStats,
  labels
}: OpponentPieChartsProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const createPieData = (stats: ColorStats, pieLabels: { wins: string; draws: string; losses: string }) => [
    { name: pieLabels.wins, value: stats.wins },
    { name: pieLabels.draws, value: stats.draws },
    { name: pieLabels.losses, value: stats.losses }
  ];

  const allData = createPieData(allStats, labels);
  const whiteData = createPieData(whiteStats, labels);
  const blackData = createPieData(blackStats, labels);

  const hasData = (allStats.wins + allStats.draws + allStats.losses) > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
      <PieChartCard title={labels.all} data={allData} isDark={isDark} />
      <PieChartCard title={labels.white} data={whiteData} isDark={isDark} />
      <PieChartCard title={labels.black} data={blackData} isDark={isDark} />
    </div>
  );
}