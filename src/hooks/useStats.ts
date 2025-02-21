import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, differenceInBusinessDays, isAfter, isBefore, addDays } from 'date-fns';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const HOURS_PER_DAY = 8;
const HOURS_PER_WEEK = 40; // 5 working days * 8 hours
const WORKING_START_HOUR = 8; // 8 AM
const WORKING_END_HOUR = 17; // 5 PM
const LUNCH_BREAK_START = 12; // 12 PM
const LUNCH_BREAK_END = 13; // 1 PM

export function useStats() {
  const { user } = useAuth();
  const isLeadOrManagement = user?.role === 'lead' || user?.role === 'management';

  // Use live query to get real-time updates
  const stats = useLiveQuery(
    async () => {
      if (!user) return null;

      try {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start week on Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Generate array of weekdays (Monday to Friday only)
        const weekDays = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          return date;
        });

        // Calculate expected hours (excluding weekends)
        const businessDaysThisWeek = weekDays.length;
        const expectedWeeklyHours = businessDaysThisWeek * HOURS_PER_DAY;
        const businessDaysThisMonth = differenceInBusinessDays(monthEnd, monthStart) + 1;
        const expectedMonthlyHours = businessDaysThisMonth * HOURS_PER_DAY;

        // Get user's time entries with error handling
        const timeEntries = await db.timeEntries
          .where('user_id')
          .equals(user.id)
          .toArray()
          .catch(err => {
            console.error('Error fetching time entries:', err);
            return [];
          });

        // Calculate weekly and monthly hours
        const weeklyHours = timeEntries
          .filter(entry => {
            const entryDate = new Date(entry.date);
            return !isNaN(entryDate.getTime()) && // Validate date
              entryDate >= weekStart && 
              entryDate <= weekEnd;
          })
          .reduce((sum, entry) => sum + (entry.hours || 0), 0);

        const monthlyHours = timeEntries
          .filter(entry => {
            const entryDate = new Date(entry.date);
            return !isNaN(entryDate.getTime()) && // Validate date
              entryDate >= monthStart && 
              entryDate <= monthEnd;
          })
          .reduce((sum, entry) => sum + (entry.hours || 0), 0);

        // Get all tasks and projects with error handling
        let userTasks = [];
        let userProjects = [];
        try {
          // For normal users, get only tasks assigned to them
          if (user.role === 'user') {
            userTasks = await db.tasks
              .where('assigned_to')
              .equals(user.id)
              .toArray();
            
            // Get projects for these tasks
            const projectIds = [...new Set(userTasks.map(task => task.project_id))];
            userProjects = await db.projects
              .where('id')
              .anyOf(projectIds)
              .filter(project => project.status === 'in_progress') // Only active projects
              .toArray();
          } else {
            // For leads and management, get all projects
            userProjects = await db.projects.toArray();
            userTasks = await db.tasks.toArray();
          }
        } catch (err) {
          console.error('Error fetching projects and tasks:', err);
          userProjects = [];
          userTasks = [];
        }

        // Get tasks assigned to user that are due soon
        const upcomingDeadlines = await db.tasks
          .where('assigned_to')
          .equals(user.id)
          .filter(task => 
            task.status !== 'completed' &&
            task.due_date && // Has a due date
            isAfter(new Date(task.due_date), now) && // Due date is in the future
            isBefore(new Date(task.due_date), addDays(now, 14)) // Due within next 14 days
          )
          .toArray()
          .catch(err => {
            console.error('Error fetching upcoming deadlines:', err);
            return [];
          });

        // Sort and limit upcoming deadlines
        const sortedDeadlines = upcomingDeadlines
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 5);

        // Get recently completed projects
        const completedProjects = userProjects
          .filter(project => project.status === 'completed')
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
          .map(project => {
            const projectTasks = userTasks.filter(task => task.project_id === project.id);
            return {
              ...project,
              totalTasks: projectTasks.length,
              completedTasks: projectTasks.filter(task => task.status === 'completed').length,
              completedAt: project.updated_at
            };
          });

        // Get user's leave balances with error handling
        let leaveBalances = {
          vacation: 0,
          sick: 0,
          personal: 0,
        };
        try {
          const userDetails = await db.users.get(user.id);
          if (userDetails) {
            leaveBalances = {
              vacation: userDetails.vacation_balance || 0,
              sick: userDetails.sick_balance || 0,
              personal: userDetails.personal_balance || 0,
            };
          }
        } catch (err) {
          console.error('Error fetching leave balances:', err);
        }

        // Calculate project progress for active projects only
        const projectProgress = await Promise.all(
          userProjects
            .filter(project => project.status === 'in_progress')
            .map(async project => {
              try {
                const projectTasks = userTasks.filter(task => task.project_id === project.id);
                const totalTasks = projectTasks.length;
                const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
                const inProgressTasks = projectTasks.filter(task => task.status === 'in_progress').length;
                const blockedTasks = projectTasks.filter(task => task.status === 'blocked').length;

                // Get project time entries for budget calculation
                const projectTimeEntries = await db.timeEntries
                  .where('project_id')
                  .equals(project.id)
                  .toArray();

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
                  budget: isLeadOrManagement ? project.budget : undefined,
                  spent: isLeadOrManagement ? spent : undefined,
                };
              } catch (err) {
                console.error(`Error processing project ${project.id}:`, err);
                return null;
              }
            })
        ).then(results => results.filter(Boolean)); // Remove any failed projects

        // Update time distribution to show working hours pattern
        const timeDistribution = weekDays.map(date => {
          const dayEntries = timeEntries.filter(
            entry => entry.date === format(date, 'yyyy-MM-dd')
          );
          
          const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
          const billableHours = dayEntries
            .filter(entry => entry.is_billable)
            .reduce((sum, entry) => sum + (entry.hours || 0), 0);

          return {
            date: format(date, 'EEE'),
            hours: Math.min(totalHours, HOURS_PER_DAY), // Cap at 8 hours
            billableHours: Math.min(billableHours, HOURS_PER_DAY), // Cap at 8 hours
            expected: HOURS_PER_DAY,
          };
        });

        // Calculate project distribution
        const projectHours = new Map();
        timeEntries.forEach(entry => {
          if (entry.project_id && entry.hours) {
            const current = projectHours.get(entry.project_id) || 0;
            projectHours.set(entry.project_id, current + entry.hours);
          }
        });

        const projectDistribution = Array.from(projectHours.entries())
          .map(([projectId, hours]) => ({
            name: userProjects.find(p => p.id === projectId)?.name || 'Unknown Project',
            hours,
            percentage: monthlyHours > 0 ? (hours / monthlyHours) * 100 : 0,
          }))
          .sort((a, b) => b.hours - a.hours);

        return {
          weeklyHours,
          expectedWeeklyHours,
          monthlyHours,
          expectedMonthlyHours,
          upcomingDeadlines: sortedDeadlines,
          completedProjects,
          projectProgress,
          timeDistribution,
          projectDistribution,
          leaveBalances,
          loading: false,
          error: null,
        };
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        return {
          weeklyHours: 0,
          expectedWeeklyHours: HOURS_PER_WEEK,
          monthlyHours: 0,
          expectedMonthlyHours: 0,
          upcomingDeadlines: [],
          completedProjects: [],
          projectProgress: [],
          timeDistribution: [],
          projectDistribution: [],
          leaveBalances: {
            vacation: 0,
            sick: 0,
            personal: 0,
          },
          loading: false,
          error: 'Failed to load dashboard stats',
        };
      }
    },
    [user]
  );

  return stats || {
    weeklyHours: 0,
    expectedWeeklyHours: HOURS_PER_WEEK,
    monthlyHours: 0,
    expectedMonthlyHours: 0,
    upcomingDeadlines: [],
    completedProjects: [],
    projectProgress: [],
    timeDistribution: [],
    projectDistribution: [],
    leaveBalances: {
      vacation: 0,
      sick: 0,
      personal: 0,
    },
    loading: !stats,
    error: null,
  };
}