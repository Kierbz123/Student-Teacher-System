
import React, { useState } from 'react';
import { Student, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenAdd: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, onDeleteStudent, onOpenAdd }) => {
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');

  const blocks = ['All', ...Array.from(new Set(students.map(s => s.block)))];
  const risks = ['All', ...Object.values(RiskLevel)];

  const filtered = students.filter(s => {
    const fullName = `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || s.studentId.includes(search);
    const matchesBlock = filterBlock === 'All' || s.block === filterBlock;
    const matchesRisk = filterRisk === 'All' || s.riskLevel === filterRisk;
    return matchesSearch && matchesBlock && matchesRisk;
  });

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-500 shadow-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-slate-600 font-medium">Manage all student profiles and academic records.</p>
        </div>
        <button 
          onClick={onOpenAdd}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          + Add New Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Search Student</label>
          <input 
            type="text" 
            placeholder="Search by name or student ID..."
            className={inputClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Filter Block</label>
          <select 
            className={inputClass + " cursor-pointer"}
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
          >
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Risk Status</label>
          <select 
            className={inputClass + " cursor-pointer"}
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            {risks.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="p-5 text-[11px] font-black text-slate-600 uppercase tracking-widest">Student Information</th>
                <th className="p-5 text-[11px] font-black text-slate-600 uppercase tracking-widest">ID / Section</th>
                <th className="p-5 text-[11px] font-black text-slate-600 uppercase tracking-widest">Risk Analysis</th>
                <th className="p-5 text-[11px] font-black text-slate-600 uppercase tracking-widest">Academic Avg</th>
                <th className="p-5 text-[11px] font-black text-slate-600 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filtered.map(student => {
                const avg = (student.assessments && student.assessments.length > 0)
                  ? (student.assessments.reduce((acc, a) => acc + (a.score / a.maxScore), 0) / student.assessments.length * 100).toFixed(1)
                  : 'N/A';
                
                const fullName = `${student.firstName} ${student.lastName}`;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="p-5 cursor-pointer" onClick={() => onSelectStudent(student)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                          {student.firstName.charAt(0)}
                        </div>
                        <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{fullName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm text-slate-900 font-bold">{student.studentId}</p>
                      <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">{student.block}</p>
                    </td>
                    <td className="p-5">
                      <RiskBadge level={student.riskLevel} />
                    </td>
                    <td className="p-5">
                      <span className="font-black text-sm text-slate-900">
                        {avg !== 'N/A' ? `${avg}%` : '---'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onSelectStudent(student)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-black hover:bg-blue-100 uppercase tracking-widest transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => onDeleteStudent(student.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-black hover:bg-red-100 uppercase tracking-widest transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-32 text-center bg-slate-50/50">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No matching student records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
