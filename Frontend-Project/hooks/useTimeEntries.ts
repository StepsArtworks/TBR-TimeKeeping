import { useState, useEffect } from 'react';
import { TimeEntry } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { useTimeEntries as useTimeEntriesApi, deleteTimeEntry } from '../lib/api';

interface TimeEntriesFilter {
  startDate: string;
  endDate: string;
  projectId?: string;
}

export function useTimeEntries() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<TimeEntriesFilter>({
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: endOfMonth(new Date()).toISOString().split('T')[0],
  });
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { entries: apiEntries, loading: apiLoading, error: apiError } = useTimeEntriesApi(
    filter.startDate,
    filter.endDate,
    filter.projectId
  );

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

    setEntries(apiEntries);
    setLoading(false);
    setError(null);
  }, [apiEntries, apiLoading, apiError]);

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      // Remove the deleted entry from the local state
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting time entry:', err);
      throw err;
    }
  };

  return {
    entries,
    loading,
    error,
    filter,
    setFilter,
    deleteEntry: handleDeleteEntry,
  };
}