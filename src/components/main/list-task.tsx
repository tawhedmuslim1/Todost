import { getTasks, Task } from "@/actions/task-actions";
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

  // Ensure tasks have the correct status type
  const typedTasks: Task[] = result.tasks.map(task => ({
    ...task,
    status: (task.status as 'not_started' | 'in_progress' | 'done') || 'not_started'
  }));

  return (
    <div className="flex flex-col gap-2">
      {typedTasks.map((task) => (
        <TodoCard key={task.id} task={task} />
      ))}
    </div>
  );
}