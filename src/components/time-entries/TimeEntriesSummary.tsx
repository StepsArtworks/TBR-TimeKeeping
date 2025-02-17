import React from 'react';
import { PieChart, Clock } from 'lucide-react';
import { TimeEntry } from '../../types';
import { formatHours, formatCurrency } from '../../lib/utils';
import { useAuth } from '../AuthProvider';

interface TimeEntriesSummaryProps {
  entries: TimeEntry[];
}

export function TimeEntriesSummary({ entries }: TimeEntriesSummaryProps) {
  const { user } = useAuth();
  const isLead = user?.role === 'lead' || user?.role === 'management';

  // For normal users, only show their entries
  const relevantEntries = isLead ? entries : entries.filter(entry => entry.user_id === user?.id);

  const projectSummary = relevantEntries.reduce((acc, entry) => {
    const projectName = entry.project?.name || 'Unknown Project';
    acc[projectName] = {
      total: (acc[projectName]?.total || 0) + entry.hours,
      billable: (acc[projectName]?.billable || 0) + (entry.is_billable ? entry.hours : 0),
      nonBillable: (acc[projectName]?.nonBillable || 0) + (!entry.is_billable ? entry.hours : 0),
      billableAmount: (acc[projectName]?.billableAmount || 0) + (entry.is_billable ? entry.hours * 1000 : 0),
    };
    return acc;
  }, {} as Record<string, { total: number; billable: number; nonBillable: number; billableAmount: number }>);

  const totalHours = relevantEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = relevantEntries.reduce(
    (sum, entry) => sum + (entry.is_billable ? entry.hours : 0),
    0
  );
  const totalNonBillableHours = totalHours - totalBillableHours;
  const totalBillableAmount = relevantEntries.reduce(
    (sum, entry) => sum + (entry.is_billable ? entry.hours * 1000 : 0),
    0
  );

  if (!isLead) {
    // Simplified view for normal users
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-medium">My Time Summary</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Hours</h3>
            <p className="mt-1 text-2xl font-semibold">{formatHours(totalHours)}</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Billable Hours</h3>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {totalHours > 0 ? ((totalBillableHours / totalHours) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatHours(totalBillableHours)}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Non-Billable Hours</h3>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                {totalHours > 0 ? ((totalNonBillableHours / totalHours) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {formatHours(totalNonBillableHours)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{
                width: `${totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Billable vs Non-Billable Split
          </div>
        </div>
      </div>
    );
  }

  // Full view for leads and management
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-medium">Project Time Summary</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Total: <strong>{formatHours(totalHours)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(totalBillableAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(projectSummary).map(([projectName, hours]) => (
          <div
            key={projectName}
            className="rounded-lg border border-gray-200 p-4 dark:border-dark-700"
          >
            <h3 className="mb-2 font-medium">{projectName}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                <span className="font-medium">{formatHours(hours.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Billable Hours:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatHours(hours.billable)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Non-Billable Hours:</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {formatHours(hours.nonBillable)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Billable Amount:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(hours.billableAmount)}
                </span>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Billable vs Non-Billable</span>
                  <span>{hours.total > 0 ? ((hours.billable / hours.total) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${hours.total > 0 ? (hours.billable / hours.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
        <h3 className="mb-4 font-medium">Overall Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
            <p className="mt-1 text-2xl font-semibold">{formatHours(totalHours)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Billable Hours</p>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {totalHours > 0 ? ((totalBillableHours / totalHours) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatHours(totalBillableHours)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Non-Billable Hours</p>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                {totalHours > 0 ? ((totalNonBillableHours / totalHours) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {formatHours(totalNonBillableHours)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Billable Amount</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totalBillableAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}