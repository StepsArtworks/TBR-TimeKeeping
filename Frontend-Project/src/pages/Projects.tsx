import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { ProjectForm } from '../components/projects/ProjectForm';
import { useAuth } from '../components/AuthProvider';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import { deleteProject } from '../lib/api';

export function Projects() {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { projects, loading, error, filter, setFilter, refresh } = useProjects();

  // Check if user can add projects (management or lead)
  const canAddProjects = user?.role === 'management' || user?.role === 'lead';

  const handleProjectSave = () => {
    setShowForm(false);
    setEditingProject(null);
    refresh(); // Refresh the projects list
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject(projectId);
      refresh(); // Refresh the projects list after deletion
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your projects and track their progress
          </p>
        </div>
        {canAddProjects && (
          <button
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <ProjectForm
            project={editingProject}
            onSubmit={handleProjectSave}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button
            onClick={() =>
              setFilter({
                ...filter,
                sortBy: filter.sortBy === 'name' ? 'deadline' : 'name',
              })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700"
          >
            <ArrowUpDown className="h-5 w-5" />
            {filter.sortBy === 'name' ? 'Sort by Deadline' : 'Sort by Name'}
          </button>
        </div>
      </div>

      {showFilters && (
        <ProjectFilters
          filter={filter}
          onChange={setFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      <ProjectList
        projects={projects || []}
        loading={loading}
        error={error}
        canEdit={canAddProjects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}