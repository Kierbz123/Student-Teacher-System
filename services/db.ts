
import { Dexie, type Table } from 'dexie';
import { Student } from '../types';

/**
 * Fix: Use named import for Dexie class to ensure the 'version' method 
 * is correctly inherited and recognized by TypeScript on the subclass.
 */
export class SmartAcademicDB extends Dexie {
  students!: Table<Student>;

  constructor() {
    // Call the Dexie constructor with the database name.
    super('SmartAcademicDB');
    
    // Define database schema using versioning.
    // version() is an instance method inherited from the Dexie base class.
    this.version(1).stores({
      students: 'id, studentId, firstName, lastName, course, block, riskLevel'
    });
  }
}

export const db = new SmartAcademicDB();
