
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";

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

export const getClassOverviewSummary = async (students: Student[]) => {
  const stats = {
    total: students.length,
    highRisk: students.filter(s => s.riskLevel === 'HIGH').length,
    modRisk: students.filter(s => s.riskLevel === 'MODERATE' || s.riskLevel === 'EARLY_WARNING').length,
  };

  const prompt = `
    Class stats: ${stats.total} total, ${stats.highRisk} High Risk, ${stats.modRisk} Mid Risk.
    Provide a one-sentence tactical summary. Very short.
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
