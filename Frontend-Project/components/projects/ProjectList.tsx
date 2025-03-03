import React from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Project } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectList({ 
  projects, 
  loading, 
  error,
  canEdit,
  onEdit,
  onDelete,
}: ProjectListProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-primary-500';
      case 'completed':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-dark-700">
        <CheckCircle2 className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No projects
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new project
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-dark-800"
        >
          {canEdit && (
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-400 dark:hover:bg-dark-600"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="rounded-lg bg-gray-100 p-2 text-red-600 hover:bg-red-100 dark:bg-dark-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <div 
            className="p-6 cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${getStatusColor(
                    project.status
                  )}`}
                />
                <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-medium">{project.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(project.start_date), 'MMM d, yyyy')}
                  {project.end_date &&
                    ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>
                  Budget: {formatCurrency(project.budget)}
                  <span className="ml-2 text-primary-600 dark:text-primary-400">
                    ({((project.budget_spent / project.budget) * 100).toFixed(1)}% spent)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {project.end_date
                    ? `${Math.ceil(
                        (new Date(project.end_date).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} days remaining`
                    : 'No deadline set'}
                </span>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700">
              <div
                className="h-2 rounded-full bg-primary-500"
                style={{
                  width: `${Math.min(
                    (project.budget_spent / project.budget) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium dark:border-dark-800 dark:bg-dark-700"
                  >
                    <Users className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                }}
                className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-100 dark:hover:bg-dark-600"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}