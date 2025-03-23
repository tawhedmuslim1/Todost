"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientTaskList } from "./client-task-list";
import { KanbanBoard } from "./kanban-board";
import { useState } from "react";
import { Task } from "@/actions/task-actions";

interface TabsViewProps {
  tasks: Task[];
}

export function TabsView({ tasks }: TabsViewProps) {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <Tabs 
      defaultValue="list" 
      className="w-max mx-auto" 
      onValueChange={setActiveTab}
    >
      <div className="flex justify-center">
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="list" className="w-max mx-auto">
        <ClientTaskList tasks={tasks} />
      </TabsContent>
      <TabsContent value="kanban" className="w-max mx-auto">
        <KanbanBoard tasks={tasks} />
      </TabsContent>
    </Tabs>
  );
} 