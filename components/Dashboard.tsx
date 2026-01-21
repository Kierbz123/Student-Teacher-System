
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Student, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { getClassOverviewSummary } from '../services/gemini';

interface DashboardProps {
  students: Student[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, onNavigate }) => {
  const [aiSummary, setAiSummary] = useState<string>('Analyzing class performance...');

  const atRiskStudents = students.filter(s => s.riskLevel !== RiskLevel.LOW);
  const avgPerformance = students.length > 0 ? students.reduce((acc, s) => {
    const sAvg = s.assessments.length > 0 ? s.assessments.reduce((sum, a) => sum + (a.score / a.maxScore), 0) / s.assessments.length : 0.75;
    return acc + sAvg;
  }, 0) / students.length : 0;

  const attendanceRate = students.length > 0 ? students.reduce((acc, s) => {
    const present = s.attendance ? s.attendance.filter(a => a.status === 'Present').length : 0;
    const total = s.attendance?.length || 1;
    return acc + (present / total);
  }, 0) / students.length : 1;

  const riskData = [
    { name: 'Low', value: students.filter(s => s.riskLevel === RiskLevel.LOW).length, color: '#22c55e' },
    { name: 'Early Warning', value: students.filter(s => s.riskLevel === RiskLevel.EARLY_WARNING).length, color: '#eab308' },
    { name: 'Moderate', value: students.filter(s => s.riskLevel === RiskLevel.MODERATE).length, color: '#f97316' },
    { name: 'High', value: students.filter(s => s.riskLevel === RiskLevel.HIGH).length, color: '#ef4444' },
  ];

  useEffect(() => {
    if (students.length > 0) {
      getClassOverviewSummary(students).then(setAiSummary);
    } else {
      setAiSummary("No student data available to analyze yet.");
    }
  }, [students]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Academic Overview</h2>
          <p className="text-slate-500 text-sm">Real-time performance metrics and predictive insights.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('grades')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Entry Scores
          </button>
          <button 
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Mark Attendance
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, sub: 'All blocks', icon: '👥', action: () => onNavigate('students') },
          { label: 'Avg. Score', value: `${(avgPerformance * 100).toFixed(1)}%`, sub: 'Current standing', icon: '📈', action: () => onNavigate('grades') },
          { label: 'Attendance', value: `${(attendanceRate * 100).toFixed(1)}%`, sub: 'Daily average', icon: '✅', action: () => onNavigate('attendance') },
          { label: 'At-Risk', value: atRiskStudents.length, sub: 'Needs attention', icon: '🚨', alert: atRiskStudents.length > 0, action: () => onNavigate('alerts') },
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={stat.action}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left hover:border-blue-300 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <span className={`text-2xl p-2 rounded-lg group-hover:scale-110 transition-transform ${stat.alert ? 'bg-red-50' : 'bg-slate-50'}`}>{stat.icon}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Student Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-blue-400">✨</span> AI Strategy Insight
            </h3>
            <div className="prose prose-invert prose-sm max-h-64 overflow-y-auto">
              <p className="text-slate-300 leading-relaxed italic whitespace-pre-wrap">
                "{aiSummary}"
              </p>
            </div>
          </div>
          <div className="mt-6 z-10">
            <button 
              onClick={() => onNavigate('alerts')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors shadow-lg"
            >
              Action Priorities
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <span className="text-9xl">🧠</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Priority Alerts</h3>
          <button onClick={() => onNavigate('alerts')} className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {atRiskStudents.slice(0, 5).map(student => {
            // Construct full name as Student interface lacks fullName property
            const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
            return (
              <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {student.firstName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{fullName}</h4>
                    <p className="text-xs text-slate-500">{student.studentId} • {student.block}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{(student.failureProbability * 100).toFixed(0)}% Risk</p>
                    <p className="text-xs text-slate-400">Fail probability</p>
                  </div>
                  <RiskBadge level={student.riskLevel} />
                </div>
              </div>
            );
          })}
          {atRiskStudents.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <p>No high-risk alerts found. Class is performing well!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
