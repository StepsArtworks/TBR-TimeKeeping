import React, { useState, useEffect } from 'react';
import { Clock, Calendar, FileText, DollarSign } from 'lucide-react';
import { db } from '../../lib/db';
import { Project, Task, TimeEntry } from '../../types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../components/AuthProvider'; // Fixed import path

interface TimeEntryFormProps {
  onSubmit: () => void;
  entry?: TimeEntry | null;
  className?: string;
}

export function TimeEntryForm({ onSubmit, entry, className }: TimeEntryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    taskId: '',
    startTime: '08:00', // Updated default start time
    endTime: '17:00', // Updated default end time
    description: '',
    isBillable: true,
  });

  // Get tasks assigned to the user
  const tasks = useLiveQuery(async () => {
    if (!user) return [];

    try {
      let query = db.tasks
        .where('assigned_to')
        .equals(user.id)
        .filter(task => task.status !== 'completed');

      const tasks = await query.toArray();

      // Get the projects for these tasks
      const projectIds = [...new Set(tasks.map(task => task.project_id))];
      const projects = await db.projects
        .where('id')
        .anyOf(projectIds)
        .toArray();

      // Combine task and project data
      return tasks.map(task => ({
        ...task,
        project: projects.find(p => p.id === task.project_id)
      }));
    } catch (err) {
      console.error('Error loading tasks:', err);
      return [];
    }
  }, [user]);

  // Get selected task's project
  const selectedTask = tasks?.find(t => t.id === formData.taskId);

  useEffect(() => {
    if (entry) {
      // Convert hours to time range (assuming 8 AM start by default)
      const startTime = '08:00';
      const [hours, minutes] = entry.hours.toString().split('.');
      const endHours = parseInt(hours) + 8;
      const endMinutes = minutes ? Math.round(parseFloat(`0.${minutes}`) * 60) : 0;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      setFormData({
        date: entry.date,
        taskId: entry.task_id || '',
        startTime,
        endTime,
        description: entry.description,
        isBillable: entry.is_billable,
      });
    }
  }, [entry]);

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    let diffMinutes = endMinutes - startMinutes;

    // Subtract lunch hour if work spans across lunch time
    if (startHour < 12 && endHour > 13) {
      diffMinutes -= 60; // Subtract 1 hour for lunch
    }

    return Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTask) return;

    // Validate time range
    const hours = calculateHours(formData.startTime, formData.endTime);
    if (hours <= 0) {
      setError('End time must be after start time');
      return;
    }

    if (hours > 8) {
      setError('Maximum working hours per day is 8 hours');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const timeEntry = {
        id: entry?.id || crypto.randomUUID(),
        user_id: user.id,
        project_id: selectedTask.project_id,
        task_id: formData.taskId,
        date: formData.date,
        hours,
        description: formData.description,
        is_billable: formData.isBillable,
        created_at: entry?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.transaction('rw', [db.timeEntries, db.tasks], async () => {
        if (entry) {
          await db.timeEntries.update(entry.id, timeEntry);
        } else {
          await db.timeEntries.add(timeEntry);

          // Update task status if it's not started
          const task = await db.tasks.get(formData.taskId);
          if (task && task.status === 'not_started') {
            await db.tasks.update(formData.taskId, {
              status: 'in_progress',
              updated_at: new Date().toISOString()
            });
          }
        }
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        taskId: '',
        startTime: '08:00',
        endTime: '17:00',
        description: '',
        isBillable: true,
      });

      onSubmit();
    } catch (err) {
      console.error('Error saving time entry:', err);
      setError('Failed to save time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tasks) {
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

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid gap-6 md:grid-cols-3">
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
            htmlFor="startTime"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Start Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="time"
              id="startTime"
              required
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            End Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="time"
              id="endTime"
              required
              value={formData.endTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endTime: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="task"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Task
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              id="task"
              required
              value={formData.taskId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, taskId: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.project?.name} - {task.name}
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

      <div className="flex items-center justify-between">
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

        {formData.startTime && formData.endTime && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Hours: {calculateHours(formData.startTime, formData.endTime)}
            {formData.startTime < '12:00' && formData.endTime > '13:00' && (
              <span className="ml-2 text-xs text-gray-500">(Lunch break deducted)</span>
            )}
          </div>
        )}
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
                taskId: '',
                startTime: '08:00',
                endTime: '17:00',
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