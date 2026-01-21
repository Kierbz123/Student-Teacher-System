
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    id: '',
    gender: 'Male',
    birthday: '',
    email: '',
    contact: ''
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
    const { firstName, lastName, id } = formData;
    
    if (isLogin) {
      if (!firstName || !lastName || !id) return alert('Please fill in your name and ID to login');
    } else {
      if (Object.values(formData).some(v => v === '')) {
        if (role === UserRole.STUDENT || role === UserRole.TEACHER) {
            if (!formData.firstName || !formData.lastName || !formData.id || !formData.birthday) {
                return alert('Please fill in all required fields');
            }
        }
      }
    }
    
    onLogin({ ...formData, role });
  };

  // Replaced dark input background with solid white and thick borders for maximum visibility
  const inputClass = "w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-slate-950 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-500 text-base font-black shadow-lg";
  const labelClass = "text-[11px] font-black text-white uppercase tracking-[0.2em] px-1 block mb-2 drop-shadow-md";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-6">
      <div className={`bg-white/10 backdrop-blur-2xl border border-white/20 w-full rounded-[3rem] p-10 shadow-2xl transition-all duration-700 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl">
            SmartAcademic <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-blue-100 font-black uppercase tracking-[0.25em] text-[10px] opacity-80">
            {isLogin ? 'EduGuardian Security Gate' : 'Academic Profile Registration'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex bg-slate-950/40 p-2 rounded-2xl border border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all transform ${role === UserRole.STUDENT ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' : 'text-slate-200 hover:bg-white/10'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.TEACHER)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all transform ${role === UserRole.TEACHER ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' : 'text-slate-200 hover:bg-white/10'}`}
            >
              Teacher
            </button>
          </div>

          <div className={`grid gap-6 ${isLogin ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={inputClass}
                  placeholder="Juan"
                />
              </div>
              {!isLogin && (
                <div>
                  <label className={labelClass}>Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className={inputClass}
                    placeholder="Miguel"
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={inputClass}
                  placeholder="Dela Cruz"
                />
              </div>
              <div>
                <label className={labelClass}>School ID No.</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  className={inputClass}
                  placeholder="2021-XXXXX"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className={inputClass + " cursor-pointer"}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Birthdate {age !== null && <span className="text-blue-300">({age}y)</span>}</label>
                    <input
                      type="date"
                      required
                      value={formData.birthday}
                      onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                      className={inputClass + " cursor-pointer"}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                    placeholder="student@univ.edu.ph"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone (PH)</label>
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className={inputClass}
                    placeholder="0917XXXXXXX"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.6)] transition-all transform active:scale-[0.97] border-t-2 border-white/20 uppercase tracking-[0.3em] text-sm"
          >
            {isLogin ? 'Access Portal' : 'Finalize Registration'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors underline decoration-blue-500 decoration-4 underline-offset-8"
          >
            {isLogin ? "System Request: New Account Registration" : "System Request: Portal Login Page"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
