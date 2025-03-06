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
  LineChart,
  Line,
} from 'recharts';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { formatCurrency, formatHours } from '../../lib/utils';
import { useAuth } from '../AuthProvider';

interface ProjectMetrics {
  total_hours: number;
  billable_hours: number;
  completion_percentage: number;
  task_completion_rate: number;
}

interface ProjectAnalyticsProps {
  projectId: string;
  metrics: ProjectMetrics;
  timeData: {
    date: string;
    hours: number;
    billableHours: number;
  }[];
  taskData: {
    date: string;
    completed: number;
    inProgress: number;
  }[];
  loading?: boolean;
  error?: string | null;
}

export function ProjectAnalytics({
  metrics,
  timeData,
  taskData,
  loading,
  error,
}: ProjectAnalyticsProps) {
  const { user } = useAuth();
  const isLeadOrManagement = user?.role === 'lead' || user?.role === 'management';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading project analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-semibold">{formatHours(metrics.total_hours)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Billable: {formatHours(metrics.billable_hours)} (
              {((metrics.billable_hours / metrics.total_hours) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
              <p className="text-2xl font-semibold">
                {metrics.completion_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${metrics.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Task Completion Rate
              </p>
              <p className="text-2xl font-semibold">
                {metrics.task_completion_rate.toFixed(1)}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <h3 className="mb-6 text-lg font-medium">Time Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-dark-700"
                />
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
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <h3 className="mb-6 text-lg font-medium">Task Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-dark-700"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  className="text-xs text-gray-600 dark:text-gray-400"
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
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  name="In Progress Tasks"
                  stroke="#1E90FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}