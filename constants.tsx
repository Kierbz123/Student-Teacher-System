
import { Student, RiskLevel } from './types';

export const PASSING_THRESHOLD = 0.75; // 75%
export const ATTENDANCE_LIMIT = 0.20; // 20% absence allowed

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    studentId: '2021-00123',
    firstName: 'Juan',
    middleName: 'Miguel',
    lastName: 'Dela Cruz',
    gender: 'Male',
    birthday: '2002-05-15',
    email: 'juan.delacruz@university.edu.ph',
    contact: '09171234567',
    // Added missing hierarchical info to fix TS error
    university: 'University of the Philippines',
    college: 'College of Engineering',
    course: 'BS Information Technology',
    yearLevel: 3,
    block: 'IT3-A',
    subjects: ['Advanced Database', 'Software Engineering', 'AI Fundamentals'],
    assessments: [
      { id: 'q1', type: 'Quiz', name: 'Quiz 1', score: 85, maxScore: 100, date: '2023-10-01' },
      { id: 'q2', type: 'Quiz', name: 'Quiz 2', score: 45, maxScore: 100, date: '2023-10-15' },
      { id: 'e1', type: 'Exam', name: 'Midterm', score: 55, maxScore: 100, date: '2023-11-05' },
    ],
    attendance: [
      { date: '2023-10-01', status: 'Present' },
      { date: '2023-10-02', status: 'Absent', reason: 'Fever' },
      { date: '2023-10-03', status: 'Absent' },
      { date: '2023-10-04', status: 'Absent' },
    ],
    interventionLogs: [],
    failureProbability: 0.62,
    riskLevel: RiskLevel.EARLY_WARNING
  }
];
