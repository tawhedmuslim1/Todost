"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

export function EisenhowerInfo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <InfoIcon className="h-4 w-4" />
          <span>About Eisenhower Matrix</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            The Eisenhower Matrix
          </AlertDialogTitle>
          <AlertDialogDescription>
            A powerful decision-making tool to prioritize tasks based on urgency
            and importance
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="border rounded-md p-4 bg-green-50">
            <h3 className="font-bold text-lg mb-2">
              1. Do: Urgent & Important
            </h3>
            <p className="text-sm">
              Tasks that are both urgent and important. These are critical
              activities that require immediate attention.
            </p>
            <p className="text-sm mt-2 font-medium">
              {"Example: Completing a project with today's deadline"}
            </p>
          </div>

          <div className="border rounded-md p-4 bg-orange-50">
            <h3 className="font-bold text-lg mb-2">
              2. Schedule: Not Urgent & Important
            </h3>
            <p className="text-sm">
              Tasks that are important but not urgent. These contribute to
              long-term goals and should be scheduled.
            </p>
            <p className="text-sm mt-2 font-medium">
              Example: Learning a new skill for career growth
            </p>
          </div>

          <div className="border rounded-md p-4 bg-blue-50">
            <h3 className="font-bold text-lg mb-2">
              3. Delegate: Urgent & Not Important
            </h3>
            <p className="text-sm">
              Tasks that are urgent but not important. These can often be
              delegated to others if possible.
            </p>
            <p className="text-sm mt-2 font-medium">
              Example: Responding to certain emails or calls
            </p>
          </div>

          <div className="border rounded-md p-4 bg-red-50">
            <h3 className="font-bold text-lg mb-2">
              4. Delete: Not Urgent & Not Important
            </h3>
            <p className="text-sm">
              Tasks that are neither urgent nor important. These are
              distractions that should be minimized or eliminated.
            </p>
            <p className="text-sm mt-2 font-medium">
              Example: Mindless social media browsing
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This prioritization method was popularized by President Dwight D.
          {`Eisenhower, who said: "What is important is seldom urgent, and what is
          urgent is seldom important."`}
        </p>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel asChild>
            <Button className="bg-primary text-primary-foreground">
              Close
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
