import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TimeEntry } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

interface TimeEntriesFilter {
  startDate: string;
  endDate: string;
  projectId?: string;
}

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeEntriesFilter>({
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: endOfMonth(new Date()).toISOString().split('T')[0],
  });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          project:projects(name),
          task:tasks(name)
        `)
        .eq('user_id', user.id)
        .gte('date', filter.startDate)
        .lte('date', filter.endDate)
        .order('date', { ascending: false });

      if (filter.projectId) {
        query = query.eq('project_id', filter.projectId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      setError('Failed to load time entries');
      console.error('Error loading time entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const deleteEntry = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchEntries();
    } catch (err) {
      setError('Failed to delete time entry');
      console.error('Error deleting time entry:', err);
    }
  };

  return {
    entries,
    loading,
    error,
    filter,
    setFilter,
    deleteEntry,
    refresh: fetchEntries,
  };
}