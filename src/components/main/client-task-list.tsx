"use client";

import { Task } from "@/actions/task-actions";
import { TodoCard } from "./todo-card";

interface ClientTaskListProps {
  tasks: Task[];
}

export function ClientTaskList({ tasks }: ClientTaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No tasks yet. Add your first task!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-max">
      {tasks.map((task) => (
        <TodoCard key={task.id} task={task} />
      ))}
    </div>
  );
} 