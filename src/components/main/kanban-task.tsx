"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/actions/task-actions';
import { Check, CircleDot, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type KanbanTaskProps = {
  task: Task;
  disabled?: boolean;
  opacity?: number;
  isOverlay?: boolean;
}

export function KanbanTask({ task, disabled = false, opacity = 1, isOverlay = false }: KanbanTaskProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity,
    transition: 'opacity 0.2s ease-in-out, transform 0.1s ease-out',
  };

  const getStatusIcon = () => {
    // First check the completion status
    if (task.isCompleted) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    // Then check status for in_progress tasks
    switch(task.status) {
      case 'in_progress':
        return <CircleDot className="h-4 w-4 text-blue-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  // If this is an overlay (being dragged), use a simpler version
  if (isOverlay) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{task.title}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-full
        transition-all duration-200
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing hover:shadow'}
      `}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{task.title}</span>
          </div>
          {disabled && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 