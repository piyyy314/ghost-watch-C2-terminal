import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Globe, Maximize2, Download, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface SatComProps {
  addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function SatCom({ addLog }: SatComProps) {
  const [dopplerShift, setDopplerShift] = useState(0.00);
  const [compressionMode, setCompressionMode] = useState('NARROWBAND_EXTREME');

  const [signalLogs, setSignalLogs] = useState<string[]>([
    "[*] Starting Signal Baseline Monitor...",
  ]);
  const [currentSignal, setCurrentSignal] = useState({ snr: 12.44, ber: '2.1e-08' });
  const terminalContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDopplerShift(prev => {
        const next = prev + (Math.random() - 0.5) * 0.05;
        return parseFloat(next.toFixed(4));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const snr = parseFloat((Math.random() * (15.0 - 9.5) + 9.5).toFixed(2));
      const berExponent = Math.floor(Math.random() * 3) + 6; // e-8 to e-6
      const berBase = (Math.random() * 8 + 1).toFixed(1);
      const ber = `${berBase}e-0${berExponent}`;
      
      setCurrentSignal({ snr, ber });
      setSignalLogs(prev => {
        const next = [...prev, `[Signal] SNR: ${snr}dB | BER: ${ber} | Status: NORMAL`];
        return next.slice(-15);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [signalLogs]);

  const satellites = [
    { name: 'GHOST-LEO-01', dist: '422km', signal: 92, lat: '42.12N', lon: '12.44W' },
    { name: 'GHOST-LEO-02', dist: '488km', signal: 74, lat: '15.55S', lon: '33.22E' },
    { name: 'STARLINK-GEN3', dist: '550km', signal: 48, lat: '22.01N', lon: '0.12W' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line">
        <span>GHOST-LEO Satellite Array // satcom.src</span>
        <span>AUTH: APEX</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ghost-surface border border-ghost-border flex flex-col overflow-hidden">
           <div className="p-4 border-b border-ghost-border flex items-center justify-between bg-ghost-dark/30">
              <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                 <Globe className="w-3.5 h-3.5 text-ghost-green" /> Orbital Visualizer
              </h3>
              <div className="flex gap-2 items-center">
                 <div className="w-1.5 h-1.5 bg-ghost-green animate-pulse" />
                 <span className="text-[10px] font-mono text-ghost-green font-bold">LIVE_TX</span>
              </div>
           </div>
           
           <div className="relative h-64 bg-ghost-dark flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                 <div className="w-full h-full border border-ghost-green/20 rounded-full scale-[2]" />
                 <div className="w-full h-full border border-ghost-green/20 rounded-full scale-[1.5]" />
                 <div className="w-full h-full border border-ghost-green/20 rounded-full scale-[1]" />
              </div>
              
              <div className="relative z-10 w-48 h-48 border border-ghost-border rounded-full flex items-center justify-center">
                 <div className="w-32 h-32 border border-ghost-border/50 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute w-4 h-4 bg-ghost-green rounded-full blur-sm" />
                 
                 {/* Satellites */}
                 {satellites.map((sat, i) => (
                   <motion.div
                     key={sat.name}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                     className="absolute w-full h-full"
                   >
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center group">
                        <Satellite className="w-4 h-4 text-ghost-green cursor-crosshair hover:scale-125 transition-transform" />
                        <div className="absolute top-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-ghost-dark border border-ghost-border p-2 rounded text-[9px] font-mono z-20">
                           <div className="text-ghost-green font-bold">{sat.name}</div>
                           <div className="text-zinc-500">{sat.dist} | {sat.lat}</div>
                        </div>
                     </div>
                   </motion.div>
                 ))}

                 <div className="w-2 h-2 bg-white rounded-full relative z-20" />
              </div>

              <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                 <span className="text-[9px] font-mono text-zinc-500">DOPPLER_FREQ_CORRECTION</span>
                 <span className="text-xs font-mono text-ghost-green">{dopplerShift > 0 ? '+' : ''}{dopplerShift} Hz</span>
              </div>
           </div>

           <div className="p-3 grid grid-cols-3 gap-2 bg-ghost-dark/50 border-t border-ghost-border">
              {satellites.map((sat) => (
                <div key={sat.name} className="flex flex-col gap-1.5 p-2 bg-ghost-surface border border-ghost-border font-mono uppercase">
                   <span className="text-[9px] text-text-dim truncate font-bold">{sat.name}</span>
                   <div className="flex items-center justify-between gap-2 leading-none">
                       <span className="text-[10px] text-white">{sat.signal}%</span>
                       <div className="flex-1 h-0.5 bg-ghost-dark overflow-hidden">
                          <div className="h-full bg-ghost-green" style={{ width: `${sat.signal}%` }} />
                       </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="flex flex-col gap-8">
           <div className="bg-ghost-surface border border-ghost-border p-6 rounded space-y-4">
              <h3 className="font-mono text-xs font-bold text-zinc-400 flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-ghost-green" /> Media Forge Payload
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500">Compression Tier</span>
                    <select 
                      value={compressionMode}
                      onChange={(e) => {
                        setCompressionMode(e.target.value);
                        addLog(`Media Forge updated to ${e.target.value}`, 'info');
                      }}
                      className="bg-ghost-dark border border-ghost-border text-[10px] font-mono px-2 py-1 rounded outline-none text-ghost-green"
                    >
                       <option value="NARROWBAND_EXTREME">NARROWBAND_EXTREME (90%)</option>
                       <option value="LOW_LATENCY_WEBASH">LOW_LATENCY_STREAM</option>
                       <option value="LOSSLESS_ENCRYPTED">LOSSLESS_ENCRYPTED</option>
                    </select>
                 </div>

                 <div className="aspect-video bg-ghost-dark rounded border border-ghost-border flex flex-col items-center justify-center p-8 gap-4 overflow-hidden relative group">
                    <Download className="w-8 h-8 text-zinc-700 group-hover:text-ghost-green transition-colors" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase text-center">Drop tactical media here for Forge-Link processing</span>
                    <div className="absolute inset-0 bg-ghost-green/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-ghost-green font-mono text-[10px] font-bold">READY_TO_FORGE</span>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <button className="flex-1 border border-ghost-border py-2 rounded font-mono text-[10px] text-zinc-400 hover:bg-ghost-surface transition-all flex items-center justify-center gap-2">
                       <Maximize2 className="w-3 h-3" /> PREVIEW_FORGE
                    </button>
                    <button 
                      onClick={() => addLog("Media package compressed and queued for LEO-01 uplink.", "success")}
                      className="flex-1 bg-ghost-green text-ghost-dark py-2 rounded font-mono text-[10px] font-bold hover:bg-white transition-all"
                    >
                       INIT_FORGE_UPLINK
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-ghost-surface border border-ghost-border p-4 sm:p-6 rounded flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                 
                 {/* Spectrum Analysis Column */}
                 <div className="flex flex-col space-y-3">
                    <h3 className="font-mono text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                       <Radio className="w-4 h-4 text-ghost-green animate-pulse" /> Spectrum Analysis
                    </h3>
                    <div className="flex-1 min-h-[80px] flex items-end gap-1 pt-4">
                       {[...Array(12)].map((_, i) => (
                         <motion.div 
                           key={i}
                           animate={{ height: [30, 70, 40, 90, 50] }}
                           transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                           className="flex-1 bg-ghost-green shadow-[0_0_10px_rgba(0,255,65,0.2)] rounded-t-sm"
                         />
                       ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-zinc-600 border-t border-ghost-border pt-1.5 uppercase tracking-tight">
                       <span>915MHz</span>
                       <span>LoRa Mesh</span>
                       <span>928MHz</span>
                    </div>
                 </div>

                 {/* LEO Orbit 14 Signal Monitor Column */}
                 <div className="flex flex-col space-y-2 border-t md:border-t-0 md:border-l border-ghost-border pt-4 md:pt-0 md:pl-6">
                    <div className="flex items-center justify-between">
                       <h3 className="font-mono text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                          <Satellite className="w-4 h-4 text-ghost-green animate-pulse" /> LEO Sat Orbit 14
                       </h3>
                       <div className="px-1.5 py-0.5 border border-ghost-green bg-ghost-green/5 text-ghost-green text-[8px] font-mono uppercase font-bold animate-pulse">
                          LOCK_ON
                       </div>
                    </div>
                    
                    {/* Modern Telemetry metrics displays */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                       <div className="border border-ghost-border bg-ghost-dark/40 p-1.5 rounded font-mono">
                          <div className="text-[8px] text-zinc-500 uppercase font-semibold">SNR LEVEL</div>
                          <div className="text-xs font-bold text-white">{currentSignal.snr} dB</div>
                       </div>
                       <div className="border border-ghost-border bg-ghost-dark/40 p-1.5 rounded font-mono">
                          <div className="text-[8px] text-zinc-500 uppercase font-semibold">BIT ERROR RATE</div>
                          <div className="text-xs font-bold text-white whitespace-nowrap">{currentSignal.ber}</div>
                       </div>
                    </div>

                    {/* Live Scrolling Log stream */}
                    <div ref={terminalContainerRef} className="flex-1 min-h-[90px] max-h-[140px] bg-black border border-ghost-border p-2 rounded font-mono text-[8px] leading-tight text-ghost-green overflow-y-auto custom-scrollbar flex flex-col gap-1 select-text">
                       {signalLogs.map((log, index) => (
                          <div 
                             key={index} 
                             className={log.startsWith('[*]') ? 'text-zinc-500 italic' : 'text-ghost-green font-bold'}
                          >
                             {log}
                          </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
