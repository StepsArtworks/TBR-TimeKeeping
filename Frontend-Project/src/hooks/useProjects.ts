import { useState, useEffect } from 'react';
import { Project } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getProjects } from '../lib/api';

export interface ProjectFilter {
  search: string;
  status?: Project['status'];
  startDate?: string;
  endDate?: string;
  sortBy: 'name' | 'deadline';
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>({
    search: '',
    sortBy: 'name',
  });

  useEffect(() => {
    fetchProjects();
  }, [user, filter]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let data = await getProjects();

      // Apply filters
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        data = data.filter(project =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        );
      }

      if (filter.status) {
        data = data.filter(project => project.status === filter.status);
      }

      if (filter.startDate) {
        data = data.filter(project => project.start_date >= filter.startDate);
      }

      if (filter.endDate) {
        data = data.filter(project =>
          project.end_date ? project.end_date <= filter.endDate : true
        );
      }

      // Apply sorting
      data.sort((a, b) => {
        if (filter.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          const aDate = a.end_date || '9999-12-31';
          const bDate = b.end_date || '9999-12-31';
          return aDate.localeCompare(bDate);
        }
      });

      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    filter,
    setFilter,
    refresh: fetchProjects,
  };
}