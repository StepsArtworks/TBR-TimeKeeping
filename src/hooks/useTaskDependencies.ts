import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          task_id,
          depends_on_task_id,
          depends_on_task:tasks(name, status)
        `)
        .eq('task_id', taskId);

      if (fetchError) throw fetchError;
      setDependencies(data || []);
    } catch (err) {
      setError('Failed to load task dependencies');
      console.error('Error loading task dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchDependencies();
    }
  }, [taskId]);

  const addDependency = async (dependsOnTaskId: string) => {
    try {
      const { error } = await supabase.from('task_dependencies').insert([
        {
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
        },
      ]);

      if (error) throw error;
      await fetchDependencies();
    } catch (err) {
      console.error('Error adding dependency:', err);
      throw err;
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;
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