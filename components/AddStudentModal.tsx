
import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface AddStudentModalProps {
  onClose: () => void;
  onAdd: (student: Omit<Student, 'id' | 'assessments' | 'attendance' | 'interventionLogs' | 'failureProbability' | 'riskLevel'>) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    studentId: '',
    gender: 'Male',
    birthday: '',
    email: '',
    contact: '',
    course: 'BS Information Technology',
    yearLevel: 1,
    block: '',
    subjects: [] as string[]
  });

  const age = useMemo(() => {
    if (!formData.birthday) return null;
    const birth = new Date(formData.birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [formData.birthday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.studentId) {
      return alert('Please fill in required fields.');
    }
    onAdd(formData);
  };

  const labelClass = "text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-1.5";
  const inputClass = "w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm text-slate-900 bg-white font-semibold transition-all placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register Student</h3>
            <p className="text-slate-500 text-sm font-medium">Add a new record to the academic database.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400 hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input required className={inputClass} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="e.g. Juan" />
            </div>
            <div>
              <label className={labelClass}>Middle Name</label>
              <input className={inputClass} value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} placeholder="e.g. Miguel" />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input required className={inputClass} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="e.g. Dela Cruz" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Student ID</label>
              <input required placeholder="20XX-XXXXX" className={inputClass} value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Birthday {age !== null && <span className="text-blue-600">({age} y/o)</span>}</label>
              <input required type="date" className={inputClass} value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Course/Program</label>
              <input className={inputClass} value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="e.g. BS IT" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Year Level</label>
              <select className={inputClass} value={formData.yearLevel} onChange={e => setFormData({...formData, yearLevel: parseInt(e.target.value)})}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Block/Section</label>
              <input placeholder="e.g. IT3-A" className={inputClass} value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Number</label>
              <input className={inputClass} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="09XXXXXXXXX" />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="juan@email.com" />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all border border-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">Register Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
