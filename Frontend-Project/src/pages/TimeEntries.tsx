import React, { useState } from 'react';
import { TimeEntryForm } from '../components/time-entries/TimeEntryForm';
import { TimeEntriesList } from '../components/time-entries/TimeEntriesList';
import { TimeEntriesFilter } from '../components/time-entries/TimeEntriesFilter';
import { TimeEntriesSummary } from '../components/time-entries/TimeEntriesSummary';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { db } from '../lib/db';
import { Project, TimeEntry } from '../types';

export function TimeEntries() {
  const {
    entries,
    loading,
    error,
    filter,
    setFilter,
    deleteEntry,
  } = useTimeEntries();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Use live query for projects
  const projects = useLiveQuery(
    () => db.projects.orderBy('name').toArray(),
    []
  );

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!projects) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

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