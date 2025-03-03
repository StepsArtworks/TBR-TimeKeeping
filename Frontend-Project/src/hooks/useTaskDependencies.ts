import { useState, useEffect } from 'react';
import { useTaskDependencies as useTaskDependenciesApi } from '../lib/api';

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  depends_on_task: {
    name: string;
    status: string;
  };
}

export function useTaskDependencies(taskId: string) {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get dependencies from API
  const {
    dependencies: apiDependencies,
    loading: apiLoading,
    error: apiError,
    addDependency: apiAddDependency,
    removeDependency: apiRemoveDependency,
  } = useTaskDependenciesApi(taskId);

  useEffect(() => {
    if (apiLoading) {
      setLoading(true);
      return;
    }

    if (apiError) {
      setError(apiError);
      setLoading(false);
      return;
    }

    setDependencies(apiDependencies);
    setLoading(false);
    setError(null);
  }, [apiDependencies, apiLoading, apiError]);

  const addDependency = async (dependsOnTaskId: string) => {
    try {
      await apiAddDependency(dependsOnTaskId);
      // The API hook will refresh the data
    } catch (err) {
      console.error('Error adding dependency:', err);
      throw err;
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      await apiRemoveDependency(dependencyId);
      // The API hook will refresh the data
    } catch (err) {
      console.error('Error removing dependency:', err);
      throw err;
    }
  };

  return {
    dependencies,
    loading,
    error,
    addDependency,
    removeDependency,
  };
}