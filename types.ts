
export enum RiskLevel {
  LOW = 'LOW',
  EARLY_WARNING = 'EARLY_WARNING',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  firstName: string;
  middleName: string;
  lastName: string;
  id: string; // School ID
  role: UserRole;
  gender: string;
  birthday: string;
  email: string;
  contact: string;
  password?: string; // For security during deletion and login
}

export interface Assessment {
  id: string;
  type: 'Quiz' | 'Exam' | 'Project' | 'Participation';
  name: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface AttendanceRecord {
  date: string;
  time?: string; // e.g., "08:00 AM - 10:00 AM"
  status: 'Present' | 'Absent' | 'Late';
  reason?: string;
}

export interface InterventionLog {
  id: string;
  date: string; // When the log was created
  scheduledDate?: string; // Future meeting date/time
  type: string;
  notes: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  birthday: string;
  email: string;
  contact: string;
  course: string;
  yearLevel: number;
  block: string;
  subjects: string[];
  assessments: Assessment[];
  attendance: AttendanceRecord[];
  interventionLogs: InterventionLog[];
  failureProbability: number;
  riskLevel: RiskLevel;
}
