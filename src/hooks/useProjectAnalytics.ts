import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface ProjectMetrics {
  total_hours: number;
  billable_hours: number;
  completion_percentage: number;
  task_completion_rate: number;
}

interface TimeData {
  date: string;
  hours: number;
  billableHours: number;
}

interface TaskData {
  date: string;
  completed: number;
  inProgress: number;
}

export function useProjectAnalytics(projectId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use live query for project data
  const data = useLiveQuery(
    async () => {
      if (!projectId) return null;

      try {
        // Get project tasks
        const projectTasks = await db.tasks
          .where('project_id')
          .equals(projectId)
          .toArray();

        // Get project time entries
        const projectTimeEntries = await db.timeEntries
          .where('project_id')
          .equals(projectId)
          .toArray();

        // Calculate metrics
        const totalHours = projectTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const billableHours = projectTimeEntries
          .filter(entry => entry.is_billable)
          .reduce((sum, entry) => sum + entry.hours, 0);

        const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
        const completionPercentage = (completedTasks / (projectTasks.length || 1)) * 100;

        // Calculate task completion rate (tasks completed per day)
        const oldestTask = projectTasks.reduce((oldest, task) => {
          const taskDate = new Date(task.created_at);
          return taskDate < oldest ? taskDate : oldest;
        }, new Date());

        const daysSinceStart = Math.max(
          1,
          Math.ceil((new Date().getTime() - oldestTask.getTime()) / (1000 * 60 * 60 * 24))
        );
        const taskCompletionRate = completedTasks / daysSinceStart;

        // Calculate time distribution for last 14 days
        const timeByDate = new Map<string, { total: number; billable: number }>();
        for (let i = 13; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'MMM d');
          timeByDate.set(date, { total: 0, billable: 0 });
        }

        projectTimeEntries.forEach(entry => {
          const date = format(new Date(entry.date), 'MMM d');
          if (timeByDate.has(date)) {
            const current = timeByDate.get(date)!;
            timeByDate.set(date, {
              total: current.total + entry.hours,
              billable: current.billable + (entry.is_billable ? entry.hours : 0),
            });
          }
        });

        // Calculate task data
        const tasksByDate = new Map<string, { completed: number; inProgress: number }>();
        for (let i = 13; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'MMM d');
          tasksByDate.set(date, { completed: 0, inProgress: 0 });
        }

        projectTasks.forEach(task => {
          const date = format(new Date(task.updated_at), 'MMM d');
          if (tasksByDate.has(date)) {
            const current = tasksByDate.get(date)!;
            if (task.status === 'completed') {
              current.completed++;
            } else if (task.status === 'in_progress') {
              current.inProgress++;
            }
            tasksByDate.set(date, current);
          }
        });

        return {
          metrics: {
            total_hours: totalHours,
            billable_hours: billableHours,
            completion_percentage: completionPercentage,
            task_completion_rate: taskCompletionRate,
          },
          timeData: Array.from(timeByDate.entries()).map(([date, hours]) => ({
            date,
            hours: hours.total,
            billableHours: hours.billable,
          })),
          taskData: Array.from(tasksByDate.entries()).map(([date, counts]) => ({
            date,
            completed: counts.completed,
            inProgress: counts.inProgress,
          })),
        };
      } catch (err) {
        console.error('Error loading project analytics:', err);
        setError('Failed to load project analytics');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return {
    metrics: data?.metrics || {
      total_hours: 0,
      billable_hours: 0,
      completion_percentage: 0,
      task_completion_rate: 0,
    },
    timeData: data?.timeData || [],
    taskData: data?.taskData || [],
    loading: loading && !data,
    error,
  };
}