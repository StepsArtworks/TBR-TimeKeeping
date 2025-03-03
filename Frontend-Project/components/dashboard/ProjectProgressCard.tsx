import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ProjectProgressCardProps {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  progress: number;
  status: string;
}

export function ProjectProgressCard({
  projectName,
  totalTasks,
  completedTasks,
  inProgressTasks,
  blockedTasks,
  progress,
  status,
}: ProjectProgressCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-primary-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">{projectName}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${getStatusColor(status)}`} />
          <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="font-medium">{completedTasks}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="font-medium">{inProgressTasks}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
            <p className="font-medium">{blockedTasks}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700">
          <div
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>
    </div>
  );
}