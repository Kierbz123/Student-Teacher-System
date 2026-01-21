
import React, { useState, useEffect } from 'react';
import { Student, InterventionLog } from '../types';
import { RiskBadge } from './RiskBadge';
import { getInterventionAdvice, getCommunicationTemplate } from '../services/gemini';
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
  const [commTemplate, setCommTemplate] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logType, setLogType] = useState('Consultation');
  const [scheduledDate, setScheduledDate] = useState('');
  const [activeTab, setActiveTab] = useState<'performance' | 'outreach'>('performance');

  useEffect(() => {
    getInterventionAdvice(student).then(setAiAdvice);
  }, [student]);

  const assessmentData = (student.assessments || []).map(a => ({
    name: a.name, score: (a.score / a.maxScore) * 100,
  }));

  const handleSaveLog = () => {
    if (!logNotes) return alert('Please enter meeting notes.');
    onAddIntervention({ type: logType, notes: logNotes, scheduledDate });
    setLogNotes(''); 
    setScheduledDate(''); 
    setIsLogging(false);
  };

  const handleGenerateTemplate = async (channel: 'SMS' | 'Email') => {
    setCommTemplate('Drafting localized message...');
    const t = await getCommunicationTemplate(student, channel);
    setCommTemplate(t);
  };

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 hover:bg-slate-200 rounded-2xl bg-white border-2 border-slate-300 shadow-sm font-black text-xl transition-all active:scale-90 flex items-center justify-center">←</button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{student.studentId} • {student.block}</p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl border-2 border-slate-300">
          <button onClick={() => setActiveTab('performance')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Metrics</button>
          <button onClick={() => setActiveTab('outreach')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'outreach' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Outreach</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* AI Strategy Box */}
          <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
              <h3 className="text-lg font-black mb-4 flex items-center gap-3"><span className="p-2 bg-blue-600 rounded-xl text-sm">🧠</span> AI Strategy</h3>
              <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap italic font-bold opacity-90">"{aiAdvice}"</div>
              
              {/* Risk Flags Display */}
              <div className="mt-6 flex flex-wrap gap-2">
                {student.riskFlags?.slipping && <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 text-[9px] font-black uppercase rounded-lg border border-yellow-700/50">📉 Slipping Trend</span>}
                {student.riskFlags?.suddenDrop && <span className="px-3 py-1 bg-red-900/50 text-red-400 text-[9px] font-black uppercase rounded-lg border border-red-700/50">🚨 Sudden Drop</span>}
                {student.riskFlags?.chronicAbsentee && <span className="px-3 py-1 bg-orange-900/50 text-orange-400 text-[9px] font-black uppercase rounded-lg border border-orange-700/50">📅 Chronic Absentee</span>}
              </div>
          </div>

          {activeTab === 'performance' ? (
            <>
              {/* Logger */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">Academic Consultation</h3>
                {!isLogging ? (
                  <button onClick={() => setIsLogging(true)} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest text-xs">+ Log Record</button>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-top-4">
                    <select className="w-full p-4 rounded-xl border-2 border-slate-300 font-black text-sm bg-white" value={logType} onChange={e => setLogType(e.target.value)}>
                      <option>Consultation</option><option>Parent Meeting</option><option>Home Visit</option>
                    </select>
                    <textarea className="w-full p-4 h-24 rounded-xl border-2 border-slate-300 font-black text-sm bg-slate-50" placeholder="Notes..." value={logNotes} onChange={e => setLogNotes(e.target.value)} />
                    <button onClick={handleSaveLog} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs">Save</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl space-y-6">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Parental Outreach</h3>
               <div className="flex gap-2">
                 <button onClick={() => handleGenerateTemplate('SMS')} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Generate SMS</button>
                 <button onClick={() => handleGenerateTemplate('Email')} className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-xl font-black text-[10px] border border-slate-300 uppercase tracking-widest">Generate Email</button>
               </div>
               {commTemplate && (
                 <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 text-sm font-bold text-slate-900 leading-relaxed italic animate-in fade-in duration-500">
                    {commTemplate}
                    <button onClick={() => {navigator.clipboard.writeText(commTemplate); alert('Copied to clipboard');}} className="mt-4 block text-[9px] font-black text-blue-600 uppercase tracking-widest underline underline-offset-4">Copy Message</button>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl h-[400px]">
            <h3 className="text-base font-black text-slate-900 mb-8 tracking-tight uppercase">Performance Trajectory</h3>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <YAxis domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius:'1.5rem', fontWeight:'bold', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={5} dot={{r: 8, fill: '#2563eb', strokeWidth: 3, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl flex flex-col h-[400px]">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-6">Recent Assessments</h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                   {student.assessments.slice().reverse().map(a => (
                     <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div>
                           <p className="font-black text-slate-900 text-sm truncate">{a.name}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">{a.type}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-blue-600 text-sm">{a.score}/{a.maxScore}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">({((a.score/a.maxScore)*100).toFixed(0)}%)</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl flex flex-col h-[400px]">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-6">Consultation History</h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                   {student.interventionLogs.slice().reverse().map(log => (
                     <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">{log.type}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] font-bold leading-relaxed italic">"{log.notes}"</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
