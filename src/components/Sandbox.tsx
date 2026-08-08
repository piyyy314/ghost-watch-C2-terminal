/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Cpu, Activity, Zap, FileSearch, Trash2, Play, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Sandbox({ addLog }: { addLog: (msg: string, type?: any) => void }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<any>(null);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    setReport(null);
    addLog("Initializing AI-Driven Sandbox Analysis...", "info");

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(timer);
          // Move side effects out of the functional updater
          setTimeout(() => {
            setAnalyzing(false);
            setReport({
              threatLevel: 'SEVERE',
              entropyScore: '0.988',
              behavioralAnomalies: [
                'Heuristic match: Cobalt Strike beacon',
                'Attempted privilege escalation (CVE-2024-XXXX)',
                'Encrypted exfiltration to C2: 45.1.2.3',
                'Anti-VM detection patterns triggered'
              ],
              recommendation: 'PURGE_COGNITIVE_HASH'
            });
            addLog("Malware Sandbox Analysis Complete. Threat found.", "error");
          }, 0);
          return 100;
        }
        return next;
      });
    }, 50);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line">
        <span>Malware sandbox // ai.cognitive.isolation</span>
        <span>ENGINE: GHOST-NEURAL-V4</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="bg-ghost-surface border border-ghost-border p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-ghost-border pb-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ghost-green/10 border border-ghost-green/30 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-ghost-green" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Secure Isolation Chamber</h3>
                   <p className="text-[10px] text-text-dim font-mono">Upload suspicious payloads for behavioral analysis</p>
                </div>
             </div>
             <Lock className="w-4 h-4 text-ghost-green opacity-50" />
          </div>

          <div className="flex-1 border-2 border-dashed border-ghost-border bg-ghost-dark/30 flex flex-col items-center justify-center group hover:border-ghost-green/50 transition-all cursor-pointer p-8 text-center">
             <div className="w-16 h-16 rounded-full bg-ghost-surface flex items-center justify-center mb-4 border border-ghost-border group-hover:scale-110 transition-transform">
                <FileSearch className="w-8 h-8 text-text-dim group-hover:text-ghost-green" />
             </div>
             <p className="text-xs text-white uppercase font-bold tracking-widest mb-1">Drop Payload Here</p>
             <p className="text-[9px] text-text-dim font-mono uppercase">Supported: .elf, .bin, .vmem, .sys</p>
          </div>

          <button 
            onClick={startAnalysis}
            disabled={analyzing}
            className="w-full py-4 bg-ghost-green text-ghost-dark font-mono font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {analyzing ? (
               <>
                 <Activity className="w-4 h-4 animate-pulse" /> Analyzing Behavior...
               </>
            ) : (
               <>
                 <Play className="w-4 h-4" /> Execute Isolated Binary
               </>
            )}
          </button>
        </div>

        <div className="bg-ghost-surface border border-ghost-border overflow-hidden flex flex-col">
          <div className="p-3 border-b border-ghost-border flex items-center justify-between bg-ghost-dark/30">
            <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5 text-ghost-green" /> Analysis Report
            </h3>
            <div className="flex gap-2">
               <span className="text-[9px] font-mono text-zinc-600">ID: SAND-99120</span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-center gap-4"
                >
                  <div className="flex justify-between items-end font-mono text-[10px]">
                     <span className="text-ghost-green uppercase">Scanning Entropy...</span>
                     <span className="text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-ghost-dark rounded-full overflow-hidden border border-ghost-border">
                     <motion.div 
                        className="h-full bg-ghost-green" 
                        animate={{ width: `${progress}%` }}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="h-1 bg-ghost-border overflow-hidden relative">
                          <motion.div 
                            className="absolute inset-0 bg-ghost-green opacity-20"
                            animate={{ left: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                          />
                       </div>
                     ))}
                  </div>
                </motion.div>
              ) : report ? (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                >
                  <div className="flex items-center gap-4 border-b border-ghost-border pb-4">
                     <div className="bg-ghost-danger p-2">
                        <Zap className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <div className="text-[10px] text-ghost-danger font-bold uppercase tracking-widest font-mono">Threat_Detected</div>
                        <div className="text-2xl font-mono text-white leading-none mt-1">{report.threatLevel}</div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <div className="text-[10px] text-text-dim uppercase font-bold font-mono py-1">Behavioral Anomalies</div>
                        <div className="space-y-2 mt-2">
                           {report.behavioralAnomalies.map((anomaly: string, i: number) => (
                             <div key={i} className="text-[10px] items-start gap-3 flex text-white font-mono bg-ghost-dark p-2 border-l-2 border-ghost-danger">
                                <span className="text-ghost-danger opacity-50">{i+1}</span>
                                {anomaly}
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-ghost-dark p-3 border border-ghost-border">
                           <div className="text-[9px] text-text-dim uppercase font-mono">Entropy Score</div>
                           <div className="text-sm font-mono text-white mt-1">{report.entropyScore}</div>
                        </div>
                        <div className="bg-ghost-dark p-3 border border-ghost-border">
                           <div className="text-[9px] text-text-dim uppercase font-mono">AI Confidence</div>
                           <div className="text-sm font-mono text-white mt-1">99.4%</div>
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-3 bg-ghost-danger text-white font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-ghost-danger transition-all flex items-center justify-center gap-3 mt-4">
                     <Trash2 className="w-4 h-4" /> Purge Isolated Snapshot
                  </button>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                   <Activity className="w-12 h-12 text-text-dim mb-4" />
                   <p className="text-xs text-white uppercase font-bold font-mono">Awaiting Payload for Analysis</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
