import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  LayoutGrid,
  List,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Project, Task, User } from '../types';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskList } from '../components/projects/TaskList';
import { KanbanBoard } from '../components/projects/KanbanBoard';
import { TeamManagement } from '../components/projects/TeamManagement';
import { ProjectAnalytics } from '../components/projects/ProjectAnalytics';
import { useProjectAnalytics } from '../hooks/useProjectAnalytics';
import { formatCurrency } from '../lib/utils';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

  const analytics = useProjectAnalytics(id!);

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch project tasks
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select(`
            *,
            assigned_to:users(id, full_name)
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (taskError) throw taskError;
        setTasks(taskData || []);

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('users')
          .select('*')
          .in(
            'id',
            taskData?.map((task) => task.assigned_to?.id) || []
          );

        if (teamError) throw teamError;
        setTeam(teamData || []);
      } catch (err) {
        setError('Failed to load project details');
        console.error('Error loading project details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleAssignTeamMember = async (userId: string) => {
    try {
      // Implementation for assigning team member
      console.log('Assigning team member:', userId);
    } catch (err) {
      console.error('Error assigning team member:', err);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    try {
      // Implementation for removing team member
      console.log('Removing team member:', userId);
    } catch (err) {
      console.error('Error removing team member:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error || 'Project not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <ProjectForm
            project={project}
            onSubmit={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Timeline
                </p>
                <p className="font-medium">
                  {format(new Date(project.start_date), 'MMM d, yyyy')}
                  {project.end_date &&
                    ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                <p className="font-medium">
                  {formatCurrency(project.budget)}
                  <span className="ml-1 text-sm text-primary-600 dark:text-primary-400">
                    ({((project.budget_spent / project.budget) * 100).toFixed(1)}%
                    spent)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium capitalize">
                  {project.status.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-dark-700">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
                <p className="font-medium">{team.length} members</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!analytics.loading && !analytics.error && (
        <ProjectAnalytics
          projectId={id!}
          metrics={analytics.metrics}
          timeData={analytics.timeData}
          taskData={analytics.taskData}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('board')}
            className={`rounded-lg p-2 ${
              viewMode === 'board'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 ${
              viewMode === 'list'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <KanbanBoard tasks={tasks} onTaskUpdate={() => {}} />
      ) : (
        <TaskList tasks={tasks} onTaskUpdate={() => {}} />
      )}

      <TeamManagement
        members={team}
        onAssign={handleAssignTeamMember}
        onRemove={handleRemoveTeamMember}
      />
    </div>
  );
}