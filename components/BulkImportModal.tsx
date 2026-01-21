
import React, { useState } from 'react';
import { Student, RiskLevel } from '../types';

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (students: Student[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onImport }) => {
  const [csvText, setCsvText] = useState('');

  const parseCSV = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return alert('Please enter at least a header and one data row.');
      
      const students: Student[] = lines.slice(1).map(line => {
        const [rawFullName, studentId, course, year, block] = line.split(',').map(s => s.trim());
        
        // Split raw name into parts to populate firstName, middleName, and lastName
        const nameParts = (rawFullName || '').split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        return {
          id: Math.random().toString(36).substr(2, 9),
          firstName,
          middleName,
          lastName,
          gender: 'Other',
          birthday: '2000-01-01',
          studentId: studentId || `ID-${Math.random().toString(36).substr(2, 5)}`,
          course: course || 'BS IT',
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
    } catch (e) {
      console.error(e);
      alert('Error parsing CSV. Please check formatting.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Bulk Import via CSV</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Paste your data below. Format: <code>FullName, StudentID, Course, YearLevel, Block</code>
          </p>
          <textarea 
            className="w-full h-64 p-4 font-mono text-sm border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Juan Dela Cruz, 2021-00001, BS IT, 3, IT3-A&#10;Maria Santos, 2021-00002, BS IT, 3, IT3-A"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
          />
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={parseCSV}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Process Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
