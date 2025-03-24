"use client";

import { Task, updateTaskPriority } from "@/actions/task-actions";
import { TodoCard } from "./todo-card";
import { Badge } from "@/components/ui/badge";
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
import { AddTaskForm } from "./add-task";

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
        <div className="flex flex-wrap gap-2 mb-4">
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
              className="border rounded-md mb-2 shadow-sm"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Do: Urgent & Important</span>
                  <Badge variant="default" className="ml-2">
                    {urgentImportant.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 bg-white">
                <div className="space-y-2">
                  {urgentImportant.length === 0 ? (
                    <div className="flex flex-col items-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No tasks in this category
                      </p>
                      <AddTaskForm />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {urgentImportant.map((task) => (
                          <TodoCard key={task.id} task={task} />
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <AddTaskForm />
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="not-urgent-important"
              className="border rounded-md mb-2 shadow-sm"
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
              <AccordionContent className="px-4 pt-2 pb-4 bg-white">
                <div className="space-y-2">
                  {notUrgentImportant.length === 0 ? (
                    <div className="flex flex-col items-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No tasks in this category
                      </p>
                      <AddTaskForm />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {notUrgentImportant.map((task) => (
                          <TodoCard key={task.id} task={task} />
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <AddTaskForm />
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="urgent-not-important"
              className="border rounded-md mb-2 shadow-sm"
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
              <AccordionContent className="px-4 pt-2 pb-4 bg-white">
                <div className="space-y-2">
                  {urgentNotImportant.length === 0 ? (
                    <div className="flex flex-col items-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No tasks in this category
                      </p>
                      <AddTaskForm />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {urgentNotImportant.map((task) => (
                          <TodoCard key={task.id} task={task} />
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <AddTaskForm />
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="not-urgent-not-important"
              className="border rounded-md mb-2 shadow-sm"
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
              <AccordionContent className="px-4 pt-2 pb-4 bg-white">
                <div className="space-y-2">
                  {notUrgentNotImportant.length === 0 ? (
                    <div className="flex flex-col items-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No tasks in this category
                      </p>
                      <AddTaskForm />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {notUrgentNotImportant.map((task) => (
                          <TodoCard key={task.id} task={task} />
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <AddTaskForm />
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="space-y-2 border rounded-md p-4 bg-white shadow-sm">
            {filteredTasks().length === 0 ? (
              <div className="flex flex-col items-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  No tasks in this category
                </p>
                <AddTaskForm />
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {filteredTasks().map((task) => (
                    <TodoCard key={task.id} task={task} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <AddTaskForm />
                </div>
              </>
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
        acceleration: 10,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Droppable id="urgent-important">
          <div className="border rounded-md shadow-md bg-white overflow-hidden">
            <div className="bg-green-100 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Do: Urgent & Important</span>
                <Badge variant="default" className="ml-2">
                  {urgentImportant.length}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-green-50 min-h-[200px]">
              <div className="space-y-2 mb-4">
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
              <div className="flex justify-center pt-2">
                <AddTaskForm />
              </div>
            </div>
          </div>
        </Droppable>

        <Droppable id="not-urgent-important">
          <div className="border rounded-md shadow-md bg-white overflow-hidden">
            <div className="bg-orange-100 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Schedule: Not Urgent & Important
                </span>
                <Badge variant="default" className="ml-2">
                  {notUrgentImportant.length}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-orange-50 min-h-[200px]">
              <div className="space-y-2 mb-4">
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
              <div className="flex justify-center pt-2">
                <AddTaskForm />
              </div>
            </div>
          </div>
        </Droppable>

        <Droppable id="urgent-not-important">
          <div className="border rounded-md shadow-md bg-white overflow-hidden">
            <div className="bg-blue-100 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Delegate: Urgent & Not Important
                </span>
                <Badge variant="default" className="ml-2">
                  {urgentNotImportant.length}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-blue-50 min-h-[200px]">
              <div className="space-y-2 mb-4">
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
              <div className="flex justify-center pt-2">
                <AddTaskForm />
              </div>
            </div>
          </div>
        </Droppable>

        <Droppable id="not-urgent-not-important">
          <div className="border rounded-md shadow-md bg-white overflow-hidden">
            <div className="bg-red-100 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Delete: Not Urgent & Not Important
                </span>
                <Badge variant="default" className="ml-2">
                  {notUrgentNotImportant.length}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-red-50 min-h-[200px]">
              <div className="space-y-2 mb-4">
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
              <div className="flex justify-center pt-2">
                <AddTaskForm />
              </div>
            </div>
          </div>
        </Droppable>
      </div>
    </DndContext>
  );
}
