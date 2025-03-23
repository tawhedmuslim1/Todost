import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";

// Initialize database client
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Run migrations
async function runMigrations() {
  console.log("Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigrations(); 