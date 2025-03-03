import { useState, useEffect } from 'react';
import { Project } from '../types';
import { useAuth } from '../components/AuthProvider';
import { useProjects as useProjectsApi } from '../lib/api';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { projects: apiProjects, loading: apiLoading, error: apiError } = useProjectsApi();

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

    try {
      // Apply filters
      let filteredProjects = [...apiProjects];

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        );
      }

      if (filter.status) {
        filteredProjects = filteredProjects.filter(project => project.status === filter.status);
      }

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

      // Filter based on user role
      if (user?.role === 'lead') {
        filteredProjects = filteredProjects.filter(project => {
          // For leads, show projects in their department
          return user.department === 'Engineering';
        });
      } else if (user?.role === 'user') {
        // For regular users, only show projects they're assigned to
        // This filtering is already done on the server side
      }

      // Apply sorting
      filteredProjects.sort((a, b) => {
        if (filter.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          const aDate = a.end_date || '9999-12-31';
          const bDate = b.end_date || '9999-12-31';
          return aDate.localeCompare(bDate);
        }
      });

      setProjects(filteredProjects);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error filtering projects:', err);
      setError('Failed to process projects');
      setLoading(false);
    }
  }, [apiProjects, apiLoading, apiError, filter, user]);

  const refresh = () => {
    setLoading(true);
    // The API hook will handle the refresh
  };

  return {
    projects,
    loading,
    error,
    filter,
    setFilter,
    refresh,
  };
}