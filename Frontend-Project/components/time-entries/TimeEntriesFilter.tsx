import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Project } from '../../types';
import { cn } from '../../lib/utils';

interface TimeEntriesFilterProps {
  startDate: string;
  endDate: string;
  projectId?: string;
  projects: Project[];
  onFilterChange: (filter: {
    startDate: string;
    endDate: string;
    projectId?: string;
  }) => void;
  className?: string;
}

export function TimeEntriesFilter({
  startDate,
  endDate,
  projectId,
  projects,
  onFilterChange,
  className,
}: TimeEntriesFilterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              onFilterChange({
                startDate: e.target.value,
                endDate,
                projectId,
              })
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              onFilterChange({
                startDate,
                endDate: e.target.value,
                projectId,
              })
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={projectId || ''}
          onChange={(e) =>
            onFilterChange({
              startDate,
              endDate,
              projectId: e.target.value || undefined,
            })
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}