import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { Clock, User, Edit2, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../AuthProvider';
import { useUsers, useTasks, useTimeEntries } from '../../lib/api';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, onTaskUpdate, onEdit }: TaskListProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskHours, setTaskHours] = useState<Record<string, number>>({});

  // Check if user has edit permissions (lead or management)
  const canEdit = user?.role === 'lead' || user?.role === 'management';

  // Get team members from API
  const { users: teamMembers, loading: teamLoading, error: teamError } = useUsers();

  // Get time entries from API
  const { entries: timeEntries, loading: entriesLoading, error: entriesError } = useTimeEntries();

  // Calculate task hours
  React.useEffect(() => {
    if (!timeEntries) return;
    
    const hours = timeEntries.reduce((acc, entry) => {
      if (entry.task_id) {
        acc[entry.task_id] = (acc[entry.task_id] || 0) + entry.hours;
      }
      return acc;
    }, {} as Record<string, number>);
    
    setTaskHours(hours);
  }, [timeEntries]);

  const getHoursVariance = (task: Task) => {
    const actualHours = taskHours[task.id] || 0;
    const variance = actualHours - task.estimated_hours;
    return {
      actual: actualHours,
      variance,
      isOvertime: variance > 0
    };
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  };

  const handleAssignUser = async (taskId: string, userId: string) => {
    if (!canEdit) return;

    try {
      setLoading(true);
      await onTaskUpdate(taskId, tasks.find(t => t.id === taskId)?.status || 'not_started');
    } catch (err) {
      console.error('Error assigning user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (teamLoading || entriesLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  if (teamError || entriesError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {teamError || entriesError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
        <Clock className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No tasks found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new task
        </p>
      </div>
    );
  }

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
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
            {tasks.map((task) => {
              const assignedUser = teamMembers?.find(user => user.id === task.assigned_to);
              const { actual, variance, isOvertime } = getHoursVariance(task);
              
              return (
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
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {canEdit ? (
                        <select
                          value={task.assigned_to || ''}
                          onChange={(e) => handleAssignUser(task.id, e.target.value)}
                          disabled={loading}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                        >
                          <option value="">Unassigned</option>
                          {teamMembers?.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.full_name} ({user.department})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {assignedUser ? assignedUser.full_name : 'Unassigned'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {canEdit ? (
                      <select
                        value={task.status}
                        onChange={(e) => onTaskUpdate(task.id, e.target.value as Task['status'])}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${getStatusColor(task.status)}`} />
                        <span className="text-sm capitalize">{task.status.replace('_', ' ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {actual} / {task.estimated_hours}h
                        </span>
                      </div>
                      {variance !== 0 && (
                        <div className={`text-xs ${isOvertime ? 'text-red-500' : 'text-green-500'}`}>
                          {isOvertime ? '+' : ''}{variance}h {isOvertime ? 'over' : 'under'} estimate
                        </div>
                      )}
                      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-dark-700">
                        <div
                          className={`h-1.5 rounded-full ${
                            isOvertime ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((actual / task.estimated_hours) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEdit(task)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-dark-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}