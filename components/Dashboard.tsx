
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
  onSelectStudent?: (student: Student) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, onNavigate, onSelectStudent }) => {
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">EduGuardian Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium">Philippine Academic Performance Monitoring System</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('database')}
            className="w-10 h-10 bg-white text-slate-900 border-2 border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            💾
          </button>
          <button 
            onClick={() => onNavigate('grades')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
          >
            Enter Scores
          </button>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Students', value: students.length, sub: 'Total Population', icon: '👥', action: () => onNavigate('students') },
          { label: 'Class Average', value: `${(avgPerformance * 100).toFixed(1)}%`, sub: 'Target: 75%+', icon: '📈', action: () => onNavigate('grades') },
          { label: 'Attendance', value: `${(attendanceRate * 100).toFixed(1)}%`, sub: 'Daily Presence', icon: '✅', action: () => onNavigate('attendance') },
          { label: 'At-Risk', value: atRiskStudents.length, sub: 'Tier 1, 2, 3', icon: '🚨', alert: atRiskStudents.length > 0, action: () => onNavigate('alerts') },
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={stat.action}
            className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm text-left hover:border-blue-400 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black mt-1 text-slate-900">{stat.value}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{stat.sub}</p>
              </div>
              <span className={`text-2xl p-3 rounded-2xl group-hover:scale-110 transition-transform ${stat.alert ? 'bg-red-50' : 'bg-slate-50'}`}>{stat.icon}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Heat Map - NEW FEATURE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-black uppercase tracking-tight">Risk Heat Map</h3>
             <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" title="Low Risk"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500" title="Tier 1"></span>
                <span className="w-3 h-3 rounded-full bg-orange-500" title="Tier 2"></span>
                <span className="w-3 h-3 rounded-full bg-red-500" title="Tier 3"></span>
             </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectStudent?.(s)}
                className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg ${
                  s.riskLevel === RiskLevel.HIGH ? 'bg-red-500 border-red-600' :
                  s.riskLevel === RiskLevel.MODERATE ? 'bg-orange-500 border-orange-600' :
                  s.riskLevel === RiskLevel.EARLY_WARNING ? 'bg-yellow-500 border-yellow-600' :
                  'bg-green-500 border-green-600'
                }`}
                title={`${s.firstName} ${s.lastName}: ${(s.failureProbability * 100).toFixed(0)}% Risk`}
              />
            ))}
            {students.length === 0 && <div className="col-span-full py-10 text-center text-slate-300 font-black uppercase tracking-widest">No Student Data</div>}
          </div>
          <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest text-center italic">Visual grid representing student population risk distribution</p>
        </div>

        {/* AI Insight Box */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-black mb-4 flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-xl">✨</span> AI Strategy
            </h3>
            <div className="prose prose-invert prose-sm">
              <p className="text-slate-300 font-bold leading-relaxed italic opacity-90">
                "{aiSummary}"
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('alerts')}
            className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl"
          >
            See Priorities
          </button>
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <span className="text-9xl">🧠</span>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Score & Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', fontWeight: 'bold'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
