import React from 'react';
import { X } from 'lucide-react';
import { ProjectFilter } from '../../hooks/useProjects';

interface ProjectFiltersProps {
  filter: ProjectFilter;
  onChange: (filter: ProjectFilter) => void;
  onClose: () => void;
}

export function ProjectFilters({ filter, onChange, onClose }: ProjectFiltersProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-dark-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={filter.status || ''}
            onChange={(e) =>
              onChange({ ...filter, status: e.target.value || undefined })
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <input
            type="date"
            value={filter.startDate || ''}
            onChange={(e) =>
              onChange({ ...filter, startDate: e.target.value || undefined })
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <input
            type="date"
            value={filter.endDate || ''}
            onChange={(e) =>
              onChange({ ...filter, endDate: e.target.value || undefined })
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
        </div>
      </div>
    </div>
  );
}