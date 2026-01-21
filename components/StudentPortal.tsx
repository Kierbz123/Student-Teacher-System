
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
  const [aiAdvice, setAiAdvice] = useState<string>('Analyzing your academic trajectory...');

  useEffect(() => {
    if (student) {
      getInterventionAdvice(student).then(setAiAdvice);
    }
  }, [student]);

  const assessmentData = (student?.assessments || []).map(a => ({
    name: a.name,
    score: (a.score / a.maxScore) * 100,
  }));

  const absences = student?.attendance.filter(a => a.status === 'Absent').length || 0;
  const attendanceRate = student && student.attendance.length > 0 ? ((student.attendance.length - absences) / student.attendance.length) * 100 : 100;

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-black mb-2 text-slate-900 uppercase tracking-tight">Record Not Found</h2>
          <p className="text-slate-600 mb-6 font-bold leading-relaxed">Your account (ID: {user.id}) is registered, but no student records were found. Please contact the Faculty Head.</p>
          <button onClick={onLogout} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Back to Entrance</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white fixed h-full flex flex-col shadow-2xl z-20 overflow-hidden">
        <div className="p-8">
          <h1 className="text-xl font-black flex items-center gap-2">
            <span className="text-indigo-400">🎓</span> EduGuardian
          </h1>
          <p className="text-[9px] text-indigo-200 uppercase font-black tracking-[0.2em] mt-1 opacity-70">Student Learning Portal</p>
        </div>
        
        <nav className="flex-1 mt-4">
          {[
            { id: 'overview', label: 'Dashboard', icon: '🏠' },
            { id: 'scores', label: 'My Grades', icon: '📝' },
            { id: 'attendance', label: 'Attendance', icon: '📅' },
            { id: 'outcome', label: 'AI Outcome', icon: '🧠' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-8 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-indigo-900 text-white border-r-4 border-indigo-400 shadow-inner' : 'text-indigo-300/60 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-indigo-900 bg-indigo-950/50">
          <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-900/40 rounded-2xl border border-indigo-800">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-lg border-2 border-indigo-400">
               {user.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
               <p className="text-[10px] font-black truncate text-white uppercase">{user.firstName}</p>
               <p className="text-[9px] text-indigo-400 font-bold tracking-tighter">{user.id}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-4 bg-red-900/20 hover:bg-red-900/50 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-900/30">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 ml-64 p-10 max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mabuhay, {student.firstName}! 🇵🇭</h1>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
                {student.course} • Block {student.block}
             </p>
          </div>
          <div className="scale-125">
             <RiskBadge level={student.riskLevel} />
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Current Average', value: assessmentData.length > 0 ? (assessmentData.reduce((acc, a) => acc + a.score, 0) / assessmentData.length).toFixed(1) + '%' : 'N/A', sub: 'Target: 75%', icon: '📈' },
                  { label: 'Attendance Rate', value: attendanceRate.toFixed(1) + '%', sub: `${absences} Absences`, icon: '📅' },
                  { label: 'AI Risk Score', value: (student.failureProbability * 100).toFixed(0) + '%', sub: 'Tier Analysis', icon: '🧠' }
                ].map((card, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                     <h3 className="text-4xl font-black text-slate-900">{card.value}</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">{card.sub}</p>
                     <span className="absolute top-6 right-8 text-3xl opacity-20 group-hover:scale-125 transition-transform">{card.icon}</span>
                  </div>
                ))}
             </div>

             <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-10 uppercase tracking-widest flex items-center gap-3">
                   <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">📉</span> Academic Progress Matrix
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={assessmentData}>
                      <defs>
                        <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis domain={[0, 100]} fontSize={10} fontWeight="900" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{borderRadius: '20px', border:'none', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight:'bold'}} />
                      <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={5} fill="url(#colorPortal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-right-4">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                      <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Assessment Name</th>
                      <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Raw Result</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {student.assessments.map(a => (
                     <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-8 font-black text-slate-900 text-sm">{a.name}</td>
                        <td className="p-8"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-slate-500">{a.type}</span></td>
                        <td className="p-8"><span className={`text-[10px] font-black uppercase ${a.score/a.maxScore >= 0.75 ? 'text-green-600' : 'text-red-600'}`}>{a.score/a.maxScore >= 0.75 ? 'PASSED' : 'REMEDIAL'}</span></td>
                        <td className="p-8 text-right">
                           <span className="font-black text-indigo-700 text-lg">{a.score} / {a.maxScore}</span>
                           <span className="block text-[10px] font-bold text-slate-400">({((a.score/a.maxScore)*100).toFixed(0)}%)</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'outcome' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
             <div className="bg-indigo-950 text-white p-12 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(49,46,129,0.5)] border border-white/10 relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
                      <span className="p-4 bg-indigo-500 rounded-3xl shadow-lg border border-indigo-400">✨</span>
                      AI Behavioral Insight
                   </h3>
                   <div className="prose prose-invert max-w-none">
                      <p className="text-xl font-bold leading-relaxed italic opacity-90 text-indigo-50">
                        "{aiAdvice}"
                      </p>
                   </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-[0.05] pointer-events-none">
                   <span className="text-[300px] font-black select-none">RESULT</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                   <h4 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-3"><span className="text-2xl">🎯</span> Grade Prediction</h4>
                   <p className="text-base text-slate-600 font-bold leading-relaxed">
                      Our system projects your final mark to be approximately <span className="text-indigo-600 font-black">{Math.max(70, (100 - (student.failureProbability * 40))).toFixed(0)}%</span>.
                      {student.failureProbability > 0.5 ? " We recommend immediate coordination with your subject instructor." : " Keep up the great consistency!"}
                   </p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                   <h4 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-3"><span className="text-2xl">💡</span> Quick Tip</h4>
                   <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                      <span className="text-2xl">⚡</span>
                      <div>
                         <p className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Recommended Action</p>
                         <p className="text-sm font-bold text-indigo-700 leading-relaxed">
                            {student.riskFlags?.slipping ? "Focus on reviewing previous failed quizzes to reverse the sliding trend." : student.riskFlags?.chronicAbsentee ? "Improve your attendance to recover missing participation points." : "Maintain your study routine and participate more in class discussions."}
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;
