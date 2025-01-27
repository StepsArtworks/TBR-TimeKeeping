import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';

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
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        // Fetch project metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('project_metrics')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (metricsError) throw metricsError;

        // Fetch time entries for the last 14 days
        const startDate = format(subDays(new Date(), 13), 'yyyy-MM-dd');
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('date, hours, is_billable')
          .eq('project_id', projectId)
          .gte('date', startDate)
          .order('date');

        if (timeError) throw timeError;

        // Process time data
        const timeByDate = new Map<string, { total: number; billable: number }>();
        for (let i = 13; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'MMM d');
          timeByDate.set(date, { total: 0, billable: 0 });
        }

        timeEntries?.forEach((entry) => {
          const date = format(new Date(entry.date), 'MMM d');
          const current = timeByDate.get(date) || { total: 0, billable: 0 };
          timeByDate.set(date, {
            total: current.total + entry.hours,
            billable: current.billable + (entry.is_billable ? entry.hours : 0),
          });
        });

        // Fetch task status changes
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('status, created_at, updated_at')
          .eq('project_id', projectId)
          .order('created_at');

        if (taskError) throw taskError;

        // Process task data
        const tasksByDate = new Map<string, { completed: number; inProgress: number }>();
        for (let i = 13; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'MMM d');
          tasksByDate.set(date, { completed: 0, inProgress: 0 });
        }

        taskData?.forEach((task) => {
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

        setMetrics(metricsData);
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
      } catch (err) {
        setError('Failed to load project analytics');
        console.error('Error loading project analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchAnalytics();
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