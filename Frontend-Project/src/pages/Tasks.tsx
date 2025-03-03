import React, { useState } from 'react';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { TaskList } from '../components/projects/TaskList';
import { TaskForm } from '../components/projects/TaskForm';
import { useAuth } from '../components/AuthProvider';
import { Task } from '../types';
import { db } from '../lib/db';

export function Tasks() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Use live query for projects
  const projects = useLiveQuery(
    () => db.projects.toArray()
  );

  // Use live query for tasks with filtering
  const tasks = useLiveQuery(
    async () => {
      if (!user) return [];

      try {
        let query = db.tasks;

        if (selectedProject) {
          query = query.where('project_id').equals(selectedProject);
        }

        const tasks = await query.toArray();

        // Filter based on user role
        return tasks.filter(task => {
          if (user.role === 'management') return true;
          if (user.role === 'lead') return user.department === 'Engineering';
          return task.assigned_to === user.id;
        });
      } catch (err) {
        console.error('Error loading tasks:', err);
        return [];
      }
    },
    [user, selectedProject]
  );

  const handleTaskUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      await db.tasks.update(taskId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskSave = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (!projects) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and track project tasks
          </p>
        </div>
        {(user?.role === 'management' || user?.role === 'lead') && (
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800">
          <TaskForm
            projectId={selectedProject}
            task={editingTask}
            onSubmit={handleTaskSave}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700">
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:hover:bg-dark-700">
            <ArrowUpDown className="h-5 w-5" />
            Sort
          </button>
        </div>
      </div>

      <TaskList
        tasks={tasks || []}
        onTaskUpdate={handleTaskUpdate}
        onEdit={handleTaskEdit}
      />
    </div>
  );
}