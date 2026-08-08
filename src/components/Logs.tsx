import React, { useState, useEffect } from 'react';
import { Terminal, Shield, AlertTriangle, CheckCircle, Info, XCircle, Brain, Cpu, Sparkles, Plus, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface LogsProps {
  logs: { id: string; msg: string; type: 'info' | 'warn' | 'error' | 'success' }[];
}

export default function Logs({ logs }: LogsProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleExportLogsText = () => {
    const rawLogs = localLogs.map(l => `[${l.type.toUpperCase()}] ${l.msg}`).join('\n');
    const blob = new Blob([rawLogs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GHOST_WATCH_LOG_STREAM.txt`;
    link.click();
  };

  const handleExportLogsCSV = () => {
    let csvContent = 'Log_ID,Type,Timestamp,Message\n';
    localLogs.forEach(l => {
      const escapedMsg = l.msg.replace(/"/g, '""');
      const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
      csvContent += `"${l.id}","${l.type.toUpperCase()}","${timeString}","${escapedMsg}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GHOST_WATCH_LOG_STREAM.csv`;
    link.click();
  };

  // Synchronized logs state with option to seed demo events for rich AI analysis
  const [localLogs, setLocalLogs] = useState<typeof logs>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'summary' | 'critical_events' | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSequence = [
    "DIALING QUANTUM UPLINK TERMINATIVE SECTOR...",
    "ACCUMULATING PARALLEL EVENTS STREAM (KYBER-512 SECURED)...",
    "DISPATCHING COGNITIVE COMPUTE NODE [GEMINI-3.5-FLASH]...",
    "CORRELATING TEMPORAL ANOMALIES & THREAT PATTERNS...",
    "DECRYPTING INTELLIGENCE PAYLOAD METADATA...",
    "COMPUTING REMEDIATION PROTOCOLS..."
  ];

  useEffect(() => {
    if (logs.length > 0) {
      setLocalLogs(logs);
    } else {
      // Setup dynamic rich demo logs for analysis so user doesn't see an empty board
      setLocalLogs([
        { id: 'LOG-ALPHA-01', type: 'info', msg: 'System Audit Service initialized successfully. Cryptographic engine is locked & ready.' },
        { id: 'LOG-SIG-02', type: 'warn', msg: 'LEO_MESH_7 satellite link telemetry demonstrates 4.2% anomalous signal jitter.' },
        { id: 'LOG-CRYPT-03', type: 'success', msg: 'Successfully established post-quantum peer connection (Kyber-512) to Command Sector 1.' },
        { id: 'LOG-GEO-04', type: 'error', msg: 'PERIMETER VIOLATION: Secure Sector SEC-9031 breached by target tracking ID INT-02.' },
        { id: 'LOG-SAND-05', type: 'error', msg: 'NEURAL BOX TRAPPED EXECUTABLE: Severe heuristic correlation -> Cobalt Strike interactive C2 beacon detected.' },
        { id: 'LOG-DEF-06', type: 'info', msg: 'Entropy Shield active. Tarpit configured to throttle unauthenticated probe packet strings.' }
      ]);
    }
  }, [logs]);

  // Loading animation simulation
  useEffect(() => {
    if (!analyzing) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingSequence.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 700);
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleAIAnalysis = async (type: 'summary' | 'critical_events') => {
    setAnalyzing(true);
    setAnalysisType(type);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/process-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: localLogs,
          analysisType: type
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data.result);
      } else {
        setAnalysisResult(`### OPERATION ERROR\n\n**Uplink failed:** \n${data.error || "Remote intelligence server returned an unexpected failure."}`);
      }
    } catch (error: any) {
      setAnalysisResult(`### SYSTEM EXCEPTION\n\nUnable to dispatch query packet. Exception details: \n\`\`\`\n${error.message || error}\n\`\`\``);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInjectDecoyLogs = () => {
    const decoyPool = [
      { id: `DEC-${Math.floor(Math.random() * 9000 + 1000)}`, type: 'error' as const, msg: 'HONEYPOT TRIGGERED: Aggressive scans found on unauthorized API parameters.' },
      { id: `DEC-${Math.floor(Math.random() * 9000 + 1000)}`, type: 'warn' as const, msg: 'DECOY SYSTEM: Suspicious access attempted on secure mainframe registry.' },
      { id: `DEC-${Math.floor(Math.random() * 9000 + 1000)}`, type: 'success' as const, msg: 'Entropy Shield successfully deployed mitigation decoy payloads.' },
      { id: `DEC-${Math.floor(Math.random() * 9000 + 1000)}`, type: 'error' as const, msg: 'EXPLOIT HAZARD: High memory write anomalies in secure kernel subsystem Sector-G.' },
      { id: `DEC-${Math.floor(Math.random() * 9000 + 1000)}`, type: 'info' as const, msg: 'Satellite beam telemetry fully matched with optimal orbital precision.' }
    ];
    setLocalLogs(prev => [...decoyPool, ...prev]);
  };

  const validate = (val: string) => {
    // Allows alphanumeric, dashes, underscores, and spaces
    const regex = /^[a-zA-Z0-9\-_ ]*$/;
    return regex.test(val);
  };

  const handleChange = (val: string) => {
    setInputValue(val);
    setIsValid(validate(val));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-ghost-green" />;
      case 'error': return <AlertTriangle className="w-3 h-3 text-ghost-danger" />;
      case 'warn': return <AlertTriangle className="w-3 h-3 text-ghost-warning" />;
      case 'info': return <Info className="w-3 h-3 text-blue-400" />;
      default: return <Info className="w-3 h-3 text-zinc-500" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'text-ghost-green bg-ghost-green/5 border-ghost-green/20';
      case 'error': return 'text-ghost-danger bg-ghost-danger/5 border-ghost-danger/20';
      case 'warn': return 'text-ghost-warning bg-ghost-warning/5 border-ghost-warning/20';
      case 'info': return 'text-blue-400 bg-blue-400/5 border-blue-400/20';
      default: return 'text-zinc-400 bg-ghost-surface border-ghost-border';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="panel-header-line">
        <span>Immutable Event Stream // logs.src</span>
        <span>INTELLIGENCE ENGINE: ONLINE</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Log Trail */}
        <div className="lg:col-span-6 bg-ghost-dark border border-ghost-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-ghost-border bg-ghost-surface flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-ghost-green" />
              <span className="font-mono text-[10px] text-text-dim uppercase font-bold tracking-widest">Ghost-Watch-OS // kernel.audit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">EVENTS: {localLogs.length}</span>
              <button 
                onClick={handleInjectDecoyLogs}
                className="flex items-center gap-1 font-mono text-[8px] text-ghost-green border border-ghost-green/30 px-1.5 py-0.5 hover:bg-ghost-green/10 transition-colors uppercase cursor-pointer"
                title="Inject simulation logs"
              >
                <Plus className="w-2.5 h-2.5" /> DECOY
              </button>
              <button 
                onClick={handleExportLogsText}
                className="flex items-center gap-1 font-mono text-[8px] text-ghost-green bg-ghost-green/5 border border-ghost-green/30 px-1.5 py-0.5 hover:bg-ghost-green/20 hover:border-ghost-green transition-all uppercase cursor-pointer"
                title="Export raw text log stream"
              >
                <FileDown className="w-2.5 h-2.5" /> EXPORT_TXT
              </button>
              <button 
                onClick={handleExportLogsCSV}
                className="flex items-center gap-1 font-mono text-[8px] bg-ghost-green text-ghost-dark px-1.5 py-0.5 hover:bg-white hover:text-black transition-all uppercase font-bold cursor-pointer"
                title="Export current view as CSV spreadsheet"
              >
                <FileDown className="w-2.5 h-2.5" /> EXPORT_CSV
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono scroll-smooth custom-scrollbar">
            {localLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-[10px] uppercase tracking-widest">
                No active session logs...
              </div>
            ) : (
              localLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex flex-col gap-1 p-2 border-l-2 text-[10px] ${getColors(log.type)} bg-ghost-dark/40`}
                >
                  <div className="flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-tighter">
                      {getIcon(log.type)}
                      <span>[{log.type}] {new Date().toLocaleTimeString()}</span>
                    </div>
                    <span className="text-[8px] opacity-40 uppercase tracking-widest">SYS // {log.id}</span>
                  </div>
                  <div className="leading-tight whitespace-pre-wrap pl-4.5 text-white/95 font-bold">{log.msg}</div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: GHOST-AI Logs Analyzer */}
        <div className="lg:col-span-6 bg-ghost-dark border border-ghost-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-ghost-border bg-ghost-surface flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-ghost-green" />
              <span className="font-mono text-[10px] text-text-dim uppercase font-bold tracking-widest">GHOST-AI // Intellisense Processor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-ghost-green animate-pulse" />
              <span className="text-[9px] font-mono text-ghost-green uppercase font-bold">COGNITIVE_READY</span>
            </div>
          </div>

          <div className="p-3 border-b border-ghost-border bg-[#0e0e0e] flex flex-wrap gap-2">
            <button
              onClick={() => handleAIAnalysis('summary')}
              disabled={analyzing}
              className={`flex-1 font-mono text-[9px] py-2 px-2 border uppercase transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                analyzing && analysisType === 'summary'
                  ? 'bg-ghost-green/10 text-ghost-green border-ghost-green cursor-not-allowed'
                  : 'text-ghost-green border-ghost-green/30 hover:border-ghost-green hover:bg-ghost-green/5'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Summarize_Logs
            </button>
            <button
              onClick={() => handleAIAnalysis('critical_events')}
              disabled={analyzing}
              className={`flex-1 font-mono text-[9px] py-2 px-2 border uppercase transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                analyzing && analysisType === 'critical_events'
                  ? 'bg-ghost-danger/10 text-ghost-danger border-ghost-danger cursor-not-allowed'
                  : 'text-ghost-danger border-ghost-danger/30 hover:border-ghost-danger hover:bg-ghost-danger/5'
              }`}
            >
              <Shield className="w-3 h-3" /> Isolate_Anomalies
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#050505] flex flex-col justify-start select-text">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 space-y-4"
                >
                  <Cpu className="w-10 h-10 text-ghost-green animate-spin" />
                  <div className="space-y-2 text-center w-full max-w-xs">
                    <p className="font-mono text-[10px] text-ghost-green font-bold uppercase tracking-widest animate-pulse">Running Gemini Inference Engine...</p>
                    <div className="border border-ghost-border bg-ghost-dark/40 p-2 text-[8px] font-mono text-zinc-500 uppercase h-12 flex items-center justify-center break-all leading-tight">
                      {loadingSequence[loadingStep]}
                    </div>
                  </div>
                </motion.div>
              ) : analysisResult ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 text-xs font-mono leading-relaxed text-zinc-300"
                >
                  <div className="border border-ghost-green/20 bg-ghost-green/5 p-3 flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-ghost-green tracking-widest">
                      REPORT: {analysisType?.toUpperCase()}_REPORT
                    </span>
                    <button 
                      onClick={() => {
                        setAnalysisResult(null);
                        setAnalysisType(null);
                      }}
                      className="text-[8px] border border-zinc-700 px-1.5 py-0.5 hover:border-ghost-green hover:text-white uppercase font-mono cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-zinc-300 space-y-2 leading-relaxed">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-zinc-700 p-8 space-y-3">
                  <Brain className="w-12 h-12 text-zinc-900 animate-pulse" />
                  <div className="text-center">
                    <p className="font-mono text-[10px] uppercase font-bold tracking-wider mb-1 text-zinc-600">GHOST-WATCH AI Processor Idle</p>
                    <p className="text-[9px] uppercase leading-tight font-light max-w-[240px] text-zinc-500 select-none">
                      Select one of the analytical operations above to correlate system logs via our secure server-side Gemini gateway.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className={`bg-ghost-surface border ${isValid ? 'border-ghost-border' : 'border-red-500/50 bg-red-950/10'} p-3 flex items-center gap-3 transition-colors duration-200`}>
         <div className={`${isValid ? 'text-ghost-green' : 'text-red-500'} font-mono text-[10px] font-bold whitespace-nowrap uppercase tracking-tighter flex items-center gap-2`}>
            {!isValid && <XCircle className="w-3.5 h-3.5" />}
            GHOST-CMD //
         </div>
         <input 
           type="text" 
           value={inputValue}
           onChange={(e) => handleChange(e.target.value)}
           placeholder={isValid ? "INPUT_COMMAND_OVERRIDE_ALPHA" : "INVALID_CHARACTERS_DETECTED"}
           className={`bg-transparent border-none outline-none ${isValid ? 'text-ghost-green' : 'text-red-500'} font-mono text-[10px] flex-1 w-full placeholder:text-zinc-800 placeholder:italic uppercase`}
           onKeyDown={(e) => {
             if (e.key === 'Enter') {
               if (isValid && inputValue.trim()) {
                 const newLog = {
                   id: `USR-${Math.floor(Math.random() * 9000 + 1000)}`,
                   type: 'info' as const,
                   msg: inputValue.trim()
                 };
                 setLocalLogs(prev => [newLog, ...prev]);
                 setInputValue('');
               }
             }
           }}
         />
         {!isValid && (
           <motion.span 
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-[8px] font-mono text-red-500 uppercase font-bold"
           >
             Symbol_Forbidden
           </motion.span>
         )}
      </div>
    </div>
  );
}
