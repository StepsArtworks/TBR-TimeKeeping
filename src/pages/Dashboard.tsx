import React from 'react';
import {
  Clock,
  AlertCircle,
  Calendar,
  Wallet,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/dashboard/StatCard';
import { BudgetCard } from '../components/dashboard/BudgetCard';
import { TimeDistributionChart } from '../components/dashboard/TimeDistributionChart';
import { ProjectDistributionChart } from '../components/dashboard/ProjectDistributionChart';
import { formatHours } from '../lib/utils';

export function Dashboard() {
  const stats = useStats();

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
          value={formatHours(stats.weeklyHours)}
          icon={Clock}
          description="Total hours this week"
        />
        <StatCard
          title="Monthly Hours"
          value={formatHours(stats.monthlyHours)}
          icon={Timer}
          description="Total hours this month"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={CheckCircle2}
          description="Time entries awaiting approval"
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

      {stats.projectBudgets.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-medium">Project Budgets</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.projectBudgets.map((project) => (
              <BudgetCard
                key={project.projectId}
                projectName={project.projectName}
                budget={project.budget}
                spent={project.spent}
                percentage={project.percentage}
              />
            ))}
          </div>
        </>
      )}

      {stats.upcomingDeadlines.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-medium">Upcoming Deadlines</h2>
          <div className="rounded-lg bg-white shadow-sm dark:bg-dark-800">
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {stats.upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h3 className="font-medium">{task.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {formatHours(task.estimated_hours)} estimated
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}