import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { useProjects } from '../hooks/useProjects';

export function Projects() {
  const { projects, loading, error, filter, setFilter } = useProjects();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your projects and track their progress
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600">
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button
            onClick={() => setFilter({ ...filter, sortBy: filter.sortBy === 'name' ? 'deadline' : 'name' })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700"
          >
            <ArrowUpDown className="h-5 w-5" />
            Sort
          </button>
        </div>
      </div>

      {showFilters && (
        <ProjectFilters
          filter={filter}
          onChange={setFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
      />
    </div>
  );
}