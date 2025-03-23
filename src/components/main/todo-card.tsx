"use client"

import { Card } from "../ui/card";
import { Task, toggleTaskCompletion, updateTaskTitle, deleteTask } from "@/actions/task-actions";
import { Trash2 } from "lucide-react";
import { CheckCircle, Circle, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for the form
const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }).max(16, {
    message: "Title must be less than 16 characters",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function TodoCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Use optimistic UI state
  const [optimisticTask, setOptimisticTask] = useState<Task>(task);
  // Track if this task has been deleted optimistically
  const [isDeleted, setIsDeleted] = useState(false);

  // Setup form for edit mode
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: optimisticTask.title,
    },
  });

  // Reset form when opening the dialog
  const handleEditOpen = (open: boolean) => {
    if (open) {
      form.reset({ title: optimisticTask.title });
    }
    setIsEditing(open);
    // Reset any previous errors
    setError(null);
  };

  // Handle delete confirmation dialog
  const handleDeleteConfirmOpen = (open: boolean) => {
    setIsConfirmingDelete(open);
    // Reset any previous errors
    if (!open) setError(null);
  };

  const handleToggleCompletion = async () => {
    if (isPending) return; // Prevent multiple clicks
    
    // Apply optimistic update immediately
    const newStatus = !optimisticTask.isCompleted;
    
    // Optimistically update the local state
    setOptimisticTask({
      ...optimisticTask,
      isCompleted: newStatus,
      completedAt: newStatus ? new Date() : null,
      // Update status based on completion state - when complete go to 'done', when uncompleting leave current status or use 'not_started' if it was 'done'
      status: newStatus ? 'done' : optimisticTask.status === 'done' ? 'not_started' : optimisticTask.status,
      updatedAt: new Date()
    });
    
    setError(null);

    // Start server update in a transition (non-blocking)
    startTransition(async () => {
      try {
        const result = await toggleTaskCompletion(task.id);
        
        if (result.error) {
          // Revert optimistic update if there was an error
          setOptimisticTask(task);
          setError(result.error);
        } else {
          // Only refresh the router after successful update
          // This ensures the latest data is fetched from the server
          router.refresh();
        }
      } catch (err) {
        // Revert optimistic update if there was an error
        setOptimisticTask(task);
        setError("Failed to update task status");
        console.error("Error updating task status:", err);
      }
    });
  }

  async function handleEditSubmit(values: FormValues) {
    console.log("Submitting edit with task ID:", task.id, "and title:", values.title);
    setIsEditSubmitting(true);
    setError(null);
    
    try {
      // Apply optimistic update immediately
      const originalTask = { ...optimisticTask };
      
      // Update optimistic state
      setOptimisticTask({
        ...optimisticTask,
        title: values.title,
        updatedAt: new Date()
      });
      
      // Close the dialog
      setIsEditing(false);
      
      // Ensure taskId is a number
      const taskId = Number(task.id);
      console.log("Calling updateTaskTitle with:", taskId, values.title);
      
      // Submit the update to the server
      const result = await updateTaskTitle(taskId, values.title);
      console.log("Update result:", result);
      
      if (result.error) {
        // Revert optimistic update if there was an error
        setOptimisticTask(originalTask);
        setError(result.error);
        console.error("Error from server:", result.error);
      } else {
        // Refresh to ensure we get the latest data
        router.refresh();
      }
    } catch (err) {
      // Revert on error
      setOptimisticTask(task);
      setError("Failed to update task title");
      console.error("Error updating task title:", err);
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    
    try {
      // Apply optimistic deletion
      setIsDeleted(true);
      
      // Close the confirmation dialog
      setIsConfirmingDelete(false);
      
      // Ensure taskId is a number
      const taskId = Number(task.id);
      console.log("Deleting task with ID:", taskId);
      
      // Call the server action to delete the task
      const result = await deleteTask(taskId);
      console.log("Delete result:", result);
      
      if (result.error) {
        // Revert optimistic deletion if there was an error
        setIsDeleted(false);
        setError(result.error);
        console.error("Error deleting task:", result.error);
      } else {
        // Refresh to update the task list
        router.refresh();
      }
    } catch (err) {
      // Revert on error
      setIsDeleted(false);
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  // If this task has been optimistically deleted, don't render it
  if (isDeleted) return null;

  return (
    <Card className={`relative flex items-start justify-between p-4 rounded-md border border-gray-200 shadow-sm ${isPending ? 'opacity-50' : ''} hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-3 w-full">
            <button 
            onClick={handleToggleCompletion}
            disabled={isPending || isEditSubmitting || isDeleting}
            className="focus:outline-none cursor-pointer flex-shrink-0"
            aria-label={optimisticTask.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
            {optimisticTask.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500 hover:text-green-600 transition-colors" />
            ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-gray-500 transition-colors" />
            )}
            </button>
            <h3 className={`text-sm md:text-base ${optimisticTask.isCompleted ? "line-through text-gray-500" : "text-gray-800"}`}>
              {optimisticTask.title}
            </h3>
        </div>

        <div className="flex items-center gap-2">
            <AlertDialog open={isEditing} onOpenChange={handleEditOpen}>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-gray-100" 
                        aria-label="Edit task"
                        disabled={isDeleting}
                    >
                        <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Edit task</AlertDialogTitle>
                    <AlertDialogDescription>
                        Update the task title
                    </AlertDialogDescription>
                    
                    <Form {...form}>
                        <form 
                        onSubmit={(e) => {
                            try {
                            form.handleSubmit(handleEditSubmit)(e);
                            } catch (error) {
                            console.error("Form submission error:", error);
                            setError("Error submitting form");
                            }
                        }} 
                        className="space-y-8 mt-2"
                        >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                <Input placeholder="Task name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isEditSubmitting}
                        >
                            {isEditSubmitting ? 'Updating...' : 'Update Task'}
                        </Button>
                        </form>
                    </Form>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isConfirmingDelete} onOpenChange={handleDeleteConfirmOpen}>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 flex items-center justify-center" 
                        aria-label="Delete task"
                        disabled={isDeleting || isEditSubmitting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-red-500 mt-1 absolute bottom-1 left-4">
          {error}
        </div>
      )}
    </Card>
  );
}