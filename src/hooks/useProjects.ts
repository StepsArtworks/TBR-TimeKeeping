import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export interface ProjectFilter {
  search: string;
  status?: Project['status'];
  startDate?: string;
  endDate?: string;
  sortBy: 'name' | 'deadline';
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>({
    search: '',
    sortBy: 'name',
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('projects')
          .select('*')
          .eq('is_archived', false);

        if (filter.search) {
          query = query.ilike('name', `%${filter.search}%`);
        }

        if (filter.status) {
          query = query.eq('status', filter.status);
        }

        if (filter.startDate) {
          query = query.gte('start_date', filter.startDate);
        }

        if (filter.endDate) {
          query = query.lte('end_date', filter.endDate);
        }

        if (filter.sortBy === 'name') {
          query = query.order('name');
        } else {
          query = query.order('end_date', { nullsLast: true });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setProjects(data || []);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [filter]);

  return {
    projects,
    loading,
    error,
    filter,
    setFilter,
  };
}