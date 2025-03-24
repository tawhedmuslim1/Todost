"use client";

import { Task } from "@/actions/task-actions";
import { Button } from "@/components/ui/button";
import { ViewIcon, ColumnsIcon } from "lucide-react";
import { useState } from "react";
import { EisenhowerMatrix } from "./eisenhower-matrix";

interface ClientTasksProps {
  tasks: Task[];
}

export function ClientTasks({ tasks }: ClientTasksProps) {
  const [view, setView] = useState<"list" | "kanban">("list");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
          >
            <ViewIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("kanban")}
          >
            <ColumnsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EisenhowerMatrix tasks={tasks} view={view} />
    </div>
  );
}
