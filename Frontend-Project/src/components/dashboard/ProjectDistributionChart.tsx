import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProjectDistributionData {
  name: string;
  hours: number;
  percentage: number;
}

interface ProjectDistributionChartProps {
  data: ProjectDistributionData[];
}

const COLORS = ['#1E90FF', '#FFD700', '#FF6B6B', '#4CAF50', '#9C27B0'];

export function ProjectDistributionChart({ data }: ProjectDistributionChartProps) {
  return (
    <div className="h-[300px] w-full rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800">
      <h3 className="mb-4 text-lg font-medium">Project Time Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="hours"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percentage,
            }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text
                  x={x}
                  y={y}
                  className="fill-gray-600 text-xs dark:fill-gray-400"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                >
                  {`${percentage.toFixed(0)}%`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
                className="stroke-white dark:stroke-dark-800"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31, 41, 55)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}