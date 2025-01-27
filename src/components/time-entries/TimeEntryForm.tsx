import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Briefcase, FileText, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Project, Task, TimeEntry } from '../../types';
import { cn } from '../../lib/utils';

interface TimeEntryFormProps {
  onSubmit: () => void;
  entry?: TimeEntry | null;
  className?: string;
}

export function TimeEntryForm({ onSubmit, entry, className }: TimeEntryFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    taskId: '',
    hours: '',
    description: '',
    isBillable: true,
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date,
        projectId: entry.project_id,
        taskId: entry.task_id || '',
        hours: entry.hours.toString(),
        description: entry.description,
        isBillable: entry.is_billable,
      });
    }
  }, [entry]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'in_progress')
          .order('name');

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      if (!formData.projectId) {
        setTasks([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', formData.projectId)
          .neq('status', 'completed')
          .order('name');

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }

    fetchTasks();
  }, [formData.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const timeEntry = {
        user_id: user.id,
        project_id: formData.projectId,
        task_id: formData.taskId || null,
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description,
        is_billable: formData.isBillable,
      };

      const { error: saveError } = entry
        ? await supabase
            .from('time_entries')
            .update(timeEntry)
            .eq('id', entry.id)
        : await supabase.from('time_entries').insert([timeEntry]);

      if (saveError) throw saveError;

      setFormData({
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        taskId: '',
        hours: '',
        description: '',
        isBillable: true,
      });

      onSubmit();
    } catch (error) {
      setError('Failed to save time entry. Please try again.');
      console.error('Error saving time entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              id="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="hours"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Hours
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              id="hours"
              required
              min="0.1"
              step="0.1"
              value={formData.hours}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hours: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              placeholder="Enter hours"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="project"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Project
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              id="project"
              required
              value={formData.projectId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectId: e.target.value,
                  taskId: '',
                }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="task"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Task (Optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              id="task"
              value={formData.taskId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, taskId: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              disabled={!formData.projectId}
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          placeholder="What did you work on?"
        />
      </div>

      <div className="flex items-center">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="billable"
            checked={formData.isBillable}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isBillable: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800"
          />
          <label
            htmlFor="billable"
            className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300"
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Billable
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {entry && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                projectId: '',
                taskId: '',
                hours: '',
                description: '',
                isBillable: true,
              });
              onSubmit();
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:text-gray-300 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
        )}
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
            'Save Time Entry'
          )}
        </button>
      </div>
    </form>
  );
}