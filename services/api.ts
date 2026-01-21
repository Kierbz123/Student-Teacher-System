
import { Student } from '../types';

/**
 * CONFIGURATION:
 * We use 127.0.0.1 instead of localhost for better compatibility 
 * with certain browser security policies.
 */
const BASE_URL = 'http://127.0.0.1/smartacademic-api';

export const ApiService = {
  async testConnection(): Promise<boolean> {
    const isHttps = window.location.protocol === 'https:';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${BASE_URL}/test.php`, { 
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return data.status === 'online';
      }
      return false;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn("SmartAcademic: Connection timed out. Is XAMPP started?");
      } else if (isHttps) {
        // This is the most likely cause of 'Failed to fetch'
        console.error("SmartAcademic [SECURITY ALERT]: Your browser is blocking the connection because this app is HTTPS and your local server is HTTP (Mixed Content).");
        console.info("FIX: Click the 'Lock' or 'Shield' icon in your browser URL bar, go to 'Site Settings', and set 'Insecure content' to 'Allow'. Then Refresh.");
      } else {
        console.error("SmartAcademic: Network Error. Ensure C:/xampp/htdocs/smartacademic-api/ exists.", err);
      }
      return false;
    }
  },

  async fetchStudents(): Promise<Student[]> {
    try {
      const res = await fetch(`${BASE_URL}/get_students.php`, { mode: 'cors' });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async saveStudent(student: Student): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/save_student.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
        mode: 'cors'
      });
      if (!res.ok) console.error("PHP Error:", await res.text());
    } catch (err) {
      console.error("Save failed. Browser blocked the request.", err);
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/delete_student.php?id=${id}`, { 
        method: 'DELETE',
        mode: 'cors'
      });
    } catch (err) {
      console.error("Delete failed.", err);
    }
  }
};
