"use client";

import {
  deleteTask,
  Task,
  toggleTaskCompletion,
  updateTaskTitle,
} from "@/actions/task-actions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Circle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

// Define schema for the form
const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(16, {
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
      status: newStatus
        ? "done"
        : optimisticTask.status === "done"
        ? "not_started"
        : optimisticTask.status,
      updatedAt: new Date(),
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
  };

  async function handleEditSubmit(values: FormValues) {
    console.log(
      "Submitting edit with task ID:",
      task.id,
      "and title:",
      values.title
    );
    setIsEditSubmitting(true);
    setError(null);

    try {
      // Apply optimistic update immediately
      const originalTask = { ...optimisticTask };

      // Update optimistic state
      setOptimisticTask({
        ...optimisticTask,
        title: values.title,
        updatedAt: new Date(),
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

  // Determine badge styling based on priority
  const priorityBadge = () => {
    if (optimisticTask.isUrgent && optimisticTask.isImportant) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Do First
        </Badge>
      );
    } else if (!optimisticTask.isUrgent && optimisticTask.isImportant) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
          Schedule
        </Badge>
      );
    } else if (optimisticTask.isUrgent && !optimisticTask.isImportant) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Delegate
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">Delete</Badge>
      );
    }
  };

  return (
    <Card className="p-4 bg-white dark:bg-gray-900 rounded-md shadow-sm border dark:border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 cursor-pointer mt-1"
            onClick={() => handleToggleCompletion()}
          >
            {optimisticTask.isCompleted ? (
              <CheckCircle
                className="h-5 w-5 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors"
                strokeWidth={2}
              />
            ) : (
              <Circle
                className="h-5 w-5 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 transition-colors"
                strokeWidth={2}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 dark:text-gray-100 font-medium">
              {optimisticTask.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {priorityBadge()}
              {optimisticTask.isCompleted && (
                <Badge
                  variant="outline"
                  className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/50"
                >
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={() => handleEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog
            open={isConfirmingDelete}
            onOpenChange={handleDeleteConfirmOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white dark:bg-gray-900 border dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                  Delete task
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 dark:text-gray-300"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <AlertDialog open={isEditing} onOpenChange={handleEditOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
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
                  {isEditSubmitting ? "Updating..." : "Update Task"}
                </Button>
              </form>
            </Form>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="text-sm text-red-500 mt-1 absolute bottom-1 left-4">
          {error}
        </div>
      )}
    </Card>
  );
}
