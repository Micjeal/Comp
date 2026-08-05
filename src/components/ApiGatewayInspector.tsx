import React, { useState, useEffect } from 'react';
import { Terminal, Code, Check, RefreshCw, Server, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const ApiGatewayInspector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState(apiClient.getLogs());
  const [copiedCode, setCopiedCode] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...apiClient.getLogs()]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const testEndpoint = async (endpoint: string) => {
    setTesting(true);
    await apiClient.get(endpoint);
    setTesting(false);
    setLogs([...apiClient.getLogs()]);
  };

  const sampleExpressCode = `// Node.js Express Backend API Gateway Template
const express = require('express');
const app = express();
app.use(express.json());

// GET /api/v1/campaigns
app.get('/api/v1/campaigns', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'cmp_1', title: 'Clean Urban Drainage', category: 'Environment', goalValue: 500 }
    ]
  });
});

// POST /api/v1/campaigns
app.post('/api/v1/campaigns', (req, res) => {
  const newCampaign = req.body;
  res.status(201).json({ success: true, data: newCampaign });
});

app.listen(3000, () => console.log('API Gateway running on port 3000'));
`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleExpressCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed top-2 right-2 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-slate-100 rounded-full text-xs font-mono font-bold shadow-lg hover:bg-slate-800 border border-slate-700 focus:outline-none transition-all"
      >
        <Server className="w-3.5 h-3.5 text-emerald-400" />
        <span>API Gateway</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-80 sm:w-96 bg-slate-950 text-slate-200 rounded-2xl p-4 shadow-2xl border border-slate-800 text-xs font-mono space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Node.js / Express API Bridge
            </span>
            <button
              onClick={copyCode}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[10px]"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
              {copiedCode ? 'Copied Express Snippet' : 'Copy Express Code'}
            </button>
          </div>

          <div>
            <p className="text-[11px] text-slate-400 mb-2">Quick Test Express Gateway Endpoints:</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                disabled={testing}
                onClick={() => testEndpoint('/health')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[10px]"
              >
                GET /health
              </button>
              <button
                disabled={testing}
                onClick={() => testEndpoint('/campaigns')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px]"
              >
                GET /campaigns
              </button>
              <button
                disabled={testing}
                onClick={() => testEndpoint('/groups')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[10px]"
              >
                GET /groups
              </button>
              <button
                disabled={testing}
                onClick={() => testEndpoint('/events')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px]"
              >
                GET /events
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300">Live Request Log ({logs.length})</span>
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300">
                Clear
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="text-[11px] text-slate-600 py-2">No API requests recorded yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800/80 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-blue-400">{log.method}</span>
                      <span className="text-slate-400">{log.endpoint}</span>
                      <span className={`px-1 rounded text-[9px] font-bold ${log.status === 200 ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                        {log.status}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
