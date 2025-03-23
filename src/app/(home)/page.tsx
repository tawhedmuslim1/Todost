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
    <div className="flex flex-col gap-2 animate-pulse max-w-2xl w-full mx-auto">
      <div className="bg-gray-200 h-12 rounded-md w-full"></div>
      <div className="bg-gray-200 h-12 rounded-md w-full"></div>
      <div className="bg-gray-200 h-12 rounded-md w-full"></div>
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
        <div className="flex flex-col gap-6 py-8 px-4 items-center max-w-4xl mx-auto min-h-screen">
          <h1 className="text-2xl font-bold text-center mb-2">Task Management</h1>
          <div className="w-full max-w-xl mx-auto flex justify-center">
            <AddTaskForm />
          </div>
          <div className="w-full">
            <Suspense fallback={<TasksLoading />}>
              <TabsView tasks={userTasks} />
            </Suspense>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center h-screen gap-6">
          <div className="text-center max-w-md px-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to Todost</h1>
            <p className="text-gray-600 text-lg mb-6">
              Todost is a simple and easy-to-use todo list app that helps you stay organized.
            </p>
          </div>
          <Button size="lg" className="px-8 py-6 text-lg">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </div>
      </SignedOut>
    </>
  );
}
