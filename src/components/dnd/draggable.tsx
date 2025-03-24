"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { CSSProperties } from "react";

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

export function Draggable({ id, children }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style: CSSProperties | undefined = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : "auto",
        position: isDragging ? ("relative" as const) : ("static" as const),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "opacity-90 shadow-lg" : ""}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center px-1 cursor-grab hover:opacity-100 transition-opacity"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="ml-6">{children}</div>
    </div>
  );
}
