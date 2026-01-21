
import React, { useState, useRef } from 'react';
import { Student, RiskLevel } from '../types';

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (students: Student[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onImport }) => {
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processData = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return alert('Data must contain a header and at least one row.');
      
      const students: Student[] = lines.slice(1).map(line => {
        // Handle CSV and Tab-separated (Excel copy-paste)
        const delimiter = line.includes('\t') ? '\t' : (line.includes(',') ? ',' : ';');
        const [rawFullName, studentId, course, year, block] = line.split(delimiter).map(s => s.trim());
        
        const nameParts = (rawFullName || '').split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        return {
          id: Math.random().toString(36).substr(2, 9),
          firstName,
          middleName,
          lastName,
          // Added missing hierarchical info defaults to fix TS error
          university: 'University of the Philippines',
          college: 'College of Engineering',
          gender: 'Other',
          birthday: '2000-01-01',
          studentId: studentId || `ID-${Math.random().toString(36).substr(2, 5)}`,
          course: course || 'N/A',
          yearLevel: parseInt(year) || 1,
          block: block || 'A',
          email: `${(studentId || 'student').toLowerCase()}@university.edu.ph`,
          contact: '',
          subjects: [],
          assessments: [],
          attendance: [],
          interventionLogs: [],
          failureProbability: 0,
          riskLevel: RiskLevel.LOW
        };
      });

      onImport(students);
      alert(`Successfully imported ${students.length} student records.`);
    } catch (e) {
      console.error(e);
      alert('Error parsing data. Please ensure format is: Name, ID, Course, Year, Block');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Data Import</h3>
            <p className="text-slate-500 text-sm font-medium">Import student rosters from Excel or CSV files.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors font-black text-slate-400 hover:text-slate-900">✕</button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-[1.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-2xl mb-2">📄</span>
                <p className="mb-1 text-sm text-slate-700 font-black uppercase tracking-widest">Click to upload CSV/Excel</p>
                <p className="text-xs text-slate-500 font-bold italic">Max size: 5MB</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-black uppercase tracking-widest text-[10px]">Or Paste Records Below</span>
            </div>
          </div>

          <textarea 
            className="w-full h-48 p-5 font-mono text-sm border-2 border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
            placeholder="FullName, StudentID, Course, YearLevel, Block&#10;Juan Dela Cruz, 2021-00001, BS IT, 3, IT3-A"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
          />

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all border border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={() => processData(csvText)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Verify & Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
