import { useState } from 'react';
import { Project } from '../types';
import { db } from '../lib/db';
import { useAuth } from '../components/AuthProvider';
import { useLiveQuery } from 'dexie-react-hooks';

export interface ProjectFilter {
  search: string;
  status?: Project['status'];
  startDate?: string;
  endDate?: string;
  sortBy: 'name' | 'deadline';
}

export function useProjects() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ProjectFilter>({
    search: '',
    sortBy: 'name',
  });

  // Use Dexie's live query to automatically update when data changes
  const projects = useLiveQuery(async () => {
    if (!user) return [];

    try {
      // Get all projects first
      let projects = await db.projects.toArray();

      // Apply filters
      if (filter.search) {
        projects = projects.filter(project =>
          project.name.toLowerCase().includes(filter.search.toLowerCase())
        );
      }

      if (filter.status) {
        projects = projects.filter(project => project.status === filter.status);
      }

      if (filter.startDate) {
        projects = projects.filter(project => project.start_date >= filter.startDate);
      }

      if (filter.endDate) {
        projects = projects.filter(project =>
          project.end_date ? project.end_date <= filter.endDate : true
        );
      }

      // Filter based on user role
      if (user.role === 'lead') {
        const tasks = await db.tasks.toArray();
        projects = projects.filter(project => {
          const projectTasks = tasks.filter(task => task.project_id === project.id);
          return projectTasks.some(() => user.department === 'Engineering');
        });
      } else if (user.role === 'user') {
        const tasks = await db.tasks.toArray();
        projects = projects.filter(project => {
          const projectTasks = tasks.filter(task => task.project_id === project.id);
          return projectTasks.some(task => task.assigned_to === user.id);
        });
      }

      // Apply sorting
      return projects.sort((a, b) => {
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
  }, [filter, user]);

  return {
    projects: projects || [],
    loading: !projects,
    error: null,
    filter,
    setFilter,
    refresh: () => {}, // No longer needed as Dexie handles live updates
  };
}