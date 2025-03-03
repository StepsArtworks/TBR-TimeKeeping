import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeDistributionData {
  date: string;
  hours: number;
  billableHours: number;
}

interface TimeDistributionChartProps {
  data: TimeDistributionData[];
}

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  return (
    <div className="h-[300px] w-full rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800">
      <h3 className="mb-4 text-lg font-medium">Weekly Time Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-700" />
          <XAxis
            dataKey="date"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31, 41, 55)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
            }}
          />
          <Legend />
          <Bar
            dataKey="billableHours"
            name="Billable Hours"
            fill="#1E90FF"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="hours"
            name="Total Hours"
            fill="#FFD700"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}