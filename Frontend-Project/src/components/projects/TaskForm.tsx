import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Briefcase, FileText, Link2, User as UserIcon } from 'lucide-react';
import { Project, Task } from '../../types';
import { TaskDependencies } from './TaskDependencies';
import { useTaskDependencies } from '../../hooks/useTaskDependencies';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthProvider';
import { useUsers, createTask, updateTask } from '../../lib/api';

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSubmit: () => void;
  onCancel: () => void;
  className?: string;
}

export function TaskForm({
  projectId,
  task,
  onSubmit,
  onCancel,
  className,
}: TaskFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get team members from API
  const { users: teamMembers, loading: teamLoading, error: teamError } = useUsers();

  // Get task dependencies
  const {
    dependencies,
    loading: dependenciesLoading,
    error: dependenciesError,
    addDependency,
    removeDependency,
  } = useTaskDependencies(task?.id || '');

  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    status: task?.status || 'not_started',
    dueDate: task?.due_date?.split('T')[0] || '',
    estimatedHours: task?.estimated_hours?.toString() || '',
    assignedTo: task?.assigned_to || '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        status: task.status,
        dueDate: task.due_date?.split('T')[0] || '',
        estimatedHours: task.estimated_hours?.toString() || '',
        assignedTo: task.assigned_to || '',
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const taskData: Partial<Task> = {
        project_id: projectId,
        name: formData.name,
        description: formData.description,
        status: formData.status as Task['status'],
        due_date: formData.dueDate,
        estimated_hours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
        assigned_to: formData.assignedTo || null,
      };

      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData as Omit<Task, 'id' | 'created_at' | 'updated_at'>);
      }

      onSubmit();
    } catch (err) {
      setError('Failed to save task');
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (teamLoading || dependenciesLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (teamError || dependenciesError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {teamError || dependenciesError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Task Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            placeholder="Enter task name"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            placeholder="Enter task description"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as Task['status'],
              }))
            }
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="assignedTo"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Assigned To
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            >
              <option value="">Unassigned</option>
              {teamMembers?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Due Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="estimatedHours"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Estimated Hours
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              id="estimatedHours"
              min="0"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedHours: e.target.value,
                }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              placeholder="Enter estimated hours"
            />
          </div>
        </div>
      </div>

      {task && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
          <TaskDependencies
            dependencies={dependencies}
            availableTasks={[]}
            onAdd={addDependency}
            onRemove={removeDependency}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:text-gray-300 dark:hover:bg-dark-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            'Save Task'
          )}
        </button>
      </div>
    </form>
  );
}