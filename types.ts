
export enum RiskLevel {
  LOW = 'LOW',
  EARLY_WARNING = 'EARLY_WARNING', // Tier 1 (51-65%)
  MODERATE = 'MODERATE',      // Tier 2 (66-79%)
  HIGH = 'HIGH'               // Tier 3 (80%+)
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
  password?: string;
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
  time?: string;
  status: 'Present' | 'Absent' | 'Late';
  reason?: string;
}

export interface InterventionLog {
  id: string;
  date: string;
  scheduledDate?: string;
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
  // Hierarchical Info
  university: string;
  college: string;
  course: string;
  yearLevel: number;
  block: string;
  // Guardian Info
  guardianName?: string;
  guardianContact?: string;
  guardianRelation?: string;
  
  subjects: string[];
  assessments: Assessment[];
  attendance: AttendanceRecord[];
  interventionLogs: InterventionLog[];
  failureProbability: number;
  riskLevel: RiskLevel;
  riskFlags?: {
    slipping: boolean;
    suddenDrop: boolean;
    chronicAbsentee: boolean;
  };
}
