import 'dotenv/config';
import { db } from './index';
import { tasks } from './schema';

async function testQuery() {
  try {
    console.log('Attempting to query the database...');
    const result = await db.select().from(tasks).limit(5);
    console.log('Query successful!');
    console.log('Results:', result);
  } catch (error) {
    console.error('Error querying the database:', error);
  }
}

testQuery(); 