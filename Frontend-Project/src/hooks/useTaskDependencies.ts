import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Task } from '../types';

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

  const fetchDependencies = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      // Get all task dependencies for this task
      const deps = await db.taskDependencies
        .where('task_id')
        .equals(taskId)
        .toArray();

      // Get the dependent tasks details
      const dependentTasks = await db.tasks
        .where('id')
        .anyOf(deps.map(d => d.depends_on_task_id))
        .toArray();

      // Combine the data
      const dependenciesWithTasks = deps.map(dep => ({
        id: dep.id,
        task_id: dep.task_id,
        depends_on_task_id: dep.depends_on_task_id,
        depends_on_task: {
          name: dependentTasks.find(t => t.id === dep.depends_on_task_id)?.name || 'Unknown Task',
          status: dependentTasks.find(t => t.id === dep.depends_on_task_id)?.status || 'unknown'
        }
      }));

      setDependencies(dependenciesWithTasks);
    } catch (err) {
      console.error('Error loading task dependencies:', err);
      setError('Failed to load task dependencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [taskId]);

  const addDependency = async (dependsOnTaskId: string) => {
    try {
      // Check if dependency already exists
      const existing = await db.taskDependencies
        .where(['task_id', 'depends_on_task_id'])
        .equals([taskId, dependsOnTaskId])
        .first();

      if (existing) {
        throw new Error('Dependency already exists');
      }

      // Check for circular dependencies
      const checkCircular = async (currentTaskId: string, path = new Set<string>()): Promise<boolean> => {
        if (path.has(currentTaskId)) return true;
        path.add(currentTaskId);

        const deps = await db.taskDependencies
          .where('task_id')
          .equals(currentTaskId)
          .toArray();

        for (const dep of deps) {
          if (await checkCircular(dep.depends_on_task_id, new Set(path))) {
            return true;
          }
        }

        return false;
      };

      // Check if adding this dependency would create a circular reference
      if (await checkCircular(dependsOnTaskId, new Set([taskId]))) {
        throw new Error('Cannot add dependency: would create circular reference');
      }

      // Add the new dependency
      await db.taskDependencies.add({
        id: crypto.randomUUID(),
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      await fetchDependencies();
    } catch (err) {
      console.error('Error adding dependency:', err);
      throw err;
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      await db.taskDependencies.delete(dependencyId);
      await fetchDependencies();
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