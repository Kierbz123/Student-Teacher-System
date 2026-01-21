
import React, { useState } from 'react';
import { Student, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';

interface AlertCenterProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

const AlertCenter: React.FC<AlertCenterProps> = ({ students, onSelectStudent }) => {
  const [filterRisk, setFilterRisk] = useState<string>('All');
  
  const alertedStudents = students
    .filter(s => s.riskLevel !== RiskLevel.LOW)
    .sort((a, b) => b.failureProbability - a.failureProbability);

  const filtered = alertedStudents.filter(s => filterRisk === 'All' || s.riskLevel === filterRisk);

  const getUrgencyIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return '🚨';
      case RiskLevel.MODERATE: return '⚠️';
      case RiskLevel.EARLY_WARNING: return 'ℹ️';
      default: return '✅';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Priority Alert Center</h2>
          <p className="text-slate-600 text-sm font-bold opacity-80">Review and address critical student academic risks.</p>
        </div>
        <select 
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-6 py-3 rounded-xl border-2 border-slate-300 bg-white text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:border-blue-600 transition-all"
        >
          <option value="All">All Levels</option>
          <option value={RiskLevel.HIGH}>High Risk</option>
          <option value={RiskLevel.MODERATE}>Moderate Risk</option>
          <option value={RiskLevel.EARLY_WARNING}>Early Warning</option>
        </select>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(student => {
          const fullName = `${student.firstName} ${student.lastName}`;
          const isHigh = student.riskLevel === RiskLevel.HIGH;
          return (
            <div 
              key={student.id} 
              className={`bg-white border-2 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all transform hover:scale-[1.02] cursor-pointer ${
                isHigh ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-blue-600'
              }`}
              onClick={() => onSelectStudent(student)}
            >
              <div className="flex gap-6 items-center">
                <span className={`text-4xl p-4 rounded-3xl ${isHigh ? 'bg-red-100 shadow-inner' : 'bg-slate-100'}`}>
                    {getUrgencyIcon(student.riskLevel)}
                </span>
                <div>
                  <h3 className="font-black text-xl text-slate-900">{fullName}</h3>
                  <p className="text-sm text-slate-600 font-bold uppercase tracking-tight">{student.studentId} • {student.block} • {student.course}</p>
                  <div className="mt-3 flex gap-2">
                     <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500">
                        Prob: {(student.failureProbability * 100).toFixed(0)}%
                     </span>
                     <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${isHigh ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                        {student.riskLevel}
                     </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none bg-slate-950 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                  Intervene
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <span className="text-6xl mb-6 block drop-shadow-lg">🎉</span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">System Clear</h3>
            <p className="text-slate-500 font-bold mt-2">No critical student risks identified in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
