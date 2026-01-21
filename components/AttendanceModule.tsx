
import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceModuleProps {
  students: Student[];
  onSave: (date: string, time: string, records: Record<string, 'Present' | 'Absent' | 'Late'>) => void;
}

const SCHEDULE_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:30 AM - 12:30 PM",
  "01:30 PM - 03:30 PM",
  "04:00 PM - 06:00 PM"
];

const AttendanceModule: React.FC<AttendanceModuleProps> = ({ students, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(SCHEDULE_SLOTS[0]);
  const [filterBlock, setFilterBlock] = useState('All');
  const [viewMode, setViewMode] = useState<'entry' | 'formal'>('entry');

  const blocks = useMemo(() => ['All', ...Array.from(new Set(students.map(s => s.block)))], [students]);
  const filteredStudents = students.filter(s => filterBlock === 'All' || s.block === filterBlock);

  const allSessionKeys = useMemo(() => {
    const keys = new Set<string>();
    students.forEach(s => {
      s.attendance.forEach(a => {
        keys.add(`${a.date}|${a.time || 'N/A'}`);
      });
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const [currentEntries, setCurrentEntries] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setCurrentEntries(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    onSave(selectedDate, selectedTime, currentEntries);
    alert(`Success: Attendance for ${selectedDate} saved.`);
    setCurrentEntries({});
  };

  const exportToCSV = () => {
    // Generate headers for ALL recorded dates
    const dateHeaders = allSessionKeys.map(k => k.split('|')[0]);
    const headers = ['Student Name', 'ID', 'Block', ...dateHeaders];
    
    const rows = filteredStudents.map(s => {
      const fullName = `${s.firstName} ${s.lastName}`;
      const sessionData = allSessionKeys.map(k => {
        const [d, t] = k.split('|');
        const record = s.attendance.find(a => a.date === d && (a.time === t || (t === 'N/A' && !a.time)));
        return record ? record.status : '-';
      });
      return [fullName, s.studentId, s.block, ...sessionData];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${filterBlock}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputClass = "w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-950 font-black text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all shadow-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Attendance Center</h2>
          <p className="text-slate-700 text-sm font-bold opacity-80">Mark presence or review the class register.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewMode === 'formal' && (
             <button 
              onClick={() => setViewMode('entry')}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-200 text-slate-900 hover:bg-slate-300 transition-all border-2 border-slate-300 shadow-sm"
            >
              ← Back to Entry
            </button>
          )}
          <button 
            onClick={() => setViewMode('entry')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'entry' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-100'}`}
          >
            Entry Sheet
          </button>
          <button 
            onClick={() => setViewMode('formal')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'formal' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-100'}`}
          >
            Spreadsheet
          </button>
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      {viewMode === 'entry' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Academic Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Class Time Slot</label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={inputClass + " cursor-pointer"}
              >
                {SCHEDULE_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Student Block</label>
              <select 
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className={inputClass + " cursor-pointer"}
              >
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="p-6 text-[11px] font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-slate-100 z-10 w-72 shadow-md border-r-2 border-slate-200">Student Full Name</th>
                    <th className="p-6 text-[11px] font-black text-slate-700 uppercase tracking-widest">School ID</th>
                    <th className="p-6 text-[11px] font-black text-slate-700 uppercase tracking-widest text-center w-52">Mark Attendance</th>
                    <th className="p-6 text-[11px] font-black text-slate-700 uppercase tracking-widest">Recent Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {filteredStudents.map(s => {
                    const fullName = `${s.firstName} ${s.lastName}`;
                    const status = currentEntries[s.id] || 'Present';
                    
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-6 font-black text-slate-950 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-md border-r-2 border-slate-100">
                          {fullName}
                        </td>
                        <td className="p-6 text-sm text-slate-900 font-black tracking-tight">{s.studentId}</td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2 bg-slate-200 p-2 rounded-2xl border-2 border-slate-200 shadow-inner">
                            {['Present', 'Absent', 'Late'].map(opt => (
                              <button
                                key={opt}
                                onClick={() => handleStatusChange(s.id, opt as any)}
                                title={opt}
                                className={`w-11 h-11 rounded-xl text-xs font-black transition-all transform active:scale-90 flex items-center justify-center border-2 ${status === opt ? (opt === 'Present' ? 'bg-green-600' : opt === 'Absent' ? 'bg-red-600' : 'bg-yellow-600') + ' border-white text-white shadow-xl scale-110' : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'}`}
                              >
                                {opt[0]}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-2">
                            {s.attendance.slice(-5).map((rec, i) => (
                              <div 
                                key={i} 
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-white/20 ${
                                  rec.status === 'Present' ? 'bg-green-500' :
                                  rec.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                              >
                                {rec.status[0]}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end items-center gap-10 bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-white/10">
            <div className="text-right">
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Live Session Monitor</p>
              <div className="flex gap-6 text-white font-black">
                <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> {Object.values(currentEntries).filter(v => v === 'Present').length} P</p>
                <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> {Object.values(currentEntries).filter(v => v === 'Absent').length} A</p>
                <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> {Object.values(currentEntries).filter(v => v === 'Late').length} L</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="bg-blue-600 text-white px-16 py-5 rounded-[1.5rem] font-black text-base uppercase tracking-widest shadow-[0_0_50px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-[1.03] transition-all active:scale-95 border border-blue-400/50"
            >
              Finalize Class Record
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden flex flex-col h-[75vh]">
          <div className="p-10 border-b-2 border-slate-100 bg-slate-50 flex justify-between items-center">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Class Register Matrix</h3>
                <p className="text-base text-slate-700 font-bold opacity-80">Full academic history for section {filterBlock}</p>
             </div>
             <div className="flex items-center gap-5">
                <span className="flex items-center gap-2 text-[11px] font-black text-slate-800"><span className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm"></span> Present</span>
                <span className="flex items-center gap-2 text-[11px] font-black text-slate-800"><span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></span> Absent</span>
                <span className="flex items-center gap-2 text-[11px] font-black text-slate-800"><span className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-sm"></span> Late</span>
             </div>
          </div>
          <div className="overflow-auto flex-1 custom-scrollbar">
             <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-slate-100 border-b-2 border-slate-200 sticky top-0 z-20">
                   <tr>
                      <th className="p-6 text-[11px] font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-slate-100 z-30 w-72 shadow-xl border-r-2 border-slate-200">Full Name</th>
                      {allSessionKeys.map(key => {
                        const [d, t] = key.split('|');
                        return (
                          <th key={key} className="p-6 text-[10px] font-black text-slate-700 uppercase tracking-tighter text-center min-w-[110px] border-r-2 border-slate-200">
                             <span className="block text-slate-900 font-black">{d}</span>
                             <span className="block text-[8px] text-slate-500 mt-1.5 opacity-70">{t !== 'N/A' ? t : 'Session'}</span>
                          </th>
                        );
                      })}
                      {allSessionKeys.length === 0 && <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">No Records Found</th>}
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                   {filteredStudents.map(s => {
                      const fullName = `${s.firstName} ${s.lastName}`;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-all duration-150">
                           <td className="p-6 font-black text-slate-900 text-sm sticky left-0 bg-white z-10 shadow-lg border-r-2 border-slate-100 truncate">
                              {fullName}
                           </td>
                           {allSessionKeys.map(key => {
                             const [d, t] = key.split('|');
                             const record = s.attendance.find(a => a.date === d && (a.time === t || (t === 'N/A' && !a.time)));
                             return (
                               <td key={key} className="p-6 text-center border-r-2 border-slate-100">
                                  {record ? (
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xs font-black text-white shadow-lg transform hover:scale-110 transition-transform ${
                                      record.status === 'Present' ? 'bg-green-600' :
                                      record.status === 'Absent' ? 'bg-red-600' : 'bg-yellow-600'
                                    }`}>
                                       {record.status[0]}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 font-black text-lg opacity-30">—</span>
                                  )}
                               </td>
                             );
                           })}
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;
