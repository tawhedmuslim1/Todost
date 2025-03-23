import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AddTaskForm } from "@/components/main/add-task";
import { Suspense } from "react";
import { TabsView } from "@/components/main/tabs-view";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Task } from "@/actions/task-actions";

// Add a loading component for the task list
function TasksLoading() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="bg-gray-200 h-12 rounded-sm w-full"></div>
      <div className="bg-gray-200 h-12 rounded-sm w-full"></div>
      <div className="bg-gray-200 h-12 rounded-sm w-full"></div>
    </div>
  );
}

// Fetch tasks for the current user
async function getTasks(): Promise<Task[]> {
  const user = await currentUser();
  
  if (!user) {
    return [];
  }
  
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(tasks.createdAt);
  
  // Ensure status is one of the valid types
  return userTasks.map(task => ({
    ...task,
    status: (task.status as 'not_started' | 'in_progress' | 'done') || 'not_started'
  }));
}

export default async function Home() {
  const userTasks = await getTasks();
  
  return (
    <>
      <SignedIn>
        <div className="flex flex-col gap-6 p-6 items-center">
          <h1 className="text-2xl font-bold text-center">Task Management</h1>
          <div className="w-max max-w-3xl mx-auto">
            <AddTaskForm />
          </div>
          <Suspense fallback={<TasksLoading />}>
            <TabsView tasks={userTasks} />
          </Suspense>
        </div>
      </SignedIn>
      <SignedOut>
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Welcome to Todost</h1>
              <p className="text-gray-500">
                Todost is a simple and easy-to-use todo list app.
              </p>
            </div>
            <Button>
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
      </SignedOut>
    </>
  );
}
