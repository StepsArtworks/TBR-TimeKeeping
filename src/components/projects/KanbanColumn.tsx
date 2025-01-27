import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../../types';
import { KanbanTask } from './KanbanTask';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
}

export function KanbanColumn({ title, status, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-dark-800"
    >
      <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
        {title} ({tasks.length})
      </h3>
      <div className="flex-1 space-y-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}