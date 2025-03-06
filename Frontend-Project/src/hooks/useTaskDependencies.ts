import { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTasks, createTaskDependency, deleteTaskDependency } from '../lib/api';

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

  useEffect(() => {
    fetchDependencies();
  }, [taskId]);

  const fetchDependencies = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const [deps, tasks] = await Promise.all([
        getTaskDependencies(taskId),
        getTasks()
      ]);

      // Combine dependency and task data
      const dependenciesWithTasks = deps.map(dep => ({
        ...dep,
        depends_on_task: {
          name: tasks.find(t => t.id === dep.depends_on_task_id)?.name || 'Unknown Task',
          status: tasks.find(t => t.id === dep.depends_on_task_id)?.status || 'unknown'
        }
      }));

      setDependencies(dependenciesWithTasks);
      setError(null);
    } catch (err) {
      console.error('Error loading task dependencies:', err);
      setError('Failed to load task dependencies');
      setDependencies([]);
    } finally {
      setLoading(false);
    }
  };

  const addDependency = async (dependsOnTaskId: string) => {
    try {
      const newDependency = await createTaskDependency({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId
      });
      await fetchDependencies(); // Refresh dependencies
    } catch (err) {
      console.error('Error adding dependency:', err);
      throw err;
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      await deleteTaskDependency(dependencyId);
      await fetchDependencies(); // Refresh dependencies
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