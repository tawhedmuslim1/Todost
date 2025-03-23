import 'dotenv/config';
import { db } from './index';
import { tasks } from './schema';
import { eq, and } from 'drizzle-orm';

async function testQueryWithAnd() {
  try {
    console.log('Attempting to query the database with AND condition...');
    
    // Define test variables
    const userId = 'test-user-id';
    const taskTitle = 'Test Task 1';
    
    const result = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.title, taskTitle)
      ))
      .limit(1);
    
    console.log('Query successful!');
    console.log('Results:', result);
  } catch (error) {
    console.error('Error querying the database:', error);
  }
}

testQueryWithAnd(); 