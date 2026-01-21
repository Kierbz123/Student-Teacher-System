
import React, { useState, useEffect, useMemo } from 'react';
import { Student, InterventionLog } from '../types';
import { RiskBadge } from './RiskBadge';
import { getInterventionAdvice } from '../services/gemini';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
  onAddIntervention: (log: Omit<InterventionLog, 'id' | 'date'>) => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onBack, onAddIntervention }) => {
  const [aiAdvice, setAiAdvice] = useState<string>('Synthesizing academic trajectory...');
  const [isLogging, setIsLogging] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logType, setLogType] = useState('Consultation');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    getInterventionAdvice(student).then(setAiAdvice);
  }, [student]);

  const assessmentData = (student.assessments || []).map(a => ({
    name: a.name, score: (a.score / a.maxScore) * 100,
  }));

  const handleSaveLog = () => {
    if (!logNotes) return alert('Please enter meeting notes before saving.');
    onAddIntervention({ type: logType, notes: logNotes, scheduledDate });
    setLogNotes(''); 
    setScheduledDate(''); 
    setIsLogging(false);
    alert('Academic log entry successfully recorded.');
  };

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 hover:bg-slate-200 rounded-full bg-white border-2 border-slate-300 shadow-sm font-black text-xl transition-all active:scale-90">←</button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
        <RiskBadge level={student.riskLevel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* AI STRATEGY INSIGHT */}
          <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
              <h3 className="text-lg font-black mb-4 flex items-center gap-3"><span className="p-2 bg-blue-600 rounded-xl">🧠</span> AI Strategy</h3>
              <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap italic font-bold opacity-90">{aiAdvice}</div>
          </div>

          {/* INTERVENTION LOGGER */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">New Consultation Record</h3>
            {!isLogging ? (
              <button onClick={() => setIsLogging(true)} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest text-xs">+ Log Meeting</button>
            ) : (
              <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
                <select className="w-full p-4 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" value={logType} onChange={e => setLogType(e.target.value)}>
                  <option>Consultation</option>
                  <option>Parent Meeting</option>
                  <option>Warning Issued</option>
                  <option>Academic Support</option>
                </select>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sched Next Follow-up</label>
                    <input type="datetime-local" className="w-full p-4 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                <textarea className="w-full p-4 h-32 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" placeholder="Enter session notes..." value={logNotes} onChange={e => setLogNotes(e.target.value)} />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsLogging(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-xl border border-slate-200">Discard</button>
                  <button onClick={handleSaveLog} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl shadow-lg border border-blue-400">Save Record</button>
                </div>
              </div>
            )}
          </div>

          {/* CONSULTATION HISTORY */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Meeting History</h3>
             <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {student.interventionLogs.slice().reverse().map(log => (
                    <div key={log.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{log.type}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(log.date).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-900 text-sm font-bold leading-relaxed">{log.notes}</p>
                        {log.scheduledDate && (
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                             <span>⏰ Next Session:</span>
                             <span>{new Date(log.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        )}
                    </div>
                ))}
                {student.interventionLogs.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase text-slate-400 tracking-widest italic opacity-50">No historical records.</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* ACADEMIC CHART */}
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl h-[450px]">
            <h3 className="text-xl font-black text-slate-900 mb-10 tracking-tight uppercase">Performance Trajectory (%)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <YAxis domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius:'1.5rem', fontWeight:'bold'}} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={6} dot={{r: 10, fill: '#2563eb', strokeWidth: 5, stroke: '#fff'}} activeDot={{r: 12}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* COMPLETE RECORDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* SCORE HISTORY */}
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col h-[450px]">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 flex justify-between items-center px-2">
                   Score Audit History
                   <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400 font-black">{student.assessments.length} Records</span>
                </h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {student.assessments.slice().reverse().map(a => (
                     <div key={a.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 flex justify-between items-center hover:scale-[1.02] transition-all">
                        <div className="max-w-[60%]">
                           <p className="font-black text-slate-900 text-sm truncate">{a.name}</p>
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">{a.type} • {a.date}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-blue-600 text-base">{a.score} / {a.maxScore}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">({((a.score/a.maxScore)*100).toFixed(0)}%)</p>
                        </div>
                     </div>
                   ))}
                   {student.assessments.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-[10px]">No scores recorded yet.</p>}
                </div>
             </div>

             {/* ATTENDANCE HISTORY */}
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col h-[450px]">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 flex justify-between items-center px-2">
                   Attendance Log
                   <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400 font-black">{student.attendance.length} Records</span>
                </h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {student.attendance.slice().reverse().map((rec, i) => (
                     <div key={i} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 flex justify-between items-center hover:scale-[1.02] transition-all">
                        <div className="max-w-[60%]">
                           <p className="font-black text-slate-900 text-sm">{new Date(rec.date).toLocaleDateString([], {month:'short', day:'numeric', year:'numeric'})}</p>
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">{rec.time || 'Class Session'}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border-2 ${
                          rec.status === 'Present' ? 'bg-green-600 text-white border-green-500' :
                          rec.status === 'Absent' ? 'bg-red-600 text-white border-red-500' : 'bg-yellow-500 text-white border-yellow-400'
                        }`}>
                          {rec.status}
                        </span>
                     </div>
                   ))}
                   {student.attendance.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-[10px]">No attendance recorded yet.</p>}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
