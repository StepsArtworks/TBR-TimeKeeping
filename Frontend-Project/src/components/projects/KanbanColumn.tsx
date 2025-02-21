import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../../types';
import { KanbanTask } from './KanbanTask';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  canEdit: boolean;
}

export function KanbanColumn({ title, status, tasks, canEdit }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800 ${
        canEdit ? 'cursor-pointer' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium dark:bg-dark-700">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} canEdit={canEdit} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}