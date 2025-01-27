import React from 'react';
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: Task['status']) => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-primary-500';
      case 'completed':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-dark-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {task.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {task.assigned_to ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium dark:bg-dark-700">
                        {(task.assigned_to as any).full_name[0]}
                      </div>
                      <span>{(task.assigned_to as any).full_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {task.due_date
                        ? format(new Date(task.due_date), 'MMM d, yyyy')
                        : 'No due date'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    />
                    <span className="capitalize">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {task.actual_hours} / {task.estimated_hours}h
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}