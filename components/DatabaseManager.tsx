
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { ApiService } from '../services/api';

interface DatabaseManagerProps {
  students: Student[];
  onImport: (data: Student[]) => void;
  onReset: () => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ students, onImport, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sql-schema' | 'php-bridge'>('php-bridge');
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const isHttps = window.location.protocol === 'https:';

  useEffect(() => {
    const checkConn = async () => {
      const online = await ApiService.testConnection();
      setIsApiOnline(online);
    };
    checkConn();
    const interval = setInterval(checkConn, 3000);
    return () => clearInterval(interval);
  }, []);

  const sqlSchema = `CREATE DATABASE IF NOT EXISTS smartacademic_db;
USE smartacademic_db;

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    course VARCHAR(100),
    yearLevel INT,
    block VARCHAR(20),
    failureProbability DECIMAL(5,4),
    riskLevel VARCHAR(20)
) ENGINE=InnoDB;`;

  const phpBridgeFiles = [
    {
      name: 'config.php',
      code: `<?php
/**
 * HYPER-PERMISSIVE CORS HEADERS
 * Must be at the VERY START of the file (Line 1).
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Max-Age: 86400");

// Immediately handle preflight OPTIONS requests from browsers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

// Database connection details
$conn = new mysqli("localhost", "root", "", "smartacademic_db");

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}
?>`
    },
    {
      name: 'test.php',
      code: `<?php
require 'config.php';
// If this page shows 'online' in your browser, the PHP is working!
echo json_encode(["status" => "online", "message" => "XAMPP Bridge Connected"]);
?>`
    },
    {
      name: 'save_student.php',
      code: `<?php
require 'config.php';
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $id = $conn->real_escape_string($data['id']);
    $sid = $conn->real_escape_string($data['studentId']);
    $fn = $conn->real_escape_string($data['firstName']);
    $ln = $conn->real_escape_string($data['lastName']);
    $risk = $conn->real_escape_string($data['riskLevel']);
    $prob = (float)$data['failureProbability'];

    $sql = "INSERT INTO students (id, studentId, firstName, lastName, failureProbability, riskLevel) 
            VALUES ('$id', '$sid', '$fn', '$ln', $prob, '$risk')
            ON DUPLICATE KEY UPDATE 
            firstName='$fn', lastName='$ln', failureProbability=$prob, riskLevel='$risk'";
            
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
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
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Local MySQL + PHP Integration</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['overview', 'sql-schema', 'php-bridge'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {tab === 'sql-schema' ? 'SQL Script' : tab === 'php-bridge' ? 'PHP Bridge' : tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'php-bridge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Bridge Health</h3>
                   <span className={`w-3 h-3 rounded-full ${isApiOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></span>
                </div>
                <p className={`text-2xl font-black ${isApiOnline ? 'text-green-600' : 'text-red-600'}`}>
                   {isApiOnline ? 'MySQL CONNECTED' : 'FETCH ERROR'}
                </p>
                
                {isHttps && (
                  <div className="p-6 bg-red-600 text-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <span className="text-xl">🚨</span> Critical Browser Fix
                    </p>
                    <p className="text-xs font-bold leading-relaxed">
                      Your browser is blocking the connection to XAMPP because this app is <b>HTTPS</b> and your local server is <b>HTTP</b>.
                    </p>
                    <div className="bg-white/10 p-4 rounded-2xl space-y-3">
                      <p className="text-[10px] font-black uppercase">How to fix:</p>
                      <div className="text-[10px] font-bold space-y-2 opacity-90">
                        <p>1. Click the <b>Lock</b> or <b>Shield</b> icon in your URL address bar.</p>
                        <p>2. Select <b>Site Settings</b>.</p>
                        <p>3. Look for <b>Insecure content</b>.</p>
                        <p>4. Set it to <b>Allow</b>.</p>
                        <p>5. Refresh this page.</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isApiOnline && !isHttps && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                    <p className="text-[10px] font-black text-red-600 uppercase">Quick Checklist:</p>
                    <ul className="text-[10px] font-bold text-red-800 space-y-1">
                      <li>• XAMPP Apache & MySQL are RUNNING.</li>
                      <li>• Folder <code>htdocs/smartacademic-api</code> exists.</li>
                      <li>• No whitespace before <code>&lt;?php</code> in config.php.</li>
                      <li>• Open <code>http://127.0.0.1/smartacademic-api/test.php</code> in a new tab.</li>
                    </ul>
                  </div>
                )}
             </div>

             <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-4">Install Path</h3>
                <code className="block p-3 bg-black/40 rounded-xl text-[10px] text-blue-300 font-mono mb-4">
                   C:/xampp/htdocs/smartacademic-api/
                </code>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                   Copy all PHP files into the folder above. Restart Apache after saving.
                </p>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
             {phpBridgeFiles.map((file, i) => (
               <div key={i} className="bg-slate-950 rounded-[2rem] border-2 border-slate-800 overflow-hidden shadow-2xl">
                  <div className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-800">
                     <span className="text-white font-mono text-xs">{file.name}</span>
                     <button 
                        onClick={() => copyToClipboard(file.code, file.name)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-colors ${copyStatus === file.name ? 'text-green-400' : 'text-blue-400 hover:text-white'}`}
                     >
                        {copyStatus === file.name ? 'Copied!' : 'Copy Code'}
                     </button>
                  </div>
                  <pre className="p-6 text-[11px] font-mono text-slate-400 overflow-x-auto leading-relaxed">
                     {file.code}
                  </pre>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'sql-schema' && (
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
           <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">MySQL Database Table</h3>
              <button onClick={() => copyToClipboard(sqlSchema, 'SQL')} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Copy SQL
              </button>
           </div>
           <div className="p-8 bg-slate-950">
              <pre className="text-green-500 font-mono text-sm overflow-x-auto">
                 {sqlSchema}
              </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;
