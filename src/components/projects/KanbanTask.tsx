import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';

interface KanbanTaskProps {
  task: Task;
}

export function KanbanTask({ task }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-dark-700 dark:bg-dark-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h4 className="font-medium">{task.name}</h4>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {task.description}
      </p>
      {task.assigned_to && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium dark:bg-dark-700">
            {(task.assigned_to as any).full_name[0]}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(task.assigned_to as any).full_name}
          </span>
        </div>
      )}
    </div>
  );
}