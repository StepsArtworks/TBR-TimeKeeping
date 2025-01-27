import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TimeEntry, Project, Task } from '../types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

interface Stats {
  weeklyHours: number;
  monthlyHours: number;
  pendingApprovals: number;
  upcomingDeadlines: Task[];
  leaveBalances: {
    vacation: number;
    sick: number;
    personal: number;
  };
  projectBudgets: {
    projectId: string;
    projectName: string;
    budget: number;
    spent: number;
    percentage: number;
  }[];
  timeDistribution: {
    date: string;
    hours: number;
    billableHours: number;
  }[];
  projectDistribution: {
    name: string;
    hours: number;
    percentage: number;
  }[];
  loading: boolean;
  error: string | null;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    weeklyHours: 0,
    monthlyHours: 0,
    pendingApprovals: 0,
    upcomingDeadlines: [],
    leaveBalances: {
      vacation: 0,
      sick: 0,
      personal: 0,
    },
    projectBudgets: [],
    timeDistribution: [],
    projectDistribution: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error('Not authenticated');

        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Fetch weekly hours
        const { data: weeklyEntries } = await supabase
          .from('time_entries')
          .select('hours, date, is_billable, project_id')
          .eq('user_id', user.id)
          .gte('date', weekStart.toISOString())
          .lte('date', weekEnd.toISOString());

        // Fetch monthly hours
        const { data: monthlyEntries } = await supabase
          .from('time_entries')
          .select('hours, date, is_billable, project_id')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString())
          .lte('date', monthEnd.toISOString());

        // Fetch pending approvals
        const { data: pendingEntries } = await supabase
          .from('time_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_approved', false);

        // Fetch upcoming deadlines
        const { data: upcomingTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user.id)
          .neq('status', 'completed')
          .order('due_date', { ascending: true })
          .limit(5);

        // Fetch user leave balances
        const { data: userData } = await supabase
          .from('users')
          .select('vacation_balance, sick_balance, personal_balance')
          .eq('id', user.id)
          .single();

        // Fetch project budgets (for management only)
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, budget, budget_spent')
          .eq('status', 'in_progress')
          .order('budget_spent', { ascending: false });

        // Calculate time distribution
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const timeDistribution = weekDays.map(date => {
          const dayEntries = weeklyEntries?.filter(
            entry => entry.date === format(date, 'yyyy-MM-dd')
          ) || [];
          
          return {
            date: format(date, 'EEE'),
            hours: dayEntries.reduce((sum, entry) => sum + entry.hours, 0),
            billableHours: dayEntries
              .filter(entry => entry.is_billable)
              .reduce((sum, entry) => sum + entry.hours, 0),
          };
        });

        // Calculate project distribution
        const projectHours = new Map<string, number>();
        const totalHours = monthlyEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0;

        monthlyEntries?.forEach(entry => {
          const current = projectHours.get(entry.project_id) || 0;
          projectHours.set(entry.project_id, current + entry.hours);
        });

        const projectDistribution = Array.from(projectHours.entries())
          .map(([projectId, hours]) => ({
            name: projects?.find(p => p.id === projectId)?.name || 'Unknown Project',
            hours,
            percentage: (hours / totalHours) * 100,
          }))
          .sort((a, b) => b.hours - a.hours);

        setStats({
          weeklyHours: weeklyEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0,
          monthlyHours: monthlyEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0,
          pendingApprovals: pendingEntries?.length || 0,
          upcomingDeadlines: upcomingTasks || [],
          leaveBalances: {
            vacation: userData?.vacation_balance || 0,
            sick: userData?.sick_balance || 0,
            personal: userData?.personal_balance || 0,
          },
          projectBudgets: projects?.map(project => ({
            projectId: project.id,
            projectName: project.name,
            budget: project.budget,
            spent: project.budget_spent,
            percentage: (project.budget_spent / project.budget) * 100,
          })) || [],
          timeDistribution,
          projectDistribution,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard stats',
        }));
      }
    }

    fetchStats();
  }, []);

  return stats;
}