
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
    university: 'University of the Philippines',
    college: 'College of Engineering',
    course: 'BS Information Technology',
    yearLevel: 1,
    block: '',
    guardianName: '',
    guardianContact: '',
    guardianRelation: 'Parent',
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

  const labelClass = "text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1";
  const inputClass = "w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm text-slate-900 bg-white font-bold transition-all placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300 border-4 border-slate-100">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Academic Registration</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">New EduGuardian Student Entry</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border-2 border-slate-100 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Section: Personal */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">I. Personal Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input required className={inputClass} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Juan" />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input className={inputClass} value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} placeholder="Miguel" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input required className={inputClass} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Dela Cruz" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Birthday {age !== null && <span className="text-blue-600">({age} y/o)</span>}</label>
                <input required type="date" className={inputClass} value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Institutional Hierarchy */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">II. Institutional Hierarchy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>University/College Name</label>
                <input required className={inputClass} value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Department/College Unit</label>
                <input required className={inputClass} value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="md:col-span-2">
                 <label className={labelClass}>Course/Major</label>
                 <input className={inputClass} value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="BS IT" />
               </div>
               <div>
                 <label className={labelClass}>Year</label>
                 <select className={inputClass} value={formData.yearLevel} onChange={e => setFormData({...formData, yearLevel: parseInt(e.target.value)})}>
                   {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
               </div>
               <div>
                 <label className={labelClass}>Block</label>
                 <input placeholder="IT3-A" className={inputClass} value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} />
               </div>
            </div>
          </section>

          {/* Section: Guardian Contact */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">III. Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-1">
                 <label className={labelClass}>Guardian Full Name</label>
                 <input className={inputClass} value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} placeholder="Full Name" />
               </div>
               <div>
                 <label className={labelClass}>Relationship</label>
                 <input className={inputClass} value={formData.guardianRelation} onChange={e => setFormData({...formData, guardianRelation: e.target.value})} placeholder="e.g. Parent" />
               </div>
               <div>
                 <label className={labelClass}>Contact Number</label>
                 <input className={inputClass} value={formData.guardianContact} onChange={e => setFormData({...formData, guardianContact: e.target.value})} placeholder="09XXXXXXXXX" />
               </div>
            </div>
          </section>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-all border-2 border-slate-200">Discard</button>
            <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all shadow-2xl active:scale-95">Register Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
