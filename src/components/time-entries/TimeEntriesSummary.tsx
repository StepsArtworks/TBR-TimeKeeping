import React from 'react';
import { PieChart, Clock } from 'lucide-react';
import { TimeEntry } from '../../types';
import { formatHours } from '../../lib/utils';

interface TimeEntriesSummaryProps {
  entries: TimeEntry[];
}

export function TimeEntriesSummary({ entries }: TimeEntriesSummaryProps) {
  const projectSummary = entries.reduce((acc, entry) => {
    const projectName = entry.project?.name || 'Unknown Project';
    acc[projectName] = {
      total: (acc[projectName]?.total || 0) + entry.hours,
      billable: (acc[projectName]?.billable || 0) + (entry.is_billable ? entry.hours : 0),
    };
    return acc;
  }, {} as Record<string, { total: number; billable: number }>);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = entries.reduce(
    (sum, entry) => sum + (entry.is_billable ? entry.hours : 0),
    0
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-medium">Time Summary</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>
            Total: <strong>{formatHours(totalHours)}</strong> (
            <span className="text-primary-600 dark:text-primary-400">
              {formatHours(totalBillableHours)} billable
            </span>
            )
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(projectSummary).map(([projectName, hours]) => (
          <div
            key={projectName}
            className="rounded-lg border border-gray-200 p-4 dark:border-dark-700"
          >
            <h3 className="mb-2 font-medium">{projectName}</h3>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                <span className="font-medium">{formatHours(hours.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Billable Hours:</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {formatHours(hours.billable)}
                </span>
              </div>
              <div className="mt-2">
                <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{
                      width: `${(hours.total / totalHours) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}