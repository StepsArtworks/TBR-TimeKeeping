import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User } from '../../types';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useUserById } from '../../lib/api';

interface KanbanTaskProps {
  task: Task;
  canEdit: boolean;
}

export function KanbanTask({ task, canEdit }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get assigned user from API
  const { user: assignedUser, loading, error } = useUserById(task.assigned_to);
  const [userInitial, setUserInitial] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (assignedUser) {
      setUserInitial(assignedUser.full_name[0]);
      setUserName(assignedUser.full_name);
    }
  }, [assignedUser]);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canEdit ? { ...attributes, ...listeners } : {})}
      className={`${
        canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      } rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-dark-700 dark:bg-dark-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-medium">{task.name}</h4>
        {isOverdue && (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>Overdue</span>
          </div>
        )}
      </div>
      
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        {task.description}
      </p>

      {task.due_date && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Due {formatDate(task.due_date)}</span>
        </div>
      )}

      {assignedUser && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium dark:bg-dark-700">
            {userInitial}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {userName}
          </span>
        </div>
      )}
    </div>
  );
}