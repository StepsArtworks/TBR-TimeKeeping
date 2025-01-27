import React, { useState, useEffect } from 'react';
import { TimeEntryForm } from '../components/time-entries/TimeEntryForm';
import { TimeEntriesList } from '../components/time-entries/TimeEntriesList';
import { TimeEntriesFilter } from '../components/time-entries/TimeEntriesFilter';
import { TimeEntriesSummary } from '../components/time-entries/TimeEntriesSummary';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { supabase } from '../lib/supabase';
import { Project, TimeEntry } from '../types';

export function TimeEntries() {
  const {
    entries,
    loading,
    error,
    filter,
    setFilter,
    deleteEntry,
    refresh,
  } = useTimeEntries();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .order('name');
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Time Entries</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Log your time for projects and tasks
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
        <h2 className="mb-6 text-lg font-medium">
          {editingEntry ? 'Edit Time Entry' : 'New Time Entry'}
        </h2>
        <TimeEntryForm
          onSubmit={() => {
            refresh();
            setEditingEntry(null);
          }}
          entry={editingEntry}
        />
      </div>

      <TimeEntriesFilter
        startDate={filter.startDate}
        endDate={filter.endDate}
        projectId={filter.projectId}
        projects={projects}
        onFilterChange={setFilter}
      />

      {!loading && !error && entries.length > 0 && (
        <TimeEntriesSummary entries={entries} />
      )}

      <div className="rounded-lg bg-white shadow-sm dark:bg-dark-800">
        <TimeEntriesList
          entries={entries}
          loading={loading}
          error={error}
          onDelete={deleteEntry}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}