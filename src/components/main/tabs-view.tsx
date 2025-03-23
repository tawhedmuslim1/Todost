"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientTaskList } from "./client-task-list";
import { KanbanBoard } from "./kanban-board";
import { Task } from "@/actions/task-actions";

interface TabsViewProps {
  tasks: Task[];
}

export function TabsView({ tasks }: TabsViewProps) {
  return (
    <Tabs 
      defaultValue="list" 
      className="w-full max-w-5xl mx-auto" 
    >
      <div className="flex justify-center mb-6">
        <TabsList className="rounded-md">
          <TabsTrigger 
            value="list" 
            className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            List View
          </TabsTrigger>
          <TabsTrigger 
            value="kanban" 
            className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Kanban View
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="list" className="w-full max-w-2xl mx-auto">
        <ClientTaskList tasks={tasks} />
      </TabsContent>
      <TabsContent value="kanban" className="w-full mx-auto">
        <KanbanBoard tasks={tasks} />
      </TabsContent>
    </Tabs>
  );
} 