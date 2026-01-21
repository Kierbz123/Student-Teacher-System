
import { Student } from '../types';

// The URL where your PHP scripts will reside on your local XAMPP/WAMP server
const BASE_URL = 'http://localhost/smartacademic-api';

export const ApiService = {
  async testConnection(): Promise<boolean> {
    try {
      // Use no-cache to ensure we get a fresh status
      const res = await fetch(`${BASE_URL}/test.php`, { 
        cache: 'no-cache',
        mode: 'cors' 
      });
      if (res.ok) {
        const data = await res.json();
        return data.status === 'online';
      }
      return false;
    } catch (err) {
      console.error("API Connection Error:", err);
      return false;
    }
  },

  async fetchStudents(): Promise<Student[]> {
    const res = await fetch(`${BASE_URL}/get_students.php`, { mode: 'cors' });
    if (!res.ok) throw new Error('Failed to fetch from PHP API');
    return res.json();
  },

  async saveStudent(student: Student): Promise<void> {
    try {
      await fetch(`${BASE_URL}/save_student.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
        mode: 'cors'
      });
    } catch (err) {
      console.error("Failed to save to MySQL:", err);
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/delete_student.php?id=${id}`, { 
        method: 'DELETE',
        mode: 'cors'
      });
    } catch (err) {
      console.error("Failed to delete from MySQL:", err);
    }
  }
};
