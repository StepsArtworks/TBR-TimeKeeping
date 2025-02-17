import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  Calendar,
  Timer,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Trophy,
  ListTodo,
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/dashboard/StatCard';
import { BudgetCard } from '../components/dashboard/BudgetCard';
import { ProjectProgressCard } from '../components/dashboard/ProjectProgressCard';
import { TimeDistributionChart } from '../components/dashboard/TimeDistributionChart';
import { ProjectDistributionChart } from '../components/dashboard/ProjectDistributionChart';
import { formatHours, formatDate } from '../lib/utils';
import { useAuth } from '../components/AuthProvider';

export function Dashboard() {
  const navigate = useNavigate();
  const stats = useStats();
  const { user } = useAuth();
  const isLeadOrManagement = user?.role === 'lead' || user?.role === 'management';

  if (stats.loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {stats.error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Weekly Hours"
          value={`${formatHours(stats.weeklyHours)} / ${formatHours(stats.expectedWeeklyHours)}`}
          icon={Clock}
          description="Hours logged this week"
          progress={{
            current: stats.weeklyHours,
            target: stats.expectedWeeklyHours
          }}
        />
        <StatCard
          title="Monthly Hours"
          value={`${formatHours(stats.monthlyHours)} / ${formatHours(stats.expectedMonthlyHours)}`}
          icon={Timer}
          description="Hours logged this month"
          progress={{
            current: stats.monthlyHours,
            target: stats.expectedMonthlyHours
          }}
        />
        <StatCard
          title="Tasks Completed"
          value={stats.projectProgress.reduce((sum, p) => sum + p.completedTasks, 0)}
          icon={CheckCircle2}
          description="Completed tasks across all projects"
        />
        <StatCard
          title="Leave Balance"
          value={formatHours(stats.leaveBalances.vacation)}
          icon={Calendar}
          description="Vacation days remaining"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeDistributionChart data={stats.timeDistribution} />
        <ProjectDistributionChart data={stats.projectDistribution} />
      </div>

      {stats.projectProgress.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Active Projects</h2>
            {isLeadOrManagement && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Budget tracking enabled
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.projectProgress.map((project) => (
              <div key={project.projectId} className="space-y-4">
                <ProjectProgressCard
                  projectName={project.projectName}
                  totalTasks={project.totalTasks}
                  completedTasks={project.completedTasks}
                  inProgressTasks={project.inProgressTasks}
                  blockedTasks={project.blockedTasks}
                  progress={project.progress}
                  status={project.status}
                />
                {isLeadOrManagement && project.budget && (
                  <BudgetCard
                    projectName={project.projectName}
                    budget={project.budget}
                    spent={project.spent}
                    percentage={(project.spent / project.budget) * 100}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Upcoming Tasks Section */}
          {stats.upcomingDeadlines.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary-500" />
                  <h2 className="text-lg font-medium">Upcoming Task Deadlines</h2>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Next {stats.upcomingDeadlines.length} tasks due
                </span>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-dark-700">
                {stats.upcomingDeadlines.map((task) => {
                  const dueDate = new Date(task.due_date);
                  const isOverdue = dueDate < new Date();
                  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={task.id}
                      className="flex cursor-pointer items-center justify-between py-4 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700"
                      onClick={() => navigate(`/projects/${task.project_id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isOverdue 
                            ? 'bg-red-50 dark:bg-red-900/20' 
                            : daysUntilDue <= 3
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            isOverdue 
                              ? 'text-red-500' 
                              : daysUntilDue <= 3
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.name}</h3>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            isOverdue 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysUntilDue <= 3
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {isOverdue 
                              ? `Overdue by ${Math.abs(daysUntilDue)} days`
                              : `Due in ${daysUntilDue} days`}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(task.due_date)}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.completedProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-medium">Completed Projects</h2>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last {stats.completedProjects.length} completed
              </span>
            </div>
            
            <div className="rounded-lg bg-white shadow-sm dark:bg-dark-800">
              <ul className="divide-y divide-gray-200 dark:divide-dark-700">
                {stats.completedProjects.map((project) => (
                  <li 
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {project.completedTasks} of {project.totalTasks} tasks completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Completed {formatDate(project.completedAt)}
                        </p>
                        <p className="mt-0.5 text-sm text-green-600 dark:text-green-400">
                          100% complete
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}