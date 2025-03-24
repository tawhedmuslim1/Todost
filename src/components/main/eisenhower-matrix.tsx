"use client";

import { Task, updateTaskPriority } from "@/actions/task-actions";
import { TodoCard } from "./todo-card";
import { Badge } from "../ui/badge";
import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { Draggable } from "@/components/dnd/draggable";
import { Droppable } from "@/components/dnd/droppable";

interface EisenhowerMatrixProps {
  tasks: Task[];
  view: "list" | "kanban";
}

type FilterType =
  | "all"
  | "urgent-important"
  | "urgent-not-important"
  | "not-urgent-important"
  | "not-urgent-not-important";
type QuadrantId =
  | "urgent-important"
  | "urgent-not-important"
  | "not-urgent-important"
  | "not-urgent-not-important";

export function EisenhowerMatrix({ tasks, view }: EisenhowerMatrixProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const router = useRouter();

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter tasks into quadrants
  const urgentImportant = tasks.filter(
    (task) => task.isUrgent && task.isImportant
  );
  const urgentNotImportant = tasks.filter(
    (task) => task.isUrgent && !task.isImportant
  );
  const notUrgentImportant = tasks.filter(
    (task) => !task.isUrgent && task.isImportant
  );
  const notUrgentNotImportant = tasks.filter(
    (task) => !task.isUrgent && !task.isImportant
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Return if no destination
    if (!over) return;

    // Get the task ID and target quadrant
    const taskId = Number(active.id);
    const targetQuadrant = over.id as QuadrantId;

    // Map quadrant to urgency and importance values
    const newPriority = {
      "urgent-important": { isUrgent: true, isImportant: true },
      "urgent-not-important": { isUrgent: true, isImportant: false },
      "not-urgent-important": { isUrgent: false, isImportant: true },
      "not-urgent-not-important": { isUrgent: false, isImportant: false },
    };

    // Update task priority
    await updateTaskPriority(taskId, newPriority[targetQuadrant]);

    // Refresh to update UI
    router.refresh();
  };

  // Get filtered tasks based on current filter
  const filteredTasks = () => {
    switch (filter) {
      case "urgent-important":
        return urgentImportant;
      case "urgent-not-important":
        return urgentNotImportant;
      case "not-urgent-important":
        return notUrgentImportant;
      case "not-urgent-not-important":
        return notUrgentNotImportant;
      default:
        return tasks;
    }
  };

  if (view === "list") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant={filter === "urgent-important" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setFilter("urgent-important")}
          >
            Urgent & Important
          </Badge>
          <Badge
            variant={filter === "urgent-not-important" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setFilter("urgent-not-important")}
          >
            Urgent & Not Important
          </Badge>
          <Badge
            variant={filter === "not-urgent-important" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setFilter("not-urgent-important")}
          >
            Not Urgent & Important
          </Badge>
          <Badge
            variant={
              filter === "not-urgent-not-important" ? "default" : "outline"
            }
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setFilter("not-urgent-not-important")}
          >
            Not Urgent & Not Important
          </Badge>
        </div>

        {filter === "all" ? (
          <Accordion
            type="multiple"
            defaultValue={[
              "urgent-important",
              "urgent-not-important",
              "not-urgent-important",
              "not-urgent-not-important",
            ]}
          >
            <AccordionItem
              value="urgent-important"
              className="border rounded-md mb-2"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Do: Urgent & Important</span>
                  <Badge variant="default" className="ml-2">
                    {urgentImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-2">
                  {urgentImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    urgentImportant.map((task) => (
                      <TodoCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="not-urgent-important"
              className="border rounded-md mb-2"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Schedule: Not Urgent & Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {notUrgentImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-2">
                  {notUrgentImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    notUrgentImportant.map((task) => (
                      <TodoCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="urgent-not-important"
              className="border rounded-md mb-2"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Delegate: Urgent & Not Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {urgentNotImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-2">
                  {urgentNotImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    urgentNotImportant.map((task) => (
                      <TodoCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="not-urgent-not-important"
              className="border rounded-md mb-2"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Delete: Not Urgent & Not Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {notUrgentNotImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-2">
                  {notUrgentNotImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    notUrgentNotImportant.map((task) => (
                      <TodoCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="space-y-2 border rounded-md p-4">
            {filteredTasks().length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No tasks in this category
              </p>
            ) : (
              filteredTasks().map((task) => (
                <TodoCard key={task.id} task={task} />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
      autoScroll={{
        threshold: {
          x: 0,
          y: 0.2,
        },
        speed: {
          x: 10,
          y: 10,
        },
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Droppable id="urgent-important">
          <Accordion type="single" collapsible defaultValue="urgent-important">
            <AccordionItem
              value="urgent-important"
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-2 bg-green-50 hover:bg-green-100 rounded-t-md">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Do: Urgent & Important</span>
                  <Badge variant="default" className="ml-2">
                    {urgentImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-green-50 rounded-b-md p-4 pt-2">
                <div className="space-y-2 min-h-[100px]">
                  {urgentImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    urgentImportant.map((task) => (
                      <Draggable key={task.id} id={task.id.toString()}>
                        <TodoCard task={task} />
                      </Draggable>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Droppable>

        <Droppable id="not-urgent-important">
          <Accordion
            type="single"
            collapsible
            defaultValue="not-urgent-important"
          >
            <AccordionItem
              value="not-urgent-important"
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-t-md">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Schedule: Not Urgent & Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {notUrgentImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-orange-50 rounded-b-md p-4 pt-2">
                <div className="space-y-2 min-h-[100px]">
                  {notUrgentImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    notUrgentImportant.map((task) => (
                      <Draggable key={task.id} id={task.id.toString()}>
                        <TodoCard task={task} />
                      </Draggable>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Droppable>

        <Droppable id="urgent-not-important">
          <Accordion
            type="single"
            collapsible
            defaultValue="urgent-not-important"
          >
            <AccordionItem
              value="urgent-not-important"
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-t-md">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Delegate: Urgent & Not Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {urgentNotImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-blue-50 rounded-b-md p-4 pt-2">
                <div className="space-y-2 min-h-[100px]">
                  {urgentNotImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    urgentNotImportant.map((task) => (
                      <Draggable key={task.id} id={task.id.toString()}>
                        <TodoCard task={task} />
                      </Draggable>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Droppable>

        <Droppable id="not-urgent-not-important">
          <Accordion
            type="single"
            collapsible
            defaultValue="not-urgent-not-important"
          >
            <AccordionItem
              value="not-urgent-not-important"
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-t-md">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Delete: Not Urgent & Not Important
                  </span>
                  <Badge variant="default" className="ml-2">
                    {notUrgentNotImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-red-50 rounded-b-md p-4 pt-2">
                <div className="space-y-2 min-h-[100px]">
                  {notUrgentNotImportant.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks in this category
                    </p>
                  ) : (
                    notUrgentNotImportant.map((task) => (
                      <Draggable key={task.id} id={task.id.toString()}>
                        <TodoCard task={task} />
                      </Draggable>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Droppable>
      </div>
    </DndContext>
  );
}
