ALTER TABLE "tasks" ADD COLUMN "is_urgent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_important" boolean DEFAULT false NOT NULL;