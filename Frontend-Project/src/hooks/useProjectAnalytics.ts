import { useState, useEffect } from 'react';
import { getProjectAnalytics } from '../lib/api';

export function useProjectAnalytics(projectId: string) {
  const [metrics, setMetrics] = useState({
    total_hours: 0,
    billable_hours: 0,
    completion_percentage: 0,
    task_completion_rate: 0,
  });
  const [timeData, setTimeData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getProjectAnalytics(projectId);
        setMetrics(data.metrics);
        setTimeData(data.timeData);
        setTaskData(data.taskData);
        setError(null);
      } catch (err) {
        console.error('Error loading project analytics:', err);
        setError('Failed to load project analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [projectId]);

  return {
    metrics,
    timeData,
    taskData,
    loading,
    error,
  };
}