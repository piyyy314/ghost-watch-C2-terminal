import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Trash2, 
  Send, 
  FileDown, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck, 
  CpuIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ThreatIndicator {
  threat_id: string;
  source_ip: string;
  threat_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  ioc_hash: string;
  mitre: string;
  confidence: number;
}

export interface PublishedEvent {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  message: string;
  mitre: string;
  host: string;
  action_taken: string;
  timestamp: string;
}

const THREAT_TYPES: Record<string, { mitre: string; severities: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] }> = {
  "Phishing Campaign": { mitre: "T1566.001", severities: ["CRITICAL", "HIGH", "MEDIUM"] },
  "Advanced Persistent Threat": { mitre: "T1059", severities: ["CRITICAL", "HIGH"] },
  "Credential Stuffing": { mitre: "T1110.004", severities: ["HIGH", "MEDIUM"] },
  "Encrypted Payload": { mitre: "T1027", severities: ["HIGH", "MEDIUM", "LOW"] },
  "Zero-Day Exploit": { mitre: "T1190", severities: ["CRITICAL"] },
  "DDoS Cluster": { mitre: "T1498", severities: ["HIGH", "MEDIUM"] },
  "Port Scan": { mitre: "T1046", severities: ["MEDIUM", "LOW"] },
  "DNS Tunneling": { mitre: "T1071.004", severities: ["HIGH", "MEDIUM"] },
  "Supply Chain": { mitre: "T1195.002", severities: ["CRITICAL"] },
};

const generateThreatIp = (): string => {
  const r = () => Math.floor(Math.random() * 223) + 1;
  const byte2 = Math.floor(Math.random() * 256);
  const byte3 = Math.floor(Math.random() * 256);
  const byte4 = Math.floor(Math.random() * 256);
  let b1 = r();
  while (b1 === 10 || b1 === 127 || b1 === 192 || b1 === 172) {
    b1 = r();
  }
  return `${b1}.${byte2}.${byte3}.${byte4}`;
};

