
import { GoogleGenAI } from "@google/genai";
import { Student, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInterventionAdvice = async (student: Student) => {
  const fullName = `${student.firstName} ${student.lastName}`;
  const prompt = `
    Student: ${fullName} (${student.riskLevel} Risk, ${(student.failureProbability * 100).toFixed(1)}% prob).
    Assessments: ${student.assessments.slice(-3).map(a => `${a.name}: ${a.score}/${a.maxScore}`).join(', ')}.
    Absences: ${student.attendance.filter(a => a.status === 'Absent').length}.

    TASK: Provide an ULTRA-SHORT intervention strategy (max 40 words). 
    Strictly follow this format:
    - CAUSE: [short cause]
    - ACTION: [one clear step]
    - MESSAGE: [one-line for student]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Focus on attendance consistency and core concept review. Schedule a quick 1-on-1 meeting.";
  }
};

export const getCommunicationTemplate = async (student: Student, channel: 'SMS' | 'Email') => {
  const fullName = `${student.firstName} ${student.lastName}`;
  const riskTier = student.riskLevel === RiskLevel.HIGH ? "Red (Tier 3)" : student.riskLevel === RiskLevel.MODERATE ? "Yellow (Tier 2)" : "Early Warning (Tier 1)";
  
  const prompt = `
    Create a ${channel} template for a parent in a Philippine school context.
    Student: ${fullName}. Risk: ${riskTier}.
    Language: Professional English with a polite, helpful Filipino tone.
    Subject: Student Performance Update.
    The message should be supportive but clear about the academic concern.
    Length: Short.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return `Dear Parent, this is regarding ${fullName}'s current performance. We would like to schedule a consultation to discuss support strategies. Thank you.`;
  }
};

export const getClassOverviewSummary = async (students: Student[]) => {
  const stats = {
    total: students.length,
    highRisk: students.filter(s => s.riskLevel === 'HIGH').length,
    modRisk: students.filter(s => s.riskLevel === 'MODERATE' || s.riskLevel === 'EARLY_WARNING').length,
  };

  const prompt = `
    Class stats: ${stats.total} total, ${stats.highRisk} High Risk, ${stats.modRisk} Mid Risk.
    Provide a one-sentence tactical summary for the teacher.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Prioritize immediate outreach to high-risk students to prevent academic withdrawal.";
  }
};
