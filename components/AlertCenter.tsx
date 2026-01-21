
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

  const getTierInfo = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return { tier: '🚨 Tier 3: HIGH RISK', color: 'bg-red-600', text: 'Critical academic failure likely without immediate intervention.' };
      case RiskLevel.MODERATE: return { tier: '⚠️ Tier 2: MODERATE RISK', color: 'bg-orange-600', text: 'Consistent decline in performance or attendance detected.' };
      case RiskLevel.EARLY_WARNING: return { tier: 'ℹ️ Tier 1: EARLY WARNING', color: 'bg-yellow-600', text: 'Showing first signs of academic or attendance risk.' };
      default: return { tier: '', color: '', text: '' };
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Priority Alert Center</h2>
          <p className="text-slate-600 text-sm font-bold opacity-80">Three-Tier Predictive Risk Monitoring System</p>
        </div>
        <select 
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-6 py-3 rounded-2xl border-2 border-slate-300 bg-white text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-blue-600 transition-all cursor-pointer"
        >
          <option value="All">All Tiers</option>
          <option value={RiskLevel.HIGH}>Tier 3 (High)</option>
          <option value={RiskLevel.MODERATE}>Tier 2 (Mod)</option>
          <option value={RiskLevel.EARLY_WARNING}>Tier 1 (Early)</option>
        </select>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(student => {
          const tierInfo = getTierInfo(student.riskLevel);
          const fullName = `${student.firstName} ${student.lastName}`;
          const isHigh = student.riskLevel === RiskLevel.HIGH;

          return (
            <div 
              key={student.id} 
              className={`bg-white border-2 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all transform hover:scale-[1.01] cursor-pointer ${
                isHigh ? 'border-red-500 bg-red-50/10 shadow-red-100' : 'border-slate-200'
              }`}
              onClick={() => onSelectStudent(student)}
            >
              <div className="flex gap-6 items-center">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl ${tierInfo.color}`}>
                   {student.riskLevel === RiskLevel.HIGH ? '3' : student.riskLevel === RiskLevel.MODERATE ? '2' : '1'}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900">{fullName}</h3>
                  <div className="flex gap-2 items-center mb-1">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isHigh ? 'text-red-600' : 'text-slate-600'}`}>{tierInfo.tier}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span className="text-[10px] font-black uppercase text-slate-500">{student.studentId} • {student.block}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-md">{tierInfo.text}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                 <div className="text-right">
                    <p className={`text-2xl font-black ${isHigh ? 'text-red-600' : 'text-slate-900'}`}>{(student.failureProbability * 100).toFixed(0)}%</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Failure Prob</p>
                 </div>
                 <button className="w-full md:w-auto px-10 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                    Intervene
                 </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
            <span className="text-6xl mb-6 block">🛡️</span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No Alerts Active</h3>
            <p className="text-slate-500 font-bold mt-2">EduGuardian is monitoring all students. No Tier 1-3 risks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
