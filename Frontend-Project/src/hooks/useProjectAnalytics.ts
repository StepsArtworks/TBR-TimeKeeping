import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { tasks, timeEntries } from '../lib/mockData';

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
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    total_hours: 0,
    billable_hours: 0,
    completion_percentage: 0,
    task_completion_rate: 0,
  });
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [taskData, setTaskData] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate project metrics
      const projectTimeEntries = timeEntries.filter(entry => entry.project_id === projectId);
      const projectTasks = tasks.filter(task => task.project_id === projectId);

      const totalHours = projectTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = projectTimeEntries
        .filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + entry.hours, 0);

      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const completionPercentage = (completedTasks / (projectTasks.length || 1)) * 100;

      // Calculate task completion rate (tasks completed per day)
      const taskCompletionRate = completedTasks / 30; // Assuming 30 days

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
        const date = format(new Date(task.start_date), 'MMM d');
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

      setMetrics({
        total_hours: totalHours,
        billable_hours: billableHours,
        completion_percentage: completionPercentage,
        task_completion_rate: taskCompletionRate,
      });

      setTimeData(
        Array.from(timeByDate.entries()).map(([date, hours]) => ({
          date,
          hours: hours.total,
          billableHours: hours.billable,
        }))
      );

      setTaskData(
        Array.from(tasksByDate.entries()).map(([date, counts]) => ({
          date,
          completed: counts.completed,
          inProgress: counts.inProgress,
        }))
      );

      setError(null);
    } catch (err) {
      setError('Failed to load project analytics');
      console.error('Error loading project analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    metrics,
    timeData,
    taskData,
    loading,
    error,
  };
}