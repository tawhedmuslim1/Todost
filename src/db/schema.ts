// create a schema for the database
import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  userId: varchar("user_id", { length: 255 }).notNull(),
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default('not_started'),
});

