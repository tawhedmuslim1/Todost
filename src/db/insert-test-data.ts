import 'dotenv/config';
import { db } from './index';
import { tasks } from './schema';

async function insertTestData() {
  try {
    console.log('Inserting test data...');
    const result = await db.insert(tasks).values([
      {
        userId: 'test-user-id',
        title: 'Test Task 1',
        isCompleted: false
      },
      {
        userId: 'test-user-id',
        title: 'Test Task 2',
        isCompleted: true
      }
    ]).returning();
    
    console.log('Data inserted successfully!');
    console.log('Inserted records:', result);
  } catch (error) {
    console.error('Error inserting test data:', error);
  }
}

insertTestData(); 