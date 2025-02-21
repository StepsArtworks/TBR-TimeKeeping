import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { ProjectForm } from '../components/projects/ProjectForm';
import { useAuth } from '../components/AuthProvider';
import { Project } from '../types';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function Projects() {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState({
    search: '',
    status: undefined as Project['status'] | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    sortBy: 'name' as 'name' | 'deadline',
  });

  // Check if user can add projects (management or lead)
  const canAddProjects = user?.role === 'management' || user?.role === 'lead';

  // Use live query for projects with filtering
  const projects = useLiveQuery(
    async () => {
      if (!user) return [];

      try {
        // Get all projects and tasks in one go to minimize database calls
        const [allProjects, allTasks] = await Promise.all([
          db.projects.toArray(),
          db.tasks.toArray(),
        ]);

        // Filter projects based on user role and assignments
        let filteredProjects = allProjects;

        if (user.role === 'user') {
          // Users can see projects where:
          // 1. They are assigned to any task in the project
          const userProjectIds = new Set(
            allTasks
              .filter(task => task.assigned_to === user.id)
              .map(task => task.project_id)
          );

          filteredProjects = allProjects.filter(project => 
            userProjectIds.has(project.id)
          );
        } else if (user.role === 'lead') {
          // Leads can see all projects in their department
          filteredProjects = allProjects.filter(project => {
            const projectTasks = allTasks.filter(task => task.project_id === project.id);
            return projectTasks.some(() => user.department === 'Engineering');
          });
        }
        // Management can see all projects

        // Apply search filter
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredProjects = filteredProjects.filter(project =>
            project.name.toLowerCase().includes(searchLower) ||
            project.description.toLowerCase().includes(searchLower)
          );
        }

        // Apply status filter
        if (filter.status) {
          filteredProjects = filteredProjects.filter(project => 
            project.status === filter.status
          );
        }

        // Apply date filters
        if (filter.startDate) {
          filteredProjects = filteredProjects.filter(project => 
            project.start_date >= filter.startDate
          );
        }

        if (filter.endDate) {
          filteredProjects = filteredProjects.filter(project =>
            project.end_date ? project.end_date <= filter.endDate : true
          );
        }

        // Apply sorting
        return filteredProjects.sort((a, b) => {
          if (filter.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else {
            const aDate = a.end_date || '9999-12-31';
            const bDate = b.end_date || '9999-12-31';
            return aDate.localeCompare(bDate);
          }
        });
      } catch (err) {
        console.error('Error loading projects:', err);
        return [];
      }
    },
    [filter, user]
  );

  const handleProjectSave = () => {
    setShowForm(false);
    setEditingProject(null);
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
      // Start a transaction to ensure all related data is deleted
      await db.transaction('rw', [db.projects, db.tasks, db.timeEntries], async () => {
        // Delete all related tasks first
        await db.tasks.where('project_id').equals(projectId).delete();

        // Delete all related time entries
        await db.timeEntries.where('project_id').equals(projectId).delete();

        // Finally delete the project
        await db.projects.delete(projectId);
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (!projects) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

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
        projects={projects}
        loading={false}
        error={null}
        canEdit={canAddProjects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}