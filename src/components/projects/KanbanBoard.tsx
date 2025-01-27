import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask } from './KanbanTask';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: Task['status']) => void;
}

export function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const columns: { title: string; status: Task['status'] }[] = [
    { title: 'Not Started', status: 'not_started' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Completed', status: 'completed' },
    { title: 'Blocked', status: 'blocked' },
  ];

  const getTasksByStatus = (status: Task['status']) =>
    tasks.filter((task) => task.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];

    if (newStatus && taskId) {
      onTaskUpdate(taskId, newStatus);
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={getTasksByStatus(column.status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="cursor-grabbing">
            <KanbanTask task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}