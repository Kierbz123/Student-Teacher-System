
import { Student, Assessment, AttendanceRecord, RiskLevel } from '../types';
import { PASSING_THRESHOLD, ATTENDANCE_LIMIT } from '../constants';

export const calculateStudentRisk = (student: Student): { probability: number; level: RiskLevel; flags: Student['riskFlags'] } => {
  let gradeFactor = 0;
  let slipping = false;
  let suddenDrop = false;
  let chronicAbsentee = false;

  // 1. Grade Analysis (60% weight)
  if (student.assessments.length > 0) {
    const scores = student.assessments.map(a => a.score / a.maxScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Base grade factor: distance from passing
    if (avgScore < PASSING_THRESHOLD) {
      gradeFactor = Math.min(1, (PASSING_THRESHOLD - avgScore) / PASSING_THRESHOLD * 2);
    }

    // Trend Analysis (Last 5)
    if (scores.length >= 2) {
      const last = scores[scores.length - 1];
      const prev = scores[scores.length - 2];
      
      // Sudden Drop Check
      if (prev - last > 0.20) {
        suddenDrop = true;
        gradeFactor = Math.min(1, gradeFactor + 0.3);
      }

      // Slipping Check (Last 3 descending)
      if (scores.length >= 3) {
        const last3 = scores.slice(-3);
        if (last3[0] > last3[1] && last3[1] > last3[2]) {
          slipping = true;
          gradeFactor = Math.min(1, gradeFactor + 0.15);
        }
      }
    }
  }

  // 2. Attendance Analysis (40% weight)
  let attendanceFactor = 0;
  if (student.attendance.length > 0) {
    const totalDays = student.attendance.length;
    const absences = student.attendance.filter(a => a.status === 'Absent').length;
    const lates = student.attendance.filter(a => a.status === 'Late').length;
    
    const effectiveAbsenceRate = (absences + (lates * 0.33)) / totalDays;
    
    if (effectiveAbsenceRate > ATTENDANCE_LIMIT) {
      chronicAbsentee = true;
      attendanceFactor = Math.min(1, effectiveAbsenceRate / ATTENDANCE_LIMIT);
    } else if (effectiveAbsenceRate > ATTENDANCE_LIMIT / 2) {
      attendanceFactor = 0.4;
    }

    // Pattern Detection: Consecutive Absences
    const last3Attendance = student.attendance.slice(-3);
    if (last3Attendance.length === 3 && last3Attendance.every(a => a.status === 'Absent')) {
      attendanceFactor = Math.min(1, attendanceFactor + 0.2);
    }
  }

  const riskScore = (gradeFactor * 0.6) + (attendanceFactor * 0.4);
  
  let level = RiskLevel.LOW;
  if (riskScore >= 0.80) level = RiskLevel.HIGH;
  else if (riskScore >= 0.66) level = RiskLevel.MODERATE;
  else if (riskScore >= 0.51) level = RiskLevel.EARLY_WARNING;

  return { 
    probability: riskScore, 
    level, 
    flags: { slipping, suddenDrop, chronicAbsentee } 
  };
};
