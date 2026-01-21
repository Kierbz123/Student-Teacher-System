
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'grades', label: 'Grades', icon: '📝' },
    { id: 'alerts', label: 'Alert Center', icon: '🚨' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <span className="text-blue-400">🎓</span> SmartAcademic
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Teacher Portal</p>
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
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
            TR
          </div>
          <div>
            <p className="text-sm font-bold text-white">Prof. Reyes</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Faculty Head</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 rounded-lg text-xs font-bold transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
