import { useState, useEffect } from 'react';
import { TimeEntry, Project } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getTimeEntries, getProjects, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '../lib/api';
import { startOfMonth, endOfMonth } from 'date-fns';

interface TimeEntriesFilter {
  startDate: string;
  endDate: string;
  projectId?: string;
}

export function useTimeEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeEntriesFilter>({
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: endOfMonth(new Date()).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, [user, filter]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        getTimeEntries(),
        getProjects()
      ]);

      // Filter entries based on date range and project
      let filteredEntries = entriesData.filter(entry => 
        entry.date >= filter.startDate && 
        entry.date <= filter.endDate
      );

      if (filter.projectId) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.project_id === filter.projectId
        );
      }

      // Sort entries by date (newest first)
      filteredEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEntries(filteredEntries);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error('Error loading time entries:', err);
      setError('Failed to load time entries');
      setEntries([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (data: any) => {
    try {
      const newEntry = await createTimeEntry({
        user_id: user!.id,
        project_id: data.projectId,
        task_id: data.taskId,
        date: data.date,
        hours: data.hours,
        description: data.description,
        is_billable: data.isBillable,
      });

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      console.error('Error creating time entry:', err);
      throw err;
    }
  };

  const updateEntry = async (id: string, data: any) => {
    try {
      const updatedEntry = await updateTimeEntry(id, {
        project_id: data.projectId,
        task_id: data.taskId,
        date: data.date,
        hours: data.hours,
        description: data.description,
        is_billable: data.isBillable,
      });

      setEntries(prev =>
        prev.map(entry =>
          entry.id === id ? updatedEntry : entry
        )
      );
      return updatedEntry;
    } catch (err) {
      console.error('Error updating time entry:', err);
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting time entry:', err);
      throw err;
    }
  };

  return {
    entries,
    projects,
    loading,
    error,
    filter,
    setFilter,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}