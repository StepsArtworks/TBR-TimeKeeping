import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { TimeEntry } from '../../types';
import { formatHours } from '../../lib/utils';
import { useProjects, useTasks } from '../../lib/api';

interface TimeEntriesListProps {
  entries: TimeEntry[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
  onEdit: (entry: TimeEntry) => void;
}

export function TimeEntriesList({
  entries,
  loading,
  error,
  onDelete,
  onEdit,
}: TimeEntriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Get projects and tasks for entry details
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (loading || projectsLoading || tasksLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading time entries...
          </p>
        </div>
      </div>
    );
  }

  if (error || projectsError || tasksError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error || projectsError || tasksError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
        <Clock className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No time entries
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start by adding a new time entry above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Task
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
          {entries.map((entry) => {
            const project = projects?.find(p => p.id === entry.project_id);
            const task = tasks?.find(t => t.id === entry.task_id);

            return (
              <tr
                key={entry.id}
                className="group hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {project?.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {task?.name || '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {formatHours(entry.hours)}
                </td>
                <td className="max-w-md px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <p className="truncate">{entry.description}</p>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(entry)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-dark-600"
                    >
                      {deletingId === entry.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}