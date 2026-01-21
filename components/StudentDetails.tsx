
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
  const [aiAdvice, setAiAdvice] = useState<string>('Analyzing academic trajectory...');
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
    if (!logNotes) return alert('Enter consultation notes');
    onAddIntervention({ type: logType, notes: logNotes, scheduledDate });
    setLogNotes(''); setScheduledDate(''); setIsLogging(false);
    alert('Academic log entry successfully saved.');
  };

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 hover:bg-slate-200 rounded-full bg-white border-2 border-slate-300 shadow-sm font-black text-xl">←</button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
        <RiskBadge level={student.riskLevel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
              <h3 className="text-lg font-black mb-4 flex items-center gap-3"><span className="p-2 bg-blue-600 rounded-xl">🧠</span> AI Strategy</h3>
              <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap italic font-bold opacity-90">{aiAdvice}</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Log Academic Intervention</h3>
            {!isLogging ? (
              <button onClick={() => setIsLogging(true)} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest text-xs">+ Record New Session</button>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <select className="w-full p-4 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" value={logType} onChange={e => setLogType(e.target.value)}>
                  <option>Consultation</option><option>Parent Meeting</option><option>Warning Issued</option><option>Tutoring Session</option>
                </select>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Schedule Next Session</label>
                    <input type="datetime-local" className="w-full p-4 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                <textarea className="w-full p-4 h-32 rounded-xl border-2 border-slate-300 font-black bg-white text-sm focus:border-blue-600 outline-none" placeholder="Session details and takeaways..." value={logNotes} onChange={e => setLogNotes(e.target.value)} />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsLogging(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-xl border border-slate-200">Discard</button>
                  <button onClick={handleSaveLog} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl shadow-lg border border-blue-400">Save Log</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Intervention History</h3>
             <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {student.interventionLogs.slice().reverse().map(log => (
                    <div key={log.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{log.type}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(log.date).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-900 text-sm font-bold leading-relaxed">{log.notes}</p>
                        {log.scheduledDate && (
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                             <span>⏰ Next:</span>
                             <span>{new Date(log.scheduledDate).toLocaleString()}</span>
                          </div>
                        )}
                    </div>
                ))}
                {student.interventionLogs.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No history recorded.</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl h-[450px]">
            <h3 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Academic Standing Trend (%)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <YAxis domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={6} dot={{r: 10, fill: '#2563eb', strokeWidth: 5, stroke: '#fff'}} activeDot={{r: 12}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-blue-600 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Profile Metrics</h3>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Course Track</p>
                      <p className="text-lg font-black">{student.course}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Block/Section</p>
                      <p className="text-lg font-black">{student.block}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Year Level</p>
                      <p className="text-lg font-black">{student.yearLevel}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Assessments</p>
                      <p className="text-lg font-black">{student.assessments.length}</p>
                   </div>
                </div>
             </div>
             <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🎓</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
