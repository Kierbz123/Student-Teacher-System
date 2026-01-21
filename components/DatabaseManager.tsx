
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { ApiService } from '../services/api';

interface DatabaseManagerProps {
  students: Student[];
  onImport: (data: Student[]) => void;
  onReset: () => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ students, onImport, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sql-schema' | 'php-bridge' | 'terminal'>('php-bridge');
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkConn = async () => {
      const online = await ApiService.testConnection();
      setIsApiOnline(online);
    };
    checkConn();
    const interval = setInterval(checkConn, 2000); // Fast poll for setup feedback
    return () => clearInterval(interval);
  }, []);

  const sqlSchema = `CREATE DATABASE IF NOT EXISTS smartacademic_db;
USE smartacademic_db;

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    middleName VARCHAR(100),
    lastName VARCHAR(100) NOT NULL,
    course VARCHAR(100),
    yearLevel INT,
    block VARCHAR(20),
    gender VARCHAR(20),
    birthday DATE,
    email VARCHAR(150),
    contact VARCHAR(20),
    failureProbability DECIMAL(5,4),
    riskLevel VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE assessments (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36),
    type VARCHAR(50),
    name VARCHAR(100),
    score DECIMAL(5,2),
    maxScore DECIMAL(5,2),
    date DATE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(36),
    date DATE,
    time VARCHAR(50),
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;`;

  const phpBridgeFiles = [
    {
      name: 'config.php',
      code: `<?php
// ENHANCED CORS HEADERS - Required for Localhost Apps
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle "Preflight" requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// MySQL Connection
$conn = new mysqli("localhost", "root", "", "smartacademic_db");
if ($conn->connect_error) {
    die(json_encode(["error" => "Database Connection Failed"]));
}
?>`
    },
    {
      name: 'test.php',
      code: `<?php
require 'config.php';
echo json_encode(["status" => "online", "message" => "Connected Successfully"]);
?>`
    },
    {
      name: 'delete_student.php',
      code: `<?php
require 'config.php';
$id = $_GET['id'] ?? '';
if ($id) {
    $sql = "DELETE FROM students WHERE id = '$id'";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    }
}
?>`
    },
    {
      name: 'save_student.php',
      code: `<?php
require 'config.php';
$data = json_decode(file_get_contents("php://input"), true);
if ($data) {
    $id = $data['id']; $sid = $data['studentId']; $fn = $data['firstName']; $ln = $data['lastName'];
    $sql = "INSERT INTO students (id, studentId, firstName, lastName) VALUES ('$id', '$sid', '$fn', '$ln')
            ON DUPLICATE KEY UPDATE studentId='$sid', firstName='$fn', lastName='$ln'";
    $conn->query($sql);
    echo json_encode(["status" => "success"]);
}
?>`
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">External Database Center</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">MySQL + PHP Implementation Guide</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['overview', 'sql-schema', 'php-bridge'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {tab === 'sql-schema' ? 'SQL Script' : tab === 'php-bridge' ? 'PHP Files' : tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'php-bridge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Bridge Status</h3>
                   <span className={`w-3 h-3 rounded-full ${isApiOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></span>
                </div>
                <p className={`text-2xl font-black ${isApiOnline ? 'text-green-600' : 'text-red-600'}`}>
                   {isApiOnline ? 'MYSQL CONNECTED' : 'SYSTEM OFFLINE'}
                </p>
                
                {!isApiOnline && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                    <p className="text-[10px] font-black text-red-600 uppercase">Handshake Blocked?</p>
                    <ul className="text-[10px] font-bold text-red-800 space-y-1">
                      <li>1. Open <strong className="text-red-600">config.php</strong> and replace with the new code.</li>
                      <li>2. Restart Apache in XAMPP.</li>
                      <li>3. If still red, Right-click app &gt; Inspect &gt; Console.</li>
                    </ul>
                  </div>
                )}
             </div>

             <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-4">Installation</h3>
                <ol className="text-[11px] font-bold text-slate-400 space-y-4 list-decimal pl-4">
                   <li>Folder: <code className="text-white">C:/xampp/htdocs/smartacademic-api/</code></li>
                   <li>Replace <strong className="text-white">config.php</strong> with the code on the right.</li>
                   <li>Save the new <strong className="text-white">delete_student.php</strong>.</li>
                </ol>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
             {phpBridgeFiles.map((file, i) => (
               <div key={i} className="bg-slate-950 rounded-[2rem] border-2 border-slate-800 overflow-hidden shadow-2xl">
                  <div className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-800">
                     <span className="text-white font-mono text-xs">{file.name}</span>
                     <button 
                        onClick={() => copyToClipboard(file.code, file.name)}
                        className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors"
                     >
                        {copyStatus === file.name ? 'Copied!' : 'Copy Code'}
                     </button>
                  </div>
                  <pre className="p-6 text-[11px] font-mono text-slate-400 overflow-x-auto custom-scrollbar leading-relaxed">
                     {file.code}
                  </pre>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'sql-schema' && (
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
           <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                 <h3 className="text-lg font-black uppercase tracking-tight">MySQL Table Definitions</h3>
                 <p className="text-sm text-slate-500 font-bold italic">Run this in phpMyAdmin SQL tab</p>
              </div>
              <button onClick={() => copyToClipboard(sqlSchema, 'SQL')} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                {copyStatus === 'SQL' ? 'Copied!' : 'Copy SQL Script'}
              </button>
           </div>
           <div className="p-8 bg-slate-950">
              <pre className="text-green-500 font-mono text-sm leading-relaxed overflow-x-auto">
                 {sqlSchema}
              </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;
