import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Satellite, 
  Zap, 
  AlertTriangle, 
  FileDown, 
  Radio, 
  Cpu, 
  LocateFixed, 
  Volume2, 
  RotateCcw,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemStatus, CustomTraceConfig } from '../types';

interface OverviewProps {
  status: SystemStatus;
  addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  customTraces: CustomTraceConfig[];
  setCustomTraces: React.Dispatch<React.SetStateAction<CustomTraceConfig[]>>;
}

export default function Overview({ status, addLog, customTraces, setCustomTraces }: OverviewProps) {
  // Local Target Configuration state
  const [ipInput, setIpInput] = useState('185.12.89.24');
  const [phoneInput, setPhoneInput] = useState('+1 (555) 732-2931');
  const [selectedCrystal, setSelectedCrystal] = useState('Lithium Niobate [LiNbO3]');
  const [frequency, setFrequency] = useState(1420.44); // IN MHz
  const [echoDelay, setEchoDelay] = useState(350); // IN ms
  const [echoFeedback, setEchoFeedback] = useState(65); // IN %

  const [activeUplinkId, setActiveUplinkId] = useState<string | null>(null);
  const [simulatedVoicePulse, setSimulatedVoicePulse] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Available crystallography choices for sub-space voice modulation
  const crystalLibraries = [
    { name: 'Lithium Niobate [LiNbO3]', speed: 6400, description: 'Standard high-frequency acoustic modular wave multiplier.' },
    { name: 'Quartz Oscillator [QZ-Hyper]', speed: 3300, description: 'Ultra-low jitter pure tone reference crystal.' },
    { name: 'Barium Borate [BBO-Apex]', speed: 8200, description: 'Extreme-yield harmonic spacer designed for voice clones.' },
    { name: 'Ruby Resonance Gem', speed: 9550, description: 'Deep red atomic lattice structure with infinite feedback decay.' },
    { name: 'Emerald Phase Crystal', speed: 11200, description: 'Sub-space acoustic lattice. Rare isotope compression matrix.' },
  ];

  // Quick system updates
  const cards = [
    { title: 'Downlink SNR', value: '14.28 dB', sub: 'Active Satellite Link', icon: Activity },
    { title: 'Bit Error Rate', value: '1.04e-7', sub: 'Crystallographic Mesh', icon: Shield },
    { title: 'LEO Target Node', value: 'GHOST-01', sub: 'Transmitting Multi-Cast', icon: Satellite },
    { title: 'Uplink Power', value: `${(frequency / 350).toFixed(2)} kW`, sub: 'Peak Resonant Range', icon: Zap },
  ];

  // Acoustic text generator simulating crystals voice echoes
  useEffect(() => {
    if (!activeUplinkId) {
      setSimulatedVoicePulse([]);
      return;
    }
    const lines = [
      `[*] TUNING RESONANCE CELL TO: [${selectedCrystal}]`,
      `[>] FREQ RANGE SET TO: ${frequency} MHz`,
      `[>] PULSING TRANS-ORBITAL VECTOR BEAM...`,
      `[>] ECHO DELAY BOUNDS SET TO: ${echoDelay}ms`,
      `[>] ACOUSTIC INTENSITY GAIN: ${echoFeedback}%`,
      `[VOICE] DETECTING REVERB SUB-CARRIER...`,
      `[ECHO] (${echoDelay}ms delay): "...testing voice signature..."`,
      `[ECHO] (${(echoDelay * 2)}ms feedback: ${Math.floor(echoFeedback * 0.7)}%): "...voice signature..."`,
      `[ECHO] (${(echoDelay * 3)}ms feedback: ${Math.floor(echoFeedback * 0.4)}%): "...signature..."`,
      `[SUCCESS] CRYSTA-VOICE ECHO LOCALIZED!`
    ];

    let currentLine = 0;
    setIsSynthesizing(true);
    setSimulatedVoicePulse([lines[0]]);

    const voiceInterval = setInterval(() => {
      currentLine++;
      if (currentLine < lines.length) {
        setSimulatedVoicePulse(prev => [...prev, lines[currentLine]]);
      } else {
        setIsSynthesizing(false);
        clearInterval(voiceInterval);
        // Mark active trace as complete
        setCustomTraces(prev => 
          prev.map(t => t.id === activeUplinkId ? { ...t, status: 'TRACE_COMPLETE' } : t)
        );
        addLog(`Crysta-Voice telemetry complete for IP/Domain ${ipInput}. Traced vector logged.`, 'success');
      }
    }, Math.max(200, echoDelay / 1.5));

    return () => clearInterval(voiceInterval);
  }, [activeUplinkId, echoDelay, echoFeedback, selectedCrystal, frequency]);

  // Initiate custom high-gain trans-orbital trace
  const handleInitiateTrace = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'TRC-' + Math.floor(1000 + Math.random() * 9000);
    
    const newTraceItem: CustomTraceConfig = {
      id: newId,
      ipOrDomain: ipInput || 'unresolved-host.local',
      phoneNumber: phoneInput || '+1 (555) UNKNOWN',
      crystalType: selectedCrystal,
      resonatingFrequency: frequency,
      echoDelay: echoDelay,
      echoFeedback: echoFeedback,
      timestamp: new Date().toLocaleTimeString() + ' UTC',
      status: 'TRANSMITTING'
    };

    setCustomTraces(prev => [newTraceItem, ...prev]);
    setActiveUplinkId(newId);

    addLog(`Broadcasting sub-space trace vector for target IP/Domain [${newTraceItem.ipOrDomain}]`, 'warn');
    addLog(`Coupled Phone Number [${newTraceItem.phoneNumber}] into satellite geolocation cells.`, 'info');
    addLog(`Crysta-Voice: tuned ${newTraceItem.crystalType} frequency to ${newTraceItem.resonatingFrequency}MHz with delay ${newTraceItem.echoDelay}ms`, 'success');
  };

  // Reset current trace
  const handleResetTrace = () => {
    setActiveUplinkId(null);
    setSimulatedVoicePulse([]);
    setIsSynthesizing(false);
  };

  // Export buttons triggers (CSV, JSON, PLAINTEXT)
  const handleExportBriefText = () => {
    const activeTargetLogs = customTraces.map(t => 
      `TARGET-ID: ${t.id}\n - Target IP: ${t.ipOrDomain}\n - Phone Vector: ${t.phoneNumber}\n - Coupled Crystal: ${t.crystalType}\n - Frequency: ${t.resonatingFrequency} MHz\n - Echo Properties: Delay ${t.echoDelay}ms / Gain ${t.echoFeedback}%\n - Created: ${t.timestamp}\n - Status: ${t.status}\n`
    ).join('\n');

    const briefReport = `========================================================================
             GHOST-WATCH C2 COMMAND STATION - TACTICAL BRIEF REPORT
========================================================================
TIMESTAMP: ${new Date().toUTCString()}
SESSION ID: ${status.hardwareId}
SECURITY COGNIZANCE: APEX CLASSIFIED PEER STATION
COGNITIVE ENCRYPTION: KYBER-1024 MULTI-LAYER RESISTANT

====================================
1. HARDWARE ENVIRONMENT & SYSTEMS BRIEF
====================================
- Central C2 Core: ${status.tier}
- Link Node: LEO_MESH_7 Orbital Array (Target Node: GHOST-01)
- Operations Integrity: ${status.status}
- Cryptographic Handshake Status: ${status.pqcStatus} (Post-Quantum Posture)
- System Noise SNR: 14.28 dB
- Quantum Entropy Shield: ACTIVE // Perfect Immunity Verified

====================================
2. DETECTED TARGET TRACES & COUPLINGS (CUSTOM INTERCEPTS)
====================================
${activeTargetLogs || "No active custom target traces currently in register."}

====================================
3. SPECTRAL ANALYSIS RANGE
====================================
- Reference Frequency: 915.0 MHz (Multi-Oscillation Spectrum Scanner)
- Co-Processor Load: NORMAL (Uptime: 100%)
- Spoofing Mode: Decoy Trace-Route Spoofing ACTIVE

========================================================================
END OF REPORT // GHOST-WATCH LE-01 OPERATIONAL SOVEREIGNTY SECURED
========================================================================`;

    const blob = new Blob([briefReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GHOST_WATCH_C2_BRIEF_${newIdDateSuffix()}.txt`;
    link.click();
    addLog('Operational Core System Brief exported to download queue.', 'success');
  };

  const handleExportIntelJson = () => {
    const intelPayload = {
      generator: "GHOST-WATCH C2 Station",
      timestamp: new Date().toISOString(),
      hardWareSession: status.hardwareId,
      operationalStatus: status.status,
      activeSystemBrief: {
        downlinkSnrDb: 14.28,
        bitErrorRate: "1.04e-7",
        pqcMode: status.pqcStatus
      },
      tracesRecorded: customTraces
    };

    const blob = new Blob([JSON.stringify(intelPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEO_TRACED_INTEL_DECK_${newIdDateSuffix()}.json`;
    link.click();
    addLog('Target Intel configuration deck successfully exported as JSON.', 'success');
  };

  const handleExportCSVLogs = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Trace_ID,IP_Domain,Phone_Number,Crystal_Type,Resonating_Frequency_MHz,Echo_Delay_ms,Echo_Feedback_percent,Timestamp,Status\n";
    
    customTraces.forEach(t => {
      csvContent += `"${t.id}","${t.ipOrDomain.replace(/"/g, '""')}","${t.phoneNumber.replace(/"/g, '""')}","${t.crystalType}","${t.resonatingFrequency}","${t.echoDelay}","${t.echoFeedback}","${t.timestamp}","${t.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SECURITY_AUDIT_LOGS_${newIdDateSuffix()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Security Audit Logs table exported as CSV format.', 'success');
  };

  const newIdDateSuffix = () => {
    const d = new Date();
    return `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="panel-header-line">
        <span>Signal Baseline Monitor // overview.src</span>
        <span>STATUS: {status.status}</span>
      </div>

      {/* Top Cards: Status telemetry displays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-ghost-surface border border-ghost-border p-4 group hover:border-ghost-green transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="text-[10px] text-text-dim uppercase font-mono tracking-wider">{card.title}</div>
              <card.icon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-ghost-green transition-colors" />
            </div>
            <div className="text-xl font-mono text-ghost-green font-bold mt-2 tracking-tight">{card.value}</div>
            <div className="text-[9px] text-zinc-600 font-mono mt-1 uppercase tracking-tighter">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Form configured parameter controls for voice/IP/phone */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-ghost-surface border border-ghost-border p-5 rounded relative flex flex-col justify-between">
            
            {/* Header info bar */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-ghost-border">
              <h3 className="font-mono text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <Radio className="w-4 h-4 text-ghost-green animate-pulse" /> Trans-Orbital Target & Signal Configurator
              </h3>
              <span className="text-[8px] font-mono text-zinc-500 uppercase">SYS REFERENCE: CRYSTAL_LINK V2</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleInitiateTrace} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* IP/Domain Tracer */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-[#b4b4b4] uppercase tracking-wider block">
                    IP Vector / Onion Domain to Trace
                  </label>
                  <input 
                    type="text"
                    required
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="e.g. 192.168.102.1 or secure-cell.onion"
                    className="w-full bg-ghost-dark border border-ghost-border p-2.5 text-xs font-mono text-white focus:border-ghost-green outline-none"
                  />
                </div>

                {/* Telephone vector tracer */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-[#b4b4b4] uppercase tracking-wider block">
                    Telemetry Phone Number Target
                  </label>
                  <input 
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +1 (310) 555-1192"
                    className="w-full bg-ghost-dark border border-ghost-border p-2.5 text-xs font-mono text-white focus:border-ghost-green outline-none"
                  />
                </div>

              </div>

              {/* Satellite Crystal settings & Voice Resonator frequency sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-ghost-dark/40 p-4 border border-ghost-border/50">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[9px] font-mono font-bold text-text-dim uppercase tracking-wider block">
                    Voice Resonator Crystals
                  </label>
                  <select 
                    value={selectedCrystal}
                    onChange={(e) => setSelectedCrystal(e.target.value)}
                    className="w-full bg-ghost-dark border border-ghost-border text-[10px] font-mono p-2 text-ghost-green outline-none"
                  >
                    {crystalLibraries.map((crystal) => (
                      <option key={crystal.name} value={crystal.name}>{crystal.name}</option>
                    ))}
                  </select>
                  <p className="text-[8px] font-mono text-zinc-600 leading-tight">
                    {crystalLibraries.find(c => c.name === selectedCrystal)?.description}
                  </p>
                </div>

                {/* Frequency range slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="font-bold text-text-dim uppercase">Cryo-Frequency</span>
                    <span className="text-ghost-green font-bold">{frequency.toFixed(2)} MHz</span>
                  </div>
                  <input 
                    type="range"
                    min="800.00"
                    max="4000.00"
                    step="5.00"
                    value={frequency}
                    onChange={(e) => setFrequency(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ghost-green"
                  />
                  <div className="flex justify-between text-[7px] font-mono text-zinc-600">
                    <span>800 MHz (Quartz)</span>
                    <span>4000 MHz (Lattice)</span>
                  </div>
                </div>

                {/* Echo feedback and delay */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="font-bold text-text-dim uppercase">Echo (Delay / Feedback)</span>
                    <span className="text-ghost-warning font-bold">{echoDelay}ms / {echoFeedback}%</span>
                  </div>
                  
                  <div className="space-y-1 pt-1">
                     {/* Delay Slider */}
                     <input 
                       type="range"
                       min="50"
                       max="1500"
                       step="25"
                       value={echoDelay}
                       onChange={(e) => setEchoDelay(parseInt(e.target.value))}
                       className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ghost-warning"
                     />
                     
                     {/* Feedback Slider */}
                     <input 
                       type="range"
                       min="10"
                       max="100"
                       step="5"
                       value={echoFeedback}
                       onChange={(e) => setEchoFeedback(parseInt(e.target.value))}
                       className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ghost-warning"
                     />
                  </div>

                  <div className="flex justify-between text-[7px] font-mono text-zinc-600 pt-0.5">
                    <span>Reverb: Narrow</span>
                    <span>High Feedback Echo</span>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={isSynthesizing}
                  className="flex-1 bg-ghost-green text-ghost-dark py-2.5 px-4 font-mono text-[10px] font-bold hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 border border-transparent hover:border-ghost-green"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  {isSynthesizing ? 'TRANSMITTING CRYSTAL PULSE...' : 'INITIATE TRANS-ORBITAL TRACE'}
                </button>

                {activeUplinkId && (
                  <button 
                    type="button"
                    onClick={handleResetTrace}
                    className="bg-ghost-dark hover:bg-neutral-900 border border-ghost-border hover:border-zinc-700 py-2.5 px-4 font-mono text-[10px] text-zinc-400 font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </form>

          </div>

          {/* Integrated Tactical Export Controls Panel */}
          <div className="bg-ghost-surface border border-ghost-border p-5 rounded space-y-4">
             <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
               <h3 className="font-mono text-xs font-bold text-zinc-400 flex items-center gap-2">
                 <FileDown className="w-4 h-4 text-ghost-green" /> Command Station Intelligence Export Options
               </h3>
               <span className="text-[8px] font-mono text-ghost-green bg-ghost-green/5 border border-ghost-green/30 px-2 py-0.5 animate-pulse uppercase font-bold">READY_TO_DL</span>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Export Text report brief */}
                <button 
                  onClick={handleExportBriefText}
                  className="bg-ghost-dark hover:bg-[#151515] hover:border-ghost-green border border-ghost-border p-4 flex flex-col items-start gap-1.5 font-mono text-left transition-all group"
                  title="Export raw plain ASCII file"
                >
                  <FileDown className="w-5 h-5 text-ghost-green group-hover:scale-110 transition-transform" />
                  <div>
                    <h5 className="text-[10px] text-white font-bold uppercase tracking-wider font-mono">Export C2 Brief</h5>
                    <p className="text-[8px] text-zinc-600 font-mono uppercase mt-0.5 leading-normal">Operational ASCII Status Text Report (.txt)</p>
                  </div>
                </button>

                {/* Export JSON trace targets */}
                <button 
                  onClick={handleExportIntelJson}
                  className="bg-ghost-dark hover:bg-[#151515] hover:border-ghost-green border border-ghost-border p-4 flex flex-col items-start gap-1.5 font-mono text-left transition-all group"
                  title="Export target coordinates as JSON telemetry"
                >
                  <Cpu className="w-5 h-5 text-ghost-green group-hover:scale-110 transition-transform" />
                  <div>
                    <h5 className="text-[10px] text-white font-bold uppercase tracking-wider font-mono">Export JSON Targets</h5>
                    <p className="text-[8px] text-zinc-600 font-mono uppercase mt-0.5 leading-normal">Highly structured target nodes array (.json)</p>
                  </div>
                </button>

                {/* Export CSV status registry */}
                <button 
                  onClick={handleExportCSVLogs}
                  className="bg-ghost-dark hover:bg-[#151515] hover:border-ghost-green border border-ghost-border p-4 flex flex-col items-start gap-1.5 font-mono text-left transition-all group"
                  title="Export trace metrics summary in spreadsheet tables"
                >
                  <HardDrive className="w-5 h-5 text-ghost-green group-hover:scale-110 transition-transform" />
                  <div>
                    <h5 className="text-[10px] text-white font-bold uppercase tracking-wider font-mono">Export CSV Logs</h5>
                    <p className="text-[8px] text-zinc-600 font-mono uppercase mt-0.5 leading-normal">Spreadsheet friendly audit history logs (.csv)</p>
                  </div>
                </button>

             </div>
          </div>
        </div>

        {/* Right Column: Visualizer & security metrics */}
        <div className="bg-ghost-surface border border-ghost-border p-5 flex flex-col gap-6">
           
           {/* Acoustic Wave Panel */}
           <div className="space-y-3.5">
             <div className="panel-header-line m-0 border-none pb-0">
               <span>Interactive Sound Crystal Resonance</span>
             </div>

             <div className="bg-black/60 border border-ghost-border p-3 rounded flex flex-col gap-3 min-h-[160px] relative overflow-hidden justify-between">
                
                {/* Simulated crystal voice waveform equalizer */}
                <div className="h-16 flex items-end gap-1 px-1 justify-center">
                  {[...Array(16)].map((_, i) => {
                    // Map animation timing with delay input dynamically to make it respond to sliders!
                    const animationDuration = isSynthesizing ? `${(echoDelay / 200).toFixed(2)}s` : '5s';
                    const scaleHeight = echoFeedback / 100;
                    
                    return (
                      <motion.div 
                        key={i}
                        animate={isSynthesizing ? { 
                          height: [10, 60 * scaleHeight, 25 * scaleHeight, 52 * scaleHeight, 10] 
                        } : { 
                          height: [6, 12, 8, 10, 6] 
                        }}
                        transition={{ 
                          duration: isSynthesizing ? (echoDelay / 400 + i * 0.05) : 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className={`w-1.5 rounded-t-xs transition-colors duration-300 ${
                          isSynthesizing ? 'bg-ghost-green shadow-[0_0_8px_rgba(0,255,65,0.4)]' : 'bg-zinc-800'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Mini details summary */}
                <div className="space-y-1 border-t border-zinc-900 pt-2 font-mono text-[9px] text-[#8c8c8c]">
                   <div className="flex justify-between">
                     <span>CRYSTA TYPE:</span>
                     <span className="text-white text-right truncate max-w-[120px]">{selectedCrystal}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>TENSION SPEED:</span>
                     <span className="text-ghost-green font-bold">
                       {crystalLibraries.find(c => c.name === selectedCrystal)?.speed} m/s
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span>TARGET_DELAY:</span>
                     <span className="text-ghost-warning">{echoDelay} ms // {echoFeedback}% GAIN</span>
                   </div>
                </div>

                {/* Floating status icon */}
                <Volume2 className={`absolute top-2 right-2 w-3.5 h-3.5 ${isSynthesizing ? 'text-ghost-green animate-bounce' : 'text-zinc-600'}`} />
             </div>

             {/* Live Telemetry console logging voice signals */}
             <div className="bg-[#050505] p-3 border border-ghost-border rounded text-[9px] font-mono uppercase text-ghost-green min-h-[148px] max-h-[158px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 select-text">
                {simulatedVoicePulse.length === 0 ? (
                  <div className="text-zinc-700 italic flex flex-col items-center justify-center py-6 gap-2 text-center select-none">
                    <AlertTriangle className="w-6 h-6 text-zinc-800" />
                    <span>Uplink terminal offline.<br/>Configure params on the left and submit trace vector.</span>
                  </div>
                ) : (
                  simulatedVoicePulse.map((line, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className={line.includes('SUCCESS') ? 'text-white bg-ghost-green/10 p-1 border border-ghost-green/25 font-bold' : 'leading-tight'}
                    >
                      {line}
                    </motion.div>
                  ))
                )}
             </div>
           </div>

           {/* Heuristics panel to maintain visual aesthetic matching original core design */}
           <div className="space-y-3 pt-2 border-t border-ghost-border/50">
              <div className="flex justify-between text-[10px] font-mono uppercase text-text-dim">
                <span>Security Integrity Metrics</span>
                <span className="text-ghost-green font-bold">Perfect</span>
              </div>

              <div className="space-y-3.5 mt-2">
                 {[
                   { label: 'Prompt Injection Risk', value: 0.02, status: 'Low' },
                   { label: 'Network Anomalies', value: 0.12, status: 'Low' },
                   { label: 'Crys-Acoustic Impedance', value: (echoDelay / 1500) * 0.4, status: `${Math.floor(echoDelay / 15)}% Jitter` },
                   { label: 'System Uptime Ratio', value: 1.0, status: 'Perfect' },
                 ].map((item) => (
                   <div key={item.label} className="space-y-1 font-mono">
                     <div className="flex justify-between text-[9px]">
                       <span className="text-zinc-500 uppercase">{item.label}</span>
                       <span className="text-ghost-green font-bold">{item.status}</span>
                     </div>
                     <div className="h-0.5 bg-ghost-dark overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.value * 100}%` }}
                         transition={{ duration: 0.7 }}
                         className="h-full bg-ghost-green" 
                       />
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="pt-2 border-t border-ghost-border mt-auto font-mono text-[9px] text-zinc-600">
             <span>Env Core: {status.hardwareId}</span><br/>
             <span>Security Protocol: GHOST-WATCH APEX SECURED</span>
           </div>
        </div>

      </div>
    </div>
  );
}
