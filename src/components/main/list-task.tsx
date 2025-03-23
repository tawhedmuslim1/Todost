import { getTasks } from "@/actions/task-actions";
import { TodoCard } from "./todo-card";

export async function TaskList() {
  const result = await getTasks();
  
  if (result.error) {
    return (
      <div className="text-red-500">
        Error: {result.error}
      </div>
    );
  }
  
  if (!result.tasks || result.tasks.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No tasks yet. Add your first task!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {result.tasks.map((task) => (
        <TodoCard key={task.id} task={task} />
      ))}
    </div>
  );
}