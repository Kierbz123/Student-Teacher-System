
import { Student, Assessment, AttendanceRecord, RiskLevel } from '../types';
import { PASSING_THRESHOLD, ATTENDANCE_LIMIT } from '../constants';

export const calculateStudentRisk = (student: Student): { probability: number; level: RiskLevel } => {
  // 1. Grade Analysis (60% weight)
  let gradeFactor = 0;
  if (student.assessments.length > 0) {
    const totalScore = student.assessments.reduce((sum, a) => sum + (a.score / a.maxScore), 0);
    const avgScore = totalScore / student.assessments.length;
    
    // Calculate distance from passing threshold
    if (avgScore < PASSING_THRESHOLD) {
      gradeFactor = Math.min(1, (PASSING_THRESHOLD - avgScore) / PASSING_THRESHOLD * 2);
    } else {
      gradeFactor = 0;
    }

    // Trend analysis: if last score is significantly lower than average
    const lastAssessment = student.assessments[student.assessments.length - 1];
    const lastScoreRatio = lastAssessment.score / lastAssessment.maxScore;
    if (lastScoreRatio < avgScore - 0.15) {
      gradeFactor = Math.min(1, gradeFactor + 0.2);
    }
  }

  // 2. Attendance Analysis (40% weight)
  let attendanceFactor = 0;
  if (student.attendance.length > 0) {
    const totalDays = student.attendance.length;
    const absences = student.attendance.filter(a => a.status === 'Absent').length;
    const lates = student.attendance.filter(a => a.status === 'Late').length;
    
    const effectiveAbsences = absences + (lates * 0.33);
    const absenceRate = effectiveAbsences / totalDays;
    
    if (absenceRate > ATTENDANCE_LIMIT) {
      attendanceFactor = Math.min(1, absenceRate / ATTENDANCE_LIMIT);
    } else if (absenceRate > ATTENDANCE_LIMIT / 2) {
      attendanceFactor = 0.5;
    }
  }

  const riskScore = (gradeFactor * 0.6) + (attendanceFactor * 0.4);
  
  let level = RiskLevel.LOW;
  if (riskScore >= 0.80) level = RiskLevel.HIGH;
  else if (riskScore >= 0.66) level = RiskLevel.MODERATE;
  else if (riskScore >= 0.51) level = RiskLevel.EARLY_WARNING;

  return { probability: riskScore, level };
};