const generateRandomHash = (): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export default function Intelligence({ addLog }: { addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void }) {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([
    {
      threat_id: 'TH-402',
      source_ip: '185.220.101.44',
      threat_type: 'Advanced Persistent Threat',
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString(),
      ioc_hash: '7c9e05a11b6d0c2e3f4a5b6c7d8e9f0a',
      mitre: 'T1059',
      confidence: 96
    },
    {
      threat_id: 'TH-119',
      source_ip: '91.242.162.8',
      threat_type: 'Zero-Day Exploit',
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString(),
      ioc_hash: '2f0b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      mitre: 'T1190',
      confidence: 99
    },
    {
      threat_id: 'TH-715',
      source_ip: '103.55.204.12',
      threat_type: 'DDoS Cluster',
      severity: 'HIGH',
      timestamp: new Date().toLocaleTimeString(),
      ioc_hash: 'f9e8d7c6b5a493827160eeddccbbaa09',
      mitre: 'T1498',
      confidence: 88
    },
    {
      threat_id: 'TH-331',
      source_ip: '77.83.200.198',
      threat_type: 'Credential Stuffing',
      severity: 'MEDIUM',
      timestamp: new Date().toLocaleTimeString(),
      ioc_hash: 'e5d4c3b2f1e0d9c8b7a6958473625140',
      mitre: 'T1110.004',
      confidence: 72
    }
  ]);

  // Event bus integration database state
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([]);
  const [autoFeedActive, setAutoFeedActive] = useState(true);

  // Form custom targets configuration
  const [customIp, setCustomIp] = useState('');
  const [customType, setCustomType] = useState('Phishing Campaign');
  const [customSeverity, setCustomSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [customConfidence, setCustomConfidence] = useState(85);

  // Dynamic feed loop simulation
  useEffect(() => {
    if (!autoFeedActive) return;

    const interval = setInterval(() => {
      const typesList = Object.keys(THREAT_TYPES);
      const chosenType = typesList[Math.floor(Math.random() * typesList.length)];
      const { mitre, severities } = THREAT_TYPES[chosenType];
      const severity = severities[Math.floor(Math.random() * severities.length)] || 'MEDIUM';
      
      const newIndicator: ThreatIndicator = {
        threat_id: `TH-${Math.floor(100 + Math.random() * 900)}`,
        source_ip: generateThreatIp(),
        threat_type: chosenType,
        severity,
        timestamp: new Date().toLocaleTimeString(),
        ioc_hash: generateRandomHash(),
        mitre,
        confidence: Math.floor(60 + Math.random() * 40)
      };

      setIndicators(prev => [newIndicator, ...prev].slice(0, 30));

      // Auto-publish critical threats to event bus if automatic system allows
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        const autoEvent: PublishedEvent = {
          id: `PUB-${Math.floor(1000 + Math.random() * 9000)}`,
          severity,
          category: "detection",
          title: `TI Feed Auto-Trigger: ${newIndicator.threat_type}`,
          message: `Source: ${newIndicator.source_ip} | Confidence: ${newIndicator.confidence}%`,
          mitre: newIndicator.mitre,
          host: newIndicator.source_ip,
          action_taken: "IOC added to blocklist",
          timestamp: new Date().toLocaleTimeString()
        };
        setPublishedEvents(prev => [autoEvent, ...prev].slice(0, 20));
        addLog(`Event Publisher automatically dispatched IOC Blocklist event for ${newIndicator.threat_id}`, 'warn');
      } else {
        addLog(`System intercepted passive indicator state for ${newIndicator.threat_id}`, 'info');
      }

    }, 6000);

    return () => clearInterval(interval);
  }, [autoFeedActive, addLog]);

  // Inject a personalized threat parameter details
  const handleInjectThreat = (e: React.FormEvent) => {
    e.preventDefault();
    const mapDetails = THREAT_TYPES[customType] || { mitre: "T1059", severities: ["HIGH"] };
    const selectedIp = customIp || generateThreatIp();

    const injected: ThreatIndicator = {
      threat_id: `TH-${Math.floor(100 + Math.random() * 900)}`,
      source_ip: selectedIp,
      threat_type: customType,
      severity: customSeverity,
      timestamp: new Date().toLocaleTimeString(),
      ioc_hash: generateRandomHash(),
      mitre: mapDetails.mitre,
      confidence: customConfidence
    };

    setIndicators(prev => [injected, ...prev]);
    addLog(`Manually orchestrated tactical cyber threat vector: ${injected.threat_type} IP: ${injected.source_ip}`, 'warn');
    setCustomIp('');
  };

  // Publish to Event Bus publisher mechanics
  const handlePublishToEventBus = (indicator: ThreatIndicator) => {
    const newPubEvent: PublishedEvent = {
      id: `PUB-${Math.floor(1000 + Math.random() * 9000)}`,
      severity: indicator.severity,
      category: "detection",
      title: `TI Feed: ${indicator.threat_type}`,
      message: `Source: ${indicator.source_ip} | Confidence: ${indicator.confidence}%`,
      mitre: indicator.mitre,
      host: indicator.source_ip,
      action_taken: "IOC added to blocklist",
      timestamp: new Date().toLocaleTimeString()
    };

    setPublishedEvents(prev => [newPubEvent, ...prev]);
    addLog(`Published threat indicator ${indicator.threat_id} to internal security Event Bus publisher!`, 'success');
  };

  // Export buttons
  const exportAsCSV = () => {
    let csv = 'ThreatID,SourceIP,ThreatType,Severity,Timestamp,IOCHash,MITRE,Confidence\n';
    indicators.forEach(i => {
      csv += `"${i.threat_id}","${i.source_ip}","${i.threat_type}","${i.severity}","${i.timestamp}","${i.ioc_hash}","${i.mitre}",${i.confidence}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GHOST_WATCH_THREATS_REPORT.csv';
    link.click();
    addLog('Successfully generated and downloaded spreadsheet format CSV Threat feed.', 'success');
  };

  const exportAsJSON = () => {
    const payload = {
      agency: "GHOST-WATCH C2 CENTER",
      threatIntelVersion: "2.10-Apex",
      exportedAt: new Date().toISOString(),
      indicatorsCount: indicators.length,
      publishedToEventBusCount: publishedEvents.length,
      threatIndicators: indicators,
      busRegistry: publishedEvents
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GHOST_WATCH_INTEL_INDEX.json';
    link.click();
    addLog('Structured IOC JSON Database exported successfully.', 'success');
  };

  const purgeIndicators = () => {
    setIndicators([]);
    addLog('Cleared local intercept buffers.', 'warn');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line flex items-center justify-between">
        <span>Strategic Threat Intelligence // signal.ti_feed.mesh</span>
        <div className="flex gap-2">
          <button 
            onClick={exportAsCSV}
            className="flex items-center gap-1 px-2.5 py-1 bg-ghost-green/10 border border-ghost-green/40 hover:border-ghost-green hover:bg-ghost-green text-ghost-green hover:text-ghost-dark font-mono text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer"
          >
            <FileDown className="w-3 h-3" /> EXPORT_CSV
          </button>
          <button 
            onClick={exportAsJSON}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#121212] border border-ghost-border hover:border-ghost-green text-zinc-400 hover:text-ghost-green font-mono text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer"
          >
            <Cpu className="w-3 h-3" /> EXPORT_JSON_DATA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side Column: Configurator & Injector Options */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-ghost-surface border border-ghost-border p-5 rounded space-y-4">
            <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest pl-0">
              <ShieldAlert className="w-4 h-4 text-ghost-green animate-pulse" /> Threat Injector
            </h3>
            
            <form onSubmit={handleInjectThreat} className="space-y-4">
              <div className="space-y-1.5 cursor-pointer">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                  Target Source IP Address
                </label>
                <input 
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  placeholder="e.g. 185.112.91.4 or blank (auto)"
                  className="w-full bg-ghost-dark border border-ghost-border p-2 text-xs font-mono text-white focus:border-ghost-green outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                  Threat Campaign Type
                </label>
                <select 
                  value={customType}
                  onChange={(e) => {
                    setCustomType(e.target.value);
                    const avSeverities = THREAT_TYPES[e.target.value]?.severities || ['MEDIUM'];
                    setCustomSeverity(avSeverities[0]);
                  }}
                  className="w-full bg-ghost-dark border border-ghost-border text-[10px] font-mono p-2 text-ghost-green outline-none"
                >
                  {Object.keys(THREAT_TYPES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                    Severity
                  </label>
                  <select 
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value as any)}
                    className="w-full bg-ghost-dark border border-ghost-border text-[10px] font-mono p-1.5 text-ghost-warning outline-none"
                  >
                    {(THREAT_TYPES[customType]?.severities || ['MEDIUM']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                    Confidence ({customConfidence}%)
                  </label>
                  <input 
                    type="range"
                    min="60"
                    max="100"
                    value={customConfidence}
                    onChange={(e) => setCustomConfidence(parseInt(e.target.value))}
                    className="w-full h-1 mt-3 bg-zinc-805 appearance-none cursor-pointer accent-ghost-green"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-ghost-green text-ghost-dark py-2 rounded font-mono text-[10px] font-bold hover:bg-white hover:text-black transition-all uppercase tracking-wide"
                >
                  Inject Threat Node
                </button>
              </div>
            </form>
          </div>

          <div className="bg-ghost-surface border border-ghost-border p-5 rounded space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
               <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest pl-0">Publisher Bus State</h4>
               <span className={`w-2 h-2 rounded-full ${autoFeedActive ? 'bg-ghost-green animate-pulse' : 'bg-red-500'}`} />
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-zinc-500 uppercase">Automatic Intercepts</span>
                 <button 
                   onClick={() => setAutoFeedActive(!autoFeedActive)}
                   className={`px-2 py-0.5 border font-bold text-[8px] tracking-wide rounded-xs uppercase ${autoFeedActive ? 'bg-ghost-green/10 border-ghost-green/40 text-ghost-green hover:bg-ghost-green/20' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'}`}
                 >
                   {autoFeedActive ? 'PAUSE_STREAM' : 'RESUME_STREAM'}
                 </button>
               </div>

               <div className="text-[9px] font-mono text-zinc-500 uppercase leading-snug">
                 Tuned into 9 live attack profiles under MITRE Framework ATT&CK mapping rules.
               </div>

               <button 
                 onClick={purgeIndicators}
                 disabled={indicators.length === 0}
                 className="w-full font-mono text-[9px] text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 bg-transparent py-1.5 transition-colors uppercase disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
               >
                 <Trash2 className="w-3.5 h-3.5" /> Purge Threat Indicators
               </button>
            </div>
          </div>
        </div>

        {/* Central/Right Side Section: Feed Display, IOC details & Event Bus Monitor */}
        <div className="xl:col-span-3 space-y-6 flex flex-col h-full min-h-0">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            
            {/* Live Interactive Indicators Stream Column */}
            <div className="lg:col-span-2 bg-ghost-surface border border-ghost-border flex flex-col overflow-hidden rounded">
              <div className="p-4 border-b border-ghost-border flex items-center justify-between bg-ghost-dark/30">
                <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest pl-0">
                  <Globe className="w-3.5 h-3.5 text-ghost-green animate-spin" style={{ animationDuration: '15s' }} /> Active Threat Signal Dashboard
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase">
                  <span>QUEUE COUNT:</span>
                  <span className="text-white font-bold">{indicators.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead className="sticky top-0 bg-ghost-surface z-10 border-b border-ghost-border bg-ghost-dark/50">
                    <tr>
                      <th className="p-3 text-text-dim uppercase tracking-tighter">ID</th>
                      <th className="p-3 text-text-dim uppercase tracking-tighter">Source IP</th>
                      <th className="p-3 text-text-dim uppercase tracking-tighter">Att&ck Type / MITRE</th>
                      <th className="p-3 text-text-dim uppercase tracking-tighter">Sev</th>
                      <th className="p-3 text-text-dim uppercase tracking-tighter">Conf</th>
                      <th className="p-3 text-text-dim uppercase tracking-tighter text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {indicators.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-500 italic font-mono uppercase">
                            No threat indicators mapped. Stream suspended.
                          </td>
                        </tr>
                      ) : (
                        indicators.map((i) => (
                          <motion.tr 
                            key={`${i.threat_id}-${i.ioc_hash}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-ghost-border/40 hover:bg-ghost-green/5 transition-colors"
                          >
                            <td className="p-3 text-ghost-green font-bold">{i.threat_id}</td>
                            <td className="p-3 text-white tracking-wider">{i.source_ip}</td>
                            <td className="p-3">
                              <div className="font-bold text-[#e1e1e1]">{i.threat_type}</div>
                              <div className="text-[8px] text-zinc-500">MITRE: {i.mitre} | IOC Hash: {i.ioc_hash.substring(0, 10)}...</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded-sm font-bold text-[8px] whitespace-nowrap ${
                                i.severity === 'CRITICAL' ? 'bg-ghost-danger/15 text-ghost-danger border border-ghost-danger/30' :
                                i.severity === 'HIGH' ? 'bg-ghost-warning/15 text-ghost-warning border border-ghost-warning/30' :
                                i.severity === 'MEDIUM' ? 'bg-blue-950/30 text-blue-400 border border-blue-500/30' :
                                'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}>
                                {i.severity}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-ghost-green text-right sm:text-left">{i.confidence}%</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handlePublishToEventBus(i)}
                                className="px-2 py-1 bg-ghost-green text-ghost-dark text-[8px] font-mono tracking-tight font-extrabold hover:bg-white hover:text-black transition-all flex items-center gap-1 ml-auto"
                                title="Publish Threat indicators to Event Bus"
                              >
                                <Send className="w-2.5 h-2.5" /> PUBLISH_BUS
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Event Bus Dispatch Stream Monitor Column */}
            <div className="bg-ghost-surface border border-ghost-border rounded flex flex-col overflow-hidden">
               <div className="p-4 border-b border-ghost-border flex justify-between items-center bg-ghost-dark/30">
                  <h3 className="font-mono text-[10px] font-bold text-text-dim uppercase tracking-widest pl-0">
                     Event Bus Publisher Monitor
                  </h3>
                  <div className="px-1.5 py-0.5 bg-ghost-green/10 border border-ghost-green/30 text-ghost-green text-[8px] font-mono uppercase font-black animate-pulse">
                     ONLINE
                  </div>
               </div>

               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-black">
                  
                  {/* Python code equivalent bus display */}
                  <div className="space-y-1 pb-3 border-b border-zinc-900">
                     <span className="text-[8px] text-zinc-500 font-mono block uppercase">Active Publisher Source Code</span>
                     <div className="bg-ghost-dark p-2 border border-ghost-border/40 text-[9px] font-mono text-zinc-400 leading-normal select-text">
                        <span className="text-pink-500">pub</span> = EventPublisher(source=<span className="text-ghost-green">"ti_feed"</span>)<br/>
                        <span className="text-pink-500">for</span> indicator <span className="text-pink-500">in</span> feed:<br/>
                        &nbsp;&nbsp;<span className="text-pink-500">if</span> indicator.severity <span className="text-pink-500">in</span> (<span className="text-ghost-green">"CRITICAL", "HIGH"</span>):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;pub.publish(severity=indicator.severity, action_taken=<span className="text-amber-500">"IOC added to blocklist"</span>)
                     </div>
                  </div>

                  <div className="space-y-3.5">
                     <span className="text-[9px] text-[#b5b5b5] font-mono block font-bold uppercase tracking-wide">
                        Live Bus Signals ({publishedEvents.length})
                     </span>

                     <AnimatePresence initial={false}>
                        {publishedEvents.length === 0 ? (
                          <div className="text-center py-8 text-zinc-700 italic font-mono text-[9px] uppercase">
                             Empty Bus stream. Trigger live publishers using the buttons above.
                          </div>
                        ) : (
                          publishedEvents.map((ev) => (
                            <motion.div 
                              key={`${ev.id}-${ev.timestamp}-${ev.host}`}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 bg-[#0d0d0d] border border-ghost-border/60 rounded font-mono text-[9px] space-y-1.5 leading-snug"
                            >
                              <div className="flex justify-between items-center text-[8px] pb-1 border-b border-zinc-900">
                                <span className="text-pink-500 font-black">{ev.id}</span>
                                <span className="text-zinc-600">{ev.timestamp}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600 uppercase">TITLE:</span>
                                <span className="text-white truncate font-bold">{ev.title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600 uppercase">HOST IP:</span>
                                <span className="text-ghost-green">{ev.host}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600 uppercase">MITRE:</span>
                                <span className="text-zinc-400">{ev.mitre}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-600 uppercase">ACTION SEV:</span>
                                <span className={ev.severity === 'CRITICAL' ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>{ev.severity}</span>
                              </div>
                              <div className="flex justify-between font-extrabold text-[8px]">
                                <span className="text-zinc-600 uppercase">POLICY ACTION:</span>
                                <span className="text-[#a6e22e] bg-[#a6e22e]/10 px-1 border border-[#a6e22e]/30 uppercase text-[7px]">{ev.action_taken}</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>

          </div>

          {/* Quick System Summary Dashboard Bar */}
          <div className="bg-ghost-surface border border-ghost-border p-4 rounded grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-[10px]">
             <div className="space-y-1">
                <span className="text-zinc-500 uppercase">PQC Posture</span>
                <div className="flex items-center gap-1.5 text-ghost-green font-bold">
                   <ShieldCheck className="w-3.5 h-3.5" /> Kyber-1024 Level
                </div>
             </div>
             <div className="space-y-1">
                <span className="text-zinc-500 uppercase">Total Intercept IP Pool</span>
                <span className="text-white font-bold block">14,249 Nodes Monitored</span>
             </div>
             <div className="space-y-1">
                <span className="text-zinc-500 uppercase">Event Publisher Feed Status</span>
                <span className="text-ghost-green font-bold block animate-pulse">● BROADCASTING_SECURE</span>
             </div>
             <div className="space-y-1">
                <span className="text-zinc-500 uppercase">Bus Latency</span>
                <span className="text-zinc-400 font-bold block">12ms average dispatch</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
