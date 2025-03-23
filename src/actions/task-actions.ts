"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { schema } from "@/schema/tasks";
import { currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { and, desc, eq } from "drizzle-orm";

// Accept a simple type with title for the form values
type FormInput = {
  title: string;
};

// Define Task type that matches your database schema
export type Task = {
  id: number;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
  status: string;
};

export async function createTask(values: FormInput) {
  const user = await currentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate data
  const result = schema.safeParse(values);
  if (!result.success) {
    return { error: "Invalid data" };
  }

  // Check if task exists
  const existingTasks = await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, user.id),
      eq(tasks.title, values.title)
    ))
    .limit(1);
  
  if (existingTasks.length > 0) {
    return { error: "Task already exists" };
  }
  
  // Add task to database
  await db.insert(tasks).values({
    title: values.title,
    userId: user.id,
  });

  return { success: true };
}

export async function getTasks() {
  const user = await currentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const userTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.createdAt));
    
    return { tasks: userTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { error: "Failed to fetch tasks" };
  }
}

export async function toggleTaskCompletion(taskId: number) {
  const user = await currentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // First, get the current task to check ownership and current completion status
    const existingTask = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, user.id)
      ))
      .limit(1);
    
    if (existingTask.length === 0) {
      return { error: "Task not found or unauthorized" };
    }

    const task = existingTask[0];
    const newCompletionStatus = !task.isCompleted;
    
    // Set the status based on completion state
    const newStatus = newCompletionStatus ? 'done' : task.status === 'done' ? 'not_started' : task.status;
    
    // Update the task in the database
    await db.update(tasks)
      .set({ 
        isCompleted: newCompletionStatus,
        completedAt: newCompletionStatus ? new Date() : null,
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId));
    
    return { 
      success: true, 
      newStatus: newCompletionStatus,
      columnStatus: newStatus
    };
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return { error: "Failed to update task" };
  }
}

export async function updateTaskTitle(taskId: number, title: string) {
  console.log("Server action: updateTaskTitle called with", { taskId, title, typeTaskId: typeof taskId });
  
  try {
    // Ensure taskId is a number
    if (typeof taskId !== 'number' || isNaN(taskId)) {
      console.error("Server action: Invalid taskId format", { taskId, type: typeof taskId });
      return { error: "Invalid task ID format" };
    }
    
    const user = await currentUser();
    if (!user) {
      console.log("Server action: No authenticated user found");
      return { error: "Not authenticated" };
    }
    console.log("Server action: User authenticated:", user.id);
    
    // Validate title
    const titleResult = schema.shape.title.safeParse(title);
    if (!titleResult.success) {
      console.log("Server action: Title validation failed", titleResult.error);
      return { error: "Invalid title" };
    }

    // Try a super simplified update approach
    console.log("Server action: Attempting minimal update");
    
    // First get the task
    const existingTasks = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, user.id)
      ));
    
    if (existingTasks.length === 0) {
      return { error: "Task not found" };
    }
    
    // Update just the title, avoiding timestamp issues
    console.log("Server action: Updating just the title field");
    const updateSQL = `
      UPDATE tasks 
      SET title = $1
      WHERE id = $2 AND user_id = $3
    `;
    
    try {
      // Use the raw SQL client from neon
      const sql = neon(process.env.DATABASE_URL!);
      await sql(updateSQL, [title, taskId, user.id]);
      
      console.log("Server action: Update completed via raw SQL");
      
      return { 
        success: true,
        newTitle: title
      };
    } catch (sqlError) {
      console.error("SQL error:", sqlError);
      return { error: "Database error" };
    }
  } catch (error) {
    // Log the full error
    console.error("Server action: Error in updateTaskTitle:", error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }
    
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: number) {
  console.log("Server action: deleteTask called with taskId:", taskId);
  
  try {
    // Ensure taskId is a number
    if (typeof taskId !== 'number' || isNaN(taskId)) {
      console.error("Server action: Invalid taskId format", { taskId, type: typeof taskId });
      return { error: "Invalid task ID format" };
    }
    
    const user = await currentUser();
    if (!user) {
      console.log("Server action: No authenticated user found");
      return { error: "Not authenticated" };
    }
    
    // First verify the task exists and belongs to the user
    const existingTask = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, user.id)
      ))
      .limit(1);
    
    if (existingTask.length === 0) {
      return { error: "Task not found or unauthorized" };
    }
    
    // Delete the task
    try {
      // Use direct SQL for deletion to avoid potential ORM issues
      const sql = neon(process.env.DATABASE_URL!);
      await sql(`DELETE FROM tasks WHERE id = $1 AND user_id = $2`, [taskId, user.id]);
      
      console.log("Server action: Task deleted successfully");
      return { success: true };
    } catch (sqlError) {
      console.error("SQL error during deletion:", sqlError);
      return { error: "Database error during deletion" };
    }
  } catch (error) {
    console.error("Server action: Error in deleteTask:", error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }
    
    return { error: "Failed to delete task" };
  }
}

export async function updateTaskStatus(taskId: number, status: string) {
  console.log(`updateTaskStatus called with taskId: ${taskId}, status: ${status}`);
  
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Not authenticated" };
    }

    // Validate the status
    if (!["not_started", "in_progress", "done"].includes(status)) {
      console.error(`Invalid status provided: ${status}`);
      return { error: "Invalid status" };
    }

    // Check if task exists and belongs to current user
    const existingTask = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, user.id)
      ))
      .limit(1);

    if (existingTask.length === 0) {
      console.error(`Task not found for taskId: ${taskId}`);
      return { error: "Task not found" };
    }

    // Log the current state of the task before updating
    console.log("Current task state:", {
      id: existingTask[0].id,
      status: existingTask[0].status,
      isCompleted: existingTask[0].isCompleted
    });

    // Determine completion state based on status
    const isCompleted = status === 'done';
    const completedAt = isCompleted ? new Date() : null;

    console.log(`Setting isCompleted to ${isCompleted} because status is ${status}`);

    // Update task status
    await db.update(tasks)
      .set({ 
        status, 
        updatedAt: new Date(),
        isCompleted,
        completedAt
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, user.id)
      ));

    // Verify the update was successful by fetching the task again
    const updatedTask = await db.select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
      
    console.log("Task after update:", {
      id: updatedTask[0].id,
      status: updatedTask[0].status,
      isCompleted: updatedTask[0].isCompleted
    });

    return { 
      success: true,
      isCompleted,
      status
    };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { error: "Failed to update task status" };
  }
} 