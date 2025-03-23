import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // Ensure environment variables are loaded
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Debug database URL (without exposing credentials)
const dbUrlDebug = process.env.DATABASE_URL ? 
  `Database URL exists with length: ${process.env.DATABASE_URL.length}` : 
  'DATABASE_URL is missing!';
console.log('Database connection info:', dbUrlDebug);

// Connection for HTTP requests (serverless)
let db: NeonHttpDatabase;

try {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql);
  console.log('Database client initialized successfully');
} catch (error) {
  console.error('Error initializing database client:', error);
  throw new Error('Database client failed to initialize. Check your DATABASE_URL.');
}

export { db };
