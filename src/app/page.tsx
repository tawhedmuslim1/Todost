import { getTasks } from "@/actions/task-actions";
import { CreateTask } from "@/components/forms/create-task";
import { ClientTasks } from "@/components/main/client-tasks";

export default async function Home() {
  const result = await getTasks();

  if (result.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive font-medium">{result.error}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <CreateTask />
        <ClientTasks tasks={result.tasks} />
      </div>
    </main>
  );
}
