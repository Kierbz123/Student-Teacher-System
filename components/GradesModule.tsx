
import React, { useState, useMemo } from 'react';
import { Student, Assessment } from '../types';

interface GradesModuleProps {
  students: Student[];
  onSave: (info: Omit<Assessment, 'id' | 'score'>, scores: Record<string, number>) => void;
}

const GradesModule: React.FC<GradesModuleProps> = ({ students, onSave }) => {
  const [view, setView] = useState<'entry' | 'history'>('entry');
  const [assessmentName, setAssessmentName] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [type, setType] = useState<Assessment['type']>('Quiz');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBlock, setFilterBlock] = useState('All');
  const [scores, setScores] = useState<Record<string, number>>({});

  const blocks = ['All', ...Array.from(new Set(students.map(s => s.block)))];
  const filteredStudents = students.filter(s => filterBlock === 'All' || s.block === filterBlock);

  const assessmentHistory = useMemo(() => {
    const sessions: Record<string, { name: string, type: string, max: number, date: string, avg: number, count: number }> = {};
    students.forEach(s => {
      s.assessments.forEach(a => {
        const key = `${a.name}|${a.date}`;
        if (!sessions[key]) {
          sessions[key] = { name: a.name, type: a.type, max: a.maxScore, date: a.date, avg: 0, count: 0 };
        }
        sessions[key].avg += (a.score / a.maxScore) * 100;
        sessions[key].count++;
      });
    });
    return Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date));
  }, [students]);

  const handleScoreChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setScores(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const labelClass = "text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 block ml-1";
  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-black text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none shadow-sm";

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Academic Records</h2>
          <p className="text-slate-600 text-sm font-medium">Manage student scores or review historical performance.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('entry')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'entry' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50'}`}
          >
            Entry
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50'}`}
          >
            History
          </button>
        </div>
      </header>

      {view === 'entry' ? (
        <>
          <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className={labelClass}>Assessment Name</label>
              <input type="text" className={inputClass} placeholder="e.g. Midterms" value={assessmentName} onChange={e => setAssessmentName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={type} onChange={e => setType(e.target.value as any)}>
                <option>Quiz</option><option>Exam</option><option>Project</option><option>Participation</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Max Points</label>
              <input type="number" className={inputClass} value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Class Block</label>
              <select className={inputClass} value={filterBlock} onChange={e => setFilterBlock(e.target.value)}>
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Student</th>
                  <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest text-center">Current AVG</th>
                  <th className="p-6 text-[11px] font-black text-slate-600 uppercase text-right">Score Input</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filteredStudents.map(s => {
                  const currentAvg = s.assessments.length > 0
                    ? (s.assessments.reduce((acc, a) => acc + (a.score / a.maxScore), 0) / s.assessments.length * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <p className="font-black text-slate-900">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{s.studentId}</p>
                      </td>
                      <td className="p-6 text-center text-sm text-slate-800 font-black">{currentAvg}%</td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <input 
                            type="number"
                            className="w-24 px-4 py-2 rounded-xl border-2 border-slate-300 text-right font-black text-slate-950 bg-white shadow-sm focus:border-blue-600 outline-none"
                            value={scores[s.id] || ''}
                            onChange={(e) => handleScoreChange(s.id, e.target.value)}
                          />
                          <span className="text-slate-400 font-black text-sm">/ {maxScore}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end p-4">
            <button onClick={() => { if(!assessmentName) return alert('Name assessment'); onSave({type, name: assessmentName, maxScore, date}, scores); setAssessmentName(''); setScores({}); }} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-blue-700 transition-all">Save Session</button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase">Assessment</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase">Type</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase text-center">Class AVG</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase text-right">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {assessmentHistory.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-black text-slate-900">{item.name}</td>
                  <td className="p-6"><span className="bg-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{item.type}</span></td>
                  <td className="p-6 text-center font-black text-blue-600">{(item.avg / item.count).toFixed(1)}%</td>
                  <td className="p-6 text-right font-black text-slate-400">{item.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradesModule;
