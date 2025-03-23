"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Task, updateTaskStatus } from '@/actions/task-actions';
import { KanbanColumn } from './kanban-column';
import { KanbanTask } from './kanban-task';
import { Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define a type for valid task statuses
export type TaskStatus = 'not_started' | 'in_progress' | 'done';

type ColumnType = {
  id: string;
  title: string;
  taskIds: number[];
};

type ColumnsType = {
  [key in TaskStatus]: ColumnType;
};

type KanbanBoardProps = {
  tasks: Task[]
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnsType>({
    'not_started': { id: 'not_started', title: 'Not Started', taskIds: [] },
    'in_progress': { id: 'in_progress', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  });
  
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedTaskOpacity, setDraggedTaskOpacity] = useState<number | null>(null);
  const updatingTasks = useRef(new Set<number>());
  const tasksRef = useRef<Task[]>([]);

  // Keep a reference to the current tasks
  useEffect(() => {
    tasksRef.current = [...tasks];
  }, [tasks]);

  // Organize tasks by status
  useEffect(() => {
    // Log tasks for debugging
    console.log("Original tasks:", tasks);
    
    const newColumns: ColumnsType = {
      'not_started': { ...columns['not_started'], title: columns['not_started'].title, taskIds: [] },
      'in_progress': { ...columns['in_progress'], title: columns['in_progress'].title, taskIds: [] },
      'done': { ...columns['done'], title: columns['done'].title, taskIds: [] },
    };
    
    // Create a Map to track task placements by status
    const taskStatusMap = new Map<number, string>();
    
    // First pass: group tasks by their IDs to detect duplicates
    const tasksById = tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<number, Task>);
    
    // Second pass: place each unique task in the appropriate column
    Object.values(tasksById).forEach(task => {
      const status = (task.status || 'not_started') as TaskStatus;
      
      // Check if status is a valid column key
      if (status in newColumns) {
        newColumns[status].taskIds.push(task.id);
        taskStatusMap.set(task.id, status);
      } else {
        // If the task has an unknown status, place it in not_started
        newColumns['not_started'].taskIds.push(task.id);
        taskStatusMap.set(task.id, 'not_started');
      }
    });
    
    // Log the column structure for debugging
    console.log("Column taskIds after organization:", {
      not_started: newColumns['not_started'].taskIds,
      in_progress: newColumns['in_progress'].taskIds, 
      done: newColumns['done'].taskIds
    });
    
    setColumns(newColumns);
  }, [tasks, columns]);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // If dragging a task to a column
    if (active.id.toString().includes('task-') && over.id.toString().includes('column-')) {
      const taskId = parseInt(active.id.toString().replace('task-', ''));
      const newStatus = over.id.toString().replace('column-', '') as TaskStatus;
      
      // Step 1: Find old status
      const oldStatus = Object.keys(columns).find(status => 
        columns[status as TaskStatus].taskIds.includes(taskId)
      ) as TaskStatus || 'not_started';
      
      // Don't do anything if it's the same column
      if (oldStatus === newStatus) {
        setActiveId(null);
        return;
      }
      
      console.log(`Moving task ${taskId} from ${oldStatus} to ${newStatus}`);
      
      // Step 2: Immediately update the UI optimistically (move the card)
      setColumns(prev => {
        const newColumns = { ...prev };
        
        // Remove task from old column
        newColumns[oldStatus].taskIds = newColumns[oldStatus].taskIds.filter(id => id !== taskId);
        
        // Add task to new column
        newColumns[newStatus].taskIds.push(taskId);
        
        return newColumns;
      });
      
      // Step 3: After UI is updated, start the DB update process and show updating indicators
      updatingTasks.current.add(taskId);
      setDraggedTaskOpacity(taskId);
      
      try {
        // Step 4: Update in the database
        // Update the isCompleted status based on which column the task is moved to
        const result = await updateTaskStatus(taskId, newStatus);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Log the result of the update
        console.log(`Task ${taskId} update result:`, result);
        
        // Also update the completion status in the task object in memory
        const taskIndex = tasksRef.current.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          // Update the task in memory
          tasksRef.current[taskIndex].status = newStatus;
          tasksRef.current[taskIndex].isCompleted = newStatus === 'done';
          console.log(`Updated task in memory:`, tasksRef.current[taskIndex]);
        }
        
        // Step 5: After successful DB update, remove the updating indicators after a delay
        setTimeout(() => {
          updatingTasks.current.delete(taskId);
          setDraggedTaskOpacity(null);
        }, 800);
      } catch (error) {
        console.error('Failed to update task status:', error);
        
        // Step 6: On error, roll back the UI changes
        setColumns(prev => {
          const newColumns = { ...prev };
          
          // Remove task from current column
          newColumns[newStatus].taskIds = newColumns[newStatus].taskIds.filter(id => id !== taskId);
          
          // Add task back to old column
          newColumns[oldStatus].taskIds.push(taskId);
          
          return newColumns;
        });
        
        // Remove updating indicators
        updatingTasks.current.delete(taskId);
        setDraggedTaskOpacity(null);
      }
    }
    
    setActiveId(null);
  }, [columns]);

  // Handle column title editing
  const startEditingColumn = (columnId: string) => {
    setEditingColumnId(columnId);
    setEditingTitle(columns[columnId as TaskStatus].title);
  };

  const saveColumnTitle = (columnId: string) => {
    if (editingTitle.trim() === '') return;
    
    setColumns(prev => ({
      ...prev,
      [columnId as TaskStatus]: {
        ...prev[columnId as TaskStatus],
        title: editingTitle.trim()
      }
    }));
    
    setEditingColumnId(null);
  };

  const cancelEditingColumn = () => {
    setEditingColumnId(null);
  };

  // Find task by ID
  const findTaskById = (id: number) => {
    // First try to find it in our up-to-date ref
    const taskFromRef = tasksRef.current.find(task => task.id === id);
    if (taskFromRef) {
      return taskFromRef;
    }
    
    // Fall back to the original tasks prop if not found in ref
    const task = tasks.find(task => task.id === id);
    return task;
  };

  return (
    <div className="w-max overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-nowrap gap-4 p-4 min-w-max">
          {Object.entries(columns).map(([columnId, column]) => {
            // Extract unique tasks for this column
            const columnTasks = column.taskIds
              .map(id => findTaskById(id))
              .filter((task): task is Task => Boolean(task));
              
            // Additional safety check to ensure uniqueness
            const uniqueColumnTasks = Array.from(
              columnTasks.reduce((map, task) => {
                map.set(task.id, task);
                return map;
              }, new Map<number, Task>()).values()
            );
            
            return (
              <div key={columnId} className="w-80 shrink-0">
                <div className="bg-white shadow-sm rounded-md p-2 mb-2 flex items-center justify-between">
                  {editingColumnId === columnId ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => saveColumnTitle(columnId)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={cancelEditingColumn}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium">{column.title}</h3>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => startEditingColumn(columnId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                <KanbanColumn 
                  id={`column-${columnId}`} 
                  tasks={uniqueColumnTasks}
                  updatingTasks={Array.from(updatingTasks.current)}
                  draggedTaskId={draggedTaskOpacity}
                />
              </div>
            );
          })}
        </div>
        
        <DragOverlay>
          {activeId && activeId.toString().includes('task-') && (
            <div className="opacity-50">
              <KanbanTask 
                key={`overlay-${activeId}`}
                task={findTaskById(parseInt(activeId.toString().replace('task-', ''))) as Task}
                isOverlay 
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
} 