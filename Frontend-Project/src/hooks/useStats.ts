import { useState, useEffect } from 'react';
import { 
  getTimeEntries, 
  getTasks, 
  getProjects, 
  getLeaveRequests 
} from '../lib/api';
import { useAuth } from '../components/AuthProvider';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  differenceInBusinessDays,
  addDays,
  isAfter,
  isBefore
} from 'date-fns';

const HOURS_PER_DAY = 8;

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch all required data
      const [timeEntries, tasks, projects, leaveRequests] = await Promise.all([
        getTimeEntries(),
        getTasks(),
        getProjects(),
        getLeaveRequests()
      ]);

      // Calculate weekly and monthly hours
      const weeklyHours = timeEntries
        .filter(entry => 
          entry.date >= weekStart.toISOString().split('T')[0] && 
          entry.date <= weekEnd.toISOString().split('T')[0]
        )
        .reduce((sum, entry) => sum + entry.hours, 0);

      const monthlyHours = timeEntries
        .filter(entry => 
          entry.date >= monthStart.toISOString().split('T')[0] && 
          entry.date <= monthEnd.toISOString().split('T')[0]
        )
        .reduce((sum, entry) => sum + entry.hours, 0);

      // Calculate expected hours
      const businessDaysThisWeek = 5; // Monday to Friday
      const businessDaysThisMonth = differenceInBusinessDays(monthEnd, monthStart) + 1;
      const expectedWeeklyHours = businessDaysThisWeek * HOURS_PER_DAY;
      const expectedMonthlyHours = businessDaysThisMonth * HOURS_PER_DAY;

      // Get upcoming deadlines
      const upcomingDeadlines = tasks
        .filter(task => 
          task.assigned_to === user.id &&
          task.status !== 'completed' &&
          task.due_date &&
          isAfter(new Date(task.due_date), now) &&
          isBefore(new Date(task.due_date), addDays(now, 14))
        )
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);

      // Get completed projects
      const completedProjects = projects
        .filter(project => project.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map(project => {
          const projectTasks = tasks.filter(task => task.project_id === project.id);
          return {
            ...project,
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(task => task.status === 'completed').length,
            completedAt: project.updated_at
          };
        });

      // Calculate project progress
      const projectProgress = projects
        .filter(project => project.status === 'in_progress')
        .map(project => {
          const projectTasks = tasks.filter(task => task.project_id === project.id);
          const totalTasks = projectTasks.length;
          const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
          const inProgressTasks = projectTasks.filter(task => task.status === 'in_progress').length;
          const blockedTasks = projectTasks.filter(task => task.status === 'blocked').length;

          const projectTimeEntries = timeEntries.filter(entry => entry.project_id === project.id);
          const spent = projectTimeEntries
            .filter(entry => entry.is_billable)
            .reduce((sum, entry) => sum + entry.hours * 1000, 0);

          return {
            projectId: project.id,
            projectName: project.name,
            totalTasks,
            completedTasks,
            inProgressTasks,
            blockedTasks,
            progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            status: project.status,
            budget: project.budget,
            spent,
          };
        });

      // Calculate time distribution
      const weekDays = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const timeDistribution = weekDays.map(date => {
        const dayEntries = timeEntries.filter(entry => entry.date === date);
        const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const billableHours = dayEntries
          .filter(entry => entry.is_billable)
          .reduce((sum, entry) => sum + entry.hours, 0);

        return {
          date,
          hours: Math.min(totalHours, HOURS_PER_DAY),
          billableHours: Math.min(billableHours, HOURS_PER_DAY),
          expected: HOURS_PER_DAY,
        };
      });

      // Calculate project distribution
      const projectHours = new Map();
      timeEntries.forEach(entry => {
        if (entry.project_id) {
          const current = projectHours.get(entry.project_id) || 0;
          projectHours.set(entry.project_id, current + entry.hours);
        }
      });

      const projectDistribution = Array.from(projectHours.entries())
        .map(([projectId, hours]) => ({
          name: projects.find(p => p.id === projectId)?.name || 'Unknown Project',
          hours,
          percentage: monthlyHours > 0 ? (hours / monthlyHours) * 100 : 0,
        }))
        .sort((a, b) => b.hours - a.hours);

      setStats({
        weeklyHours,
        expectedWeeklyHours,
        monthlyHours,
        expectedMonthlyHours,
        upcomingDeadlines,
        completedProjects,
        projectProgress,
        timeDistribution,
        projectDistribution,
        leaveBalances: {
          vacation: user.vacation_balance,
          sick: user.sick_balance,
          personal: user.personal_balance,
        },
      });
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return {
    ...stats,
    loading,
    error,
  };
}