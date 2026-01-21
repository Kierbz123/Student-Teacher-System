
import React, { useState, useEffect, useMemo } from 'react';
import { Student, User, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { getInterventionAdvice } from '../services/gemini';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface StudentPortalProps {
  student: Student | null;
  user: User;
  onLogout: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ student, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAdvice, setAiAdvice] = useState<string>('Crunching your academic numbers...');

  useEffect(() => {
    if (student) {
      getInterventionAdvice(student).then(setAiAdvice);
    }
  }, [student]);

  const age = useMemo(() => {
    if (!user.birthday) return 'N/A';
    const birth = new Date(user.birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [user.birthday]);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Profile Not Found</h2>
          <p className="text-slate-600 mb-6 font-medium">Your School ID ({user.id}) doesn't match any records in our system. Please contact your instructor.</p>
          <button onClick={onLogout} className="text-blue-600 font-bold hover:underline transition-all hover:text-blue-800 underline-offset-4">Log Out</button>
        </div>
      </div>
    );
  }

  const assessmentData = (student.assessments || []).map(a => ({
    name: a.name,
    score: (a.score / a.maxScore) * 100,
  }));

  const absences = student.attendance.filter(a => a.status === 'Absent').length;
  const attendanceRate = student.attendance.length > 0 ? ((student.attendance.length - absences) / student.attendance.length) * 100 : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white fixed h-full flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">🎓</span> EduGuardian
          </h1>
          <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest mt-1 opacity-80">Student Portal</p>
        </div>
        
        <nav className="flex-1 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: '🏠' },
            { id: 'scores', label: 'My Scores', icon: '📝' },
            { id: 'attendance', label: 'Attendance', icon: '📅' },
            { id: 'outcome', label: 'AI Outcome', icon: '🧠' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all ${activeTab === item.id ? 'bg-indigo-900 text-white border-r-4 border-indigo-400 shadow-inner' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-indigo-900 bg-indigo-950/50">
          <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-900/40 rounded-xl border border-indigo-800">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-lg">
               {user.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
               <p className="text-[11px] font-black truncate text-white">{user.firstName} {user.lastName}</p>
               <p className="text-[9px] text-indigo-300 uppercase tracking-wider font-bold">{user.id}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-3 bg-indigo-900 hover:bg-red-900/40 hover:text-red-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-indigo-800">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-10 max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-10 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mabuhay, {student.firstName}!</h1>
            <p className="text-slate-600 font-bold mt-1">
              {student.course} • {student.block} • <span className="text-indigo-600">{user.id}</span> • {age} y/o {user.gender}
            </p>
          </div>
          <div className="scale-125 origin-top-right">
            <RiskBadge level={student.riskLevel} />
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:scale-[1.02] transition-transform">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Current Standing</p>
                <h3 className="text-4xl font-black text-slate-900">
                  {assessmentData.length > 0 ? (assessmentData.reduce((acc, a) => acc + a.score, 0) / assessmentData.length).toFixed(1) : '0'}%
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span> Class average: 78.4%
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:scale-[1.02] transition-transform">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Attendance Rate</p>
                <h3 className="text-4xl font-black text-slate-900">{attendanceRate.toFixed(1)}%</h3>
                <p className="text-xs text-slate-600 font-bold mt-2 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${absences > 0 ? 'bg-red-400' : 'bg-green-400'}`}></span> {absences} total absences
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:scale-[1.02] transition-transform">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Risk of Failing</p>
                <h3 className={`text-4xl font-black ${(student.failureProbability * 100) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {(student.failureProbability * 100).toFixed(0)}%
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Smart AI Projection
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="text-2xl">📈</span> Performance Timeline
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={assessmentData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontWeight="700" tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} fontWeight="700" domain={[0, 100]} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-300">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Assessment</th>
                  <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.assessments.map(a => (
                  <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-6 font-bold text-slate-900">{a.name}</td>
                    <td className="p-6 text-sm text-slate-700 font-medium">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{a.type}</span>
                    </td>
                    <td className="p-6 text-sm text-slate-600 font-bold">{new Date(a.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-6 text-right">
                        <div className="font-black text-indigo-700 text-lg">
                            {a.score} <span className="text-slate-300">/</span> {a.maxScore}
                        </div>
                        <span className="block text-[11px] font-black text-slate-400 tracking-wider">({((a.score/a.maxScore)*100).toFixed(0)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Scheduled Class History</h3>
              <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 uppercase tracking-widest">Official Record</div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Date</th>
                      <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Time Slot</th>
                      <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest text-center">Status</th>
                      <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {student.attendance.map((record, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 text-sm font-black text-slate-900">
                          {new Date(record.date).toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="p-6 text-sm text-slate-800 font-bold">
                          {record.time || "Regular Class"}
                        </td>
                        <td className="p-6 text-center">
                          <span className={`inline-block w-24 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
                            record.status === 'Present' ? 'bg-green-100 text-green-700 border border-green-200' :
                            record.status === 'Absent' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-6 text-[11px] text-slate-500 font-bold italic opacity-75">
                          {record.reason || "Recorded automatically."}
                        </td>
                      </tr>
                    ))}
                    {student.attendance.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-32 text-center text-slate-400 font-black uppercase tracking-widest text-sm bg-slate-50/50">
                          <span className="block text-4xl mb-4">📂</span>
                          No Attendance Records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outcome' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 rounded-[2.5rem] p-12 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden border border-white/10">
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
                  <span className="p-4 bg-white/20 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">🧠</span>
                  Smart AI Analysis
                </h3>
                <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-loose prose-p:text-slate-100 prose-p:font-medium">
                  <p className="whitespace-pre-wrap italic drop-shadow-sm">
                    {aiAdvice}
                  </p>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <span className="text-[300px] select-none">📈</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-black text-slate-900 text-xl mb-6 flex items-center gap-2">
                        <span className="text-indigo-600">🎯</span> Grade Prediction
                    </h4>
                    <p className="text-base text-slate-700 leading-relaxed font-bold">
                    Based on your trajectory in <span className="text-indigo-600">{student.course}</span>, our AI predicts your final grade will be in the <span className="bg-indigo-50 px-3 py-1 rounded-lg text-indigo-700 font-black">{(student.failureProbability > 0.5 ? 'lower' : 'upper')} 70-80%</span> range.
                    </p>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-8xl font-black">GRADES</div>
              </div>
              <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-black text-slate-900 text-xl mb-6 flex items-center gap-2">
                        <span className="text-indigo-600">⚡</span> Priority Task
                    </h4>
                    <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="text-3xl">🚀</span>
                    <div>
                        <p className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Recommended Action</p>
                        <p className="text-base text-indigo-800 font-bold leading-relaxed">
                            {student.failureProbability > 0.5 
                                ? "Critical: Attend more class sessions and review previous quizzes immediately." 
                                : "Excellent consistency! Maintain this pace to secure an honor standing."}
                        </p>
                    </div>
                    </div>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-8xl font-black">PLAN</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;
