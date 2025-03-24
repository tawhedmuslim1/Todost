import { getTasks } from "@/actions/task-actions";
import { CreateTask } from "@/components/forms/create-task";
import { ClientTasks } from "@/components/main/client-tasks";
import { EisenhowerMatrix } from "@/components/main/eisenhower-matrix";

export default async function Home() {
  const result = await getTasks();

  if ("error" in result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive font-medium">{result.error}</p>
      </div>
    );
  }

  // At this point, TypeScript knows result has a tasks property
  const tasks = result.tasks;

  return (
    <main className="container mx-auto py-8 px-4 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <CreateTask />
        <ClientTasks tasks={tasks} />
        <EisenhowerMatrix tasks={tasks} view="list" />
      </div>
    </main>
  );
}
