import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Briefcase, FileText, Link2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Project, Task } from '../../types';
import { TaskDependencies } from './TaskDependencies';
import { useTaskDependencies } from '../../hooks/useTaskDependencies';
import { cn } from '../../lib/utils';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    status: task?.status || 'not_started',
    dueDate: task?.due_date?.split('T')[0] || '',
    estimatedHours: task?.estimated_hours?.toString() || '',
    assignedTo: task?.assigned_to || '',
  });

  const {
    dependencies,
    loading: dependenciesLoading,
    error: dependenciesError,
    addDependency,
    removeDependency,
  } = useTaskDependencies(task?.id || '');

  useEffect(() => {
    async function fetchAvailableTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, name')
          .eq('project_id', projectId)
          .neq('id', task?.id);

        if (error) throw error;
        setAvailableTasks(data || []);
      } catch (err) {
        console.error('Error fetching available tasks:', err);
      }
    }

    if (projectId) {
      fetchAvailableTasks();
    }
  }, [projectId, task?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const taskData = {
        project_id: projectId,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        due_date: formData.dueDate || null,
        estimated_hours: formData.estimatedHours
          ? parseFloat(formData.estimatedHours)
          : null,
        assigned_to: formData.assignedTo || null,
      };

      const { error: saveError } = task
        ? await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', task.id)
        : await supabase.from('tasks').insert([taskData]);

      if (saveError) throw saveError;
      onSubmit();
    } catch (err) {
      setError('Failed to save task');
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

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
            availableTasks={availableTasks}
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