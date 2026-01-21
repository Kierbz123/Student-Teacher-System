
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Student Directory', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'grades', label: 'Gradebook', icon: '📝' },
    { id: 'alerts', label: 'Alert Center', icon: '🚨' },
    { id: 'database', label: 'Admin Tools', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col z-30 shadow-2xl">
      <div className="p-6">
        <h1 className="text-xl font-black flex items-center gap-2 text-white">
          <span className="text-blue-400">🎓</span> SmartAcademic
        </h1>
        <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-black opacity-70">EduGuardian AI</p>
      </div>
      
      <nav className="mt-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800/40 rounded-xl border border-slate-700">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/30 shadow-inner">
            TR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-white truncate">Prof. Reyes</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Faculty Admin</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-3 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
