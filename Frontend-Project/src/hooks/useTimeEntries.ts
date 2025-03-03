import { useState } from 'react';
import { TimeEntry } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/db';

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

  // Use live query for time entries with filtering
  const entries = useLiveQuery(
    async () => {
      if (!user) return [];

      try {
        let query = db.timeEntries
          .where('user_id')
          .equals(user.id)
          .filter(entry =>
            entry.date >= filter.startDate &&
            entry.date <= filter.endDate
          );

        if (filter.projectId) {
          query = query.filter(entry => entry.project_id === filter.projectId);
        }

        const entries = await query.toArray();

        // Get projects and tasks for the entries
        const projectIds = new Set(entries.map(e => e.project_id));
        const taskIds = new Set(entries.map(e => e.task_id).filter(Boolean));

        const [projects, tasks] = await Promise.all([
          db.projects.where('id').anyOf([...projectIds]).toArray(),
          db.tasks.where('id').anyOf([...taskIds]).toArray()
        ]);

        // Enrich entries with project and task data
        return entries.map(entry => ({
          ...entry,
          project: projects.find(p => p.id === entry.project_id),
          task: tasks.find(t => t.id === entry.task_id)
        })).sort((a, b) => b.date.localeCompare(a.date));

      } catch (err) {
        console.error('Error loading time entries:', err);
        return [];
      }
    },
    [filter, user]
  );

  const deleteEntry = async (id: string) => {
    try {
      await db.timeEntries.delete(id);
    } catch (err) {
      console.error('Error deleting time entry:', err);
      throw err;
    }
  };

  return {
    entries: entries || [],
    loading: !entries,
    error: null,
    filter,
    setFilter,
    deleteEntry,
  };
}