
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentDetails from './components/StudentDetails';
import AttendanceModule from './components/AttendanceModule';
import GradesModule from './components/GradesModule';
import AlertCenter from './components/AlertCenter';
import AddStudentModal from './components/AddStudentModal';
import BulkImportModal from './components/BulkImportModal';
import Auth from './components/Auth';
import StudentPortal from './components/StudentPortal';
import { MOCK_STUDENTS } from './constants';
import { Student, Assessment, AttendanceRecord, RiskLevel, InterventionLog, User, UserRole } from './types';
import { calculateStudentRisk } from './utils/riskEngine';

const STORAGE_KEY = 'smartacademic_data';
const AUTH_KEY = 'smartacademic_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    checkNotifications();
  }, [students]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUser]);

  // Check for upcoming interventions (notifications)
  const checkNotifications = () => {
    const now = new Date();
    students.forEach(s => {
      s.interventionLogs.forEach(log => {
        if (log.scheduledDate) {
          const sched = new Date(log.scheduledDate);
          const diffMs = sched.getTime() - now.getTime();
          const diffHrs = diffMs / (1000 * 60 * 60);
          
          if (diffHrs > 0 && diffHrs <= 1) {
             console.log(`Notification: 1hr alert for ${s.firstName} ${s.lastName}`);
          }
        }
      });
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudent(null);
    setActiveTab('dashboard');
  };

  const updateStudentState = (updatedStudents: Student[]) => {
    const recalculated = updatedStudents.map(s => {
      const { probability, level } = calculateStudentRisk(s);
      return { ...s, failureProbability: probability, riskLevel: level };
    });
    setStudents(recalculated);
    if (selectedStudent) {
      const updatedSelected = recalculated.find(s => s.id === selectedStudent.id);
      if (updatedSelected) setSelectedStudent(updatedSelected);
    }
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id' | 'assessments' | 'attendance' | 'interventionLogs' | 'failureProbability' | 'riskLevel'>) => {
    const fullStudent: Student = {
      ...newStudent,
      id: Math.random().toString(36).substr(2, 9),
      assessments: [], attendance: [], interventionLogs: [],
      failureProbability: 0, riskLevel: RiskLevel.LOW
    };
    updateStudentState([...students, fullStudent]);
    setIsAddModalOpen(false);
  };

  const handleAddIntervention = (studentId: string, log: Omit<InterventionLog, 'id' | 'date'>) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const newLog: InterventionLog = {
          ...log, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString()
        };
        return { ...s, interventionLogs: [...(s.interventionLogs || []), newLog] };
      }
      return s;
    });
    updateStudentState(updated);
  };

  const handleSaveAttendance = (date: string, time: string, attendanceMap: Record<string, 'Present' | 'Absent' | 'Late'>) => {
    const updated = students.map(s => {
      if (attendanceMap[s.id]) {
        const newRecord: AttendanceRecord = { date, time, status: attendanceMap[s.id] };
        const filteredAttendance = (s.attendance || []).filter(r => !(r.date === date && r.time === time));
        return { ...s, attendance: [...filteredAttendance, newRecord] };
      }
      return s;
    });
    updateStudentState(updated);
  };

  const handleSaveGrades = (assessmentInfo: Omit<Assessment, 'id' | 'score'>, scores: Record<string, number>) => {
    const updated = students.map(s => {
      if (scores[s.id] !== undefined) {
        const newAssessment: Assessment = { ...assessmentInfo, id: Math.random().toString(36).substr(2, 9), score: scores[s.id] };
        return { ...s, assessments: [...(s.assessments || []), newAssessment] };
      }
      return s;
    });
    updateStudentState(updated);
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  if (currentUser.role === UserRole.STUDENT) {
    const studentData = students.find(s => s.studentId === currentUser.id) || null;
    return <StudentPortal student={studentData} user={currentUser} onLogout={handleLogout} />;
  }

  const renderContent = () => {
    if (selectedStudent) return <StudentDetails student={selectedStudent} onBack={() => setSelectedStudent(null)} onAddIntervention={log => handleAddIntervention(selectedStudent.id, log)} />;

    switch (activeTab) {
      case 'dashboard': return <Dashboard students={students} onNavigate={setActiveTab} />;
      case 'students': return <StudentList students={students} onSelectStudent={setSelectedStudent} onDeleteStudent={id => updateStudentState(students.filter(s => s.id !== id))} onOpenAdd={() => setIsAddModalOpen(true)} />;
      case 'attendance': return <AttendanceModule students={students} onSave={handleSaveAttendance} />;
      case 'grades': return <GradesModule students={students} onSave={handleSaveGrades} />;
      case 'alerts': return <AlertCenter students={students} onSelectStudent={setSelectedStudent} />;
      default: return <Dashboard students={students} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={tab => { setActiveTab(tab); setSelectedStudent(null); }} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">{renderContent()}</main>

      <div className="fixed bottom-10 right-10 z-40">
        {showFabMenu && (
           <div className="flex flex-col gap-4 mb-4 items-end animate-in fade-in slide-in-from-bottom-2">
              <button onClick={() => { setIsImportModalOpen(true); setShowFabMenu(false); }} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50">Bulk Import</button>
              <button onClick={() => { setIsAddModalOpen(true); setShowFabMenu(false); }} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50">Manual Add</button>
           </div>
        )}
        <button 
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all ${showFabMenu ? 'bg-red-500 rotate-45' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'}`}
        >
          +
        </button>
      </div>

      {isAddModalOpen && <AddStudentModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddStudent} />}
      {isImportModalOpen && <BulkImportModal onClose={() => setIsImportModalOpen(false)} onImport={s => { updateStudentState([...students, ...s]); setIsImportModalOpen(false); }} />}
    </div>
  );
};

export default App;
