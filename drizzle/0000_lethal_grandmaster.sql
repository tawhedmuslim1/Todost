CREATE TABLE "tasks" (
	"user_id" varchar(255) NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"is_completed" boolean DEFAULT false NOT NULL
);
