"use client";

import { useDroppable } from "@dnd-kit/core";

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function Droppable({ id, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${
        isOver ? "ring-2 ring-primary ring-offset-2" : ""
      } rounded-md transition-all`}
    >
      {children}
    </div>
  );
}
