
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
import DatabaseManager from './components/DatabaseManager';
import Auth from './components/Auth';
import StudentPortal from './components/StudentPortal';
import { MOCK_STUDENTS } from './constants';
import { Student, Assessment, AttendanceRecord, RiskLevel, InterventionLog, User, UserRole } from './types';
import { calculateStudentRisk } from './utils/riskEngine';
import { db } from './services/db';
import { ApiService } from './services/api';

const AUTH_KEY = 'smartacademic_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbMode, setDbMode] = useState<'PHP' | 'Local'>('Local');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Monitor API Connection periodically
  useEffect(() => {
    const monitor = setInterval(async () => {
      const isApiLive = await ApiService.testConnection();
      if (isApiLive && dbMode === 'Local') {
        console.log("MySQL Bridge Detected. Switching to Live Mode...");
        const remoteStudents = await ApiService.fetchStudents();
        setStudents(remoteStudents.length > 0 ? remoteStudents : students);
        setDbMode('PHP');
      } else if (!isApiLive && dbMode === 'PHP') {
        console.log("MySQL Connection Lost. Falling back to Browser Storage...");
        setDbMode('Local');
      }
    }, 5000);
    return () => clearInterval(monitor);
  }, [dbMode, students]);

  // Initial Load
  useEffect(() => {
    const initDB = async () => {
      try {
        const isApiLive = await ApiService.testConnection();
        if (isApiLive) {
          const remoteStudents = await ApiService.fetchStudents();
          setStudents(remoteStudents.length > 0 ? remoteStudents : MOCK_STUDENTS);
          setDbMode('PHP');
        } else {
          const count = await db.students.count();
          if (count === 0) {
            await db.students.bulkAdd(MOCK_STUDENTS);
          }
          const allStudents = await db.students.toArray();
          setStudents(allStudents);
          setDbMode('Local');
        }
      } catch (error) {
        console.error("Initialization Failed", error);
        setStudents(MOCK_STUDENTS);
      } finally {
        setIsLoading(false);
      }
    };
    initDB();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      checkUpcomingInterventions();
    }
  }, [students]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUser]);

  const checkUpcomingInterventions = () => {
    const now = new Date();
    const newNotifications: string[] = [];
    students.forEach(s => {
      s.interventionLogs.forEach(log => {
        if (log.scheduledDate) {
          const sched = new Date(log.scheduledDate);
          const diffHrs = (sched.getTime() - now.getTime()) / (1000 * 60 * 60);
          if (diffHrs > 0 && diffHrs <= 1) newNotifications.push(`Upcoming: ${s.firstName} at ${sched.toLocaleTimeString()}`);
        }
      });
    });
    if (newNotifications.length > 0) setNotifications(prev => [...new Set([...prev, ...newNotifications])]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudent(null);
    setActiveTab('dashboard');
  };

  const syncDatabase = async (updatedStudents: Student[]) => {
    const recalculated = updatedStudents.map(s => {
      const { probability, level } = calculateStudentRisk(s);
      return { ...s, failureProbability: probability, riskLevel: level };
    });
    
    setStudents(recalculated);
    await db.students.clear();
    await db.students.bulkAdd(recalculated);

    if (dbMode === 'PHP') {
      for (const s of recalculated) {
        await ApiService.saveStudent(s);
      }
    }

    if (selectedStudent) {
      const updatedSelected = recalculated.find(s => s.id === selectedStudent.id);
      if (updatedSelected) setSelectedStudent(updatedSelected);
    }
  };

  const handleImportSystemData = async (newData: Student[]) => {
    await syncDatabase(newData);
    alert('System Database updated.');
  };

  const handleResetSystem = async () => {
    const password = prompt('Confirm reset:');
    if (password === currentUser?.password) {
      await db.students.clear();
      await db.students.bulkAdd(MOCK_STUDENTS);
      setStudents(MOCK_STUDENTS);
      alert('System Reset.');
    }
  };

  const handleAddStudent = (newStudent: any) => {
    const fullStudent: Student = {
      ...newStudent,
      id: Math.random().toString(36).substr(2, 9),
      assessments: [], attendance: [], interventionLogs: [],
      failureProbability: 0, riskLevel: RiskLevel.LOW
    };
    syncDatabase([...students, fullStudent]);
    setIsAddModalOpen(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Delete record?')) {
      const password = prompt('Password:');
      if (password === currentUser?.password) {
        const filtered = students.filter(s => s.id !== id);
        await syncDatabase(filtered);
        if (dbMode === 'PHP') await ApiService.deleteStudent(id);
        if (selectedStudent?.id === id) setSelectedStudent(null);
      }
    }
  };

  const handleAddIntervention = (studentId: string, log: any) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const newLog = { ...log, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
        return { ...s, interventionLogs: [...(s.interventionLogs || []), newLog] };
      }
      return s;
    });
    syncDatabase(updated);
  };

  const handleSaveAttendance = (date: string, time: string, attendanceMap: any) => {
    const updated = students.map(s => {
      if (attendanceMap[s.id]) {
        const newRecord = { date, time, status: attendanceMap[s.id] };
        const filtered = (s.attendance || []).filter(r => !(r.date === date && r.time === time));
        return { ...s, attendance: [...filtered, newRecord] };
      }
      return s;
    });
    syncDatabase(updated);
  };

  const handleSaveGrades = (assessmentInfo: any, scores: any) => {
    const updated = students.map(s => {
      if (scores[s.id] !== undefined) {
        const newAssessment = { ...assessmentInfo, id: Math.random().toString(36).substr(2, 9), score: scores[s.id] };
        return { ...s, assessments: [...(s.assessments || []), newAssessment] };
      }
      return s;
    });
    syncDatabase(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400 font-black uppercase tracking-widest text-xs">Connecting to External Database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;
  if (currentUser.role === UserRole.STUDENT) return <StudentPortal student={students.find(s => s.studentId === currentUser.id) || null} user={currentUser} onLogout={handleLogout} />;

  const renderContent = () => {
    if (selectedStudent) return <StudentDetails student={selectedStudent} onBack={() => setSelectedStudent(null)} onAddIntervention={(log) => handleAddIntervention(selectedStudent.id, log)} />;
    switch (activeTab) {
      case 'dashboard': return <Dashboard students={students} onNavigate={setActiveTab} />;
      case 'students': return <StudentList students={students} onSelectStudent={setSelectedStudent} onDeleteStudent={handleDeleteStudent} onOpenAdd={() => setIsAddModalOpen(true)} />;
      case 'attendance': return <AttendanceModule students={students} onSave={handleSaveAttendance} />;
      case 'grades': return <GradesModule students={students} onSave={handleSaveGrades} />;
      case 'alerts': return <AlertCenter students={students} onSelectStudent={setSelectedStudent} />;
      case 'database': return <DatabaseManager students={students} onImport={handleImportSystemData} onReset={handleResetSystem} />;
      default: return <Dashboard students={students} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedStudent(null); }} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto relative">
        <div className="flex justify-end mb-4 px-2">
           <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${dbMode === 'PHP' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              Database: {dbMode === 'PHP' ? 'MySQL (Live)' : 'Browser Storage'}
           </span>
        </div>
        {renderContent()}
      </main>
      <div className="fixed bottom-10 right-10 z-50">
        <button onClick={() => setShowFabMenu(!showFabMenu)} className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl transition-all ${showFabMenu ? 'bg-red-500 rotate-45' : 'bg-blue-600'}`}>+</button>
      </div>
      {isAddModalOpen && <AddStudentModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddStudent} />}
      {isImportModalOpen && <BulkImportModal onClose={() => setIsImportModalOpen(false)} onImport={(s) => { syncDatabase([...students, ...s]); setIsImportModalOpen(false); }} />}
    </div>
  );
};

export default App;
