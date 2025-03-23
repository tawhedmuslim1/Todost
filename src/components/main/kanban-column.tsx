"use client";

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/actions/task-actions';
import { KanbanTask } from './kanban-task';
import { useEffect } from 'react';

type KanbanColumnProps = {
  id: string;
  tasks: Task[];
  updatingTasks: number[];
  draggedTaskId: number | null;
}

export function KanbanColumn({ id, tasks, updatingTasks, draggedTaskId }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  // Debug log to check task completion states in this column
  useEffect(() => {
    console.log(`Column ${id} tasks:`, tasks.map(t => ({ id: t.id, isCompleted: t.isCompleted, status: t.status })));
  }, [id, tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[calc(100vh-14rem)] rounded-lg p-3 transition-colors duration-200 ${
        isOver ? 'bg-muted/50' : 'bg-muted/30'
      }`}
    >
      <div className="flex flex-col gap-2">
        {tasks.map((task, index) => (
          <KanbanTask 
            key={`${id}-task-${task.id}-${index}`}
            task={task} 
            disabled={updatingTasks.includes(task.id)}
            opacity={draggedTaskId === task.id ? 0.5 : 1}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-muted-foreground text-sm p-4 text-center border-2 border-dashed border-border rounded-md">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
} 