import React from 'react';
import { Link2, X } from 'lucide-react';

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  depends_on_task: {
    name: string;
    status: string;
  };
}

interface TaskDependenciesProps {
  dependencies: TaskDependency[];
  availableTasks: { id: string; name: string }[];
  onAdd: (dependsOnTaskId: string) => Promise<void>;
  onRemove: (dependencyId: string) => Promise<void>;
}

export function TaskDependencies({
  dependencies,
  availableTasks,
  onAdd,
  onRemove,
}: TaskDependenciesProps) {
  const [adding, setAdding] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState('');

  const handleAdd = async () => {
    if (!selectedTaskId) return;
    try {
      await onAdd(selectedTaskId);
      setAdding(false);
      setSelectedTaskId('');
    } catch (error) {
      console.error('Error adding dependency:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dependencies
        </h3>
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Add Dependency
        </button>
      </div>

      {adding && (
        <div className="flex items-center gap-2">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
          >
            <option value="">Select a task...</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTaskId}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setAdding(false);
              setSelectedTaskId('');
            }}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
        </div>
      )}

      {dependencies.length > 0 ? (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-dark-700"
            >
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{dep.depends_on_task.name}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    dep.depends_on_task.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {dep.depends_on_task.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => onRemove(dep.id)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No dependencies added yet
        </p>
      )}
    </div>
  );
}