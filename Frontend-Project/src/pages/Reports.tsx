import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { timeEntries, projects } from '../lib/mockData';
import { useAuth } from '../components/AuthProvider';
import { formatHours } from '../lib/utils';

export function Reports() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Calculate report data
  const reportData = projects.map(project => {
    const projectEntries = timeEntries.filter(
      entry => 
        entry.project_id === project.id &&
        entry.date >= startDate &&
        entry.date <= endDate
    );

    const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = projectEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    return {
      name: project.name,
      totalHours,
      billableHours,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and analyze time tracking data
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <div className="mb-6 flex items-center gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              />
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-700" />
              <XAxis 
                dataKey="name" 
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
                formatter={(value: number) => formatHours(value)}
              />
              <Legend />
              <Bar
                dataKey="billableHours"
                name="Billable Hours"
                fill="#1E90FF"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="totalHours"
                name="Total Hours"
                fill="#FFD700"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm dark:bg-dark-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Billable Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Billable %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {reportData.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="whitespace-nowrap px-6 py-4">{row.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">{formatHours(row.totalHours)}</td>
                  <td className="whitespace-nowrap px-6 py-4">{formatHours(row.billableHours)}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {((row.billableHours / row.totalHours) * 100 || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}