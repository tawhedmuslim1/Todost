"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { createTask } from "@/actions/task-actions";
import { useState } from "react";
import { schema } from "@/schema/tasks";

type FormValues = z.infer<typeof schema>;

export function AddTaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      const result = await createTask(values);
      
      if (result.error) {
        form.setError("title", {
          message: result.error,
        });
      } else {
        form.reset();
        setIsOpen(false);
        // Refresh the page to show the new task
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      form.setError("title", {
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="flex items-center gap-2 min-w-xl" variant="outline">
          <PlusIcon />
          Add Task
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new task</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the task you want to add input field below
          </AlertDialogDescription>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                className="w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </form>
          </Form>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}