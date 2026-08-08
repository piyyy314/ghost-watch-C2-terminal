import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, Eye, Zap, Flame, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface DefenseProps {
  addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function Defense({ addLog }: DefenseProps) {
  const [tarpitActive, setTarpitActive] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(1);

  const toggleTarpit = () => {
    setTarpitActive(!tarpitActive);
    addLog(`Active Tarpitting ${!tarpitActive ? 'ENABLED' : 'DISABLED'} for all ingress traffic`, !tarpitActive ? 'success' : 'warn');
  };

  const clearAlerts = () => {
    setActiveAlerts(0);
    addLog("Intrusion alerts cleared. Systems resumed normal baseline.", "info");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line">
        <span>Active Defense // canary.mesh.dist</span>
        <span>AUTH: GHOST-01</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-ghost-surface border border-ghost-border p-5 relative overflow-hidden">
             {activeAlerts > 0 && (
               <div className="absolute top-0 right-0 p-4">
                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-1.5 bg-ghost-danger text-white px-2 py-0.5 text-[9px] font-mono font-bold"
                  >
                    <ShieldAlert className="w-3 h-3" /> ALERT_ID_744
                  </motion.div>
               </div>
             )}

             <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 mb-5 uppercase tracking-widest">
                <Terminal className="w-3.5 h-3.5 text-ghost-green" /> Defense Control Matrix
             </h3>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { 
                    id: 'tarpit', 
                    name: 'Tarpit Protocols', 
                    desc: 'Artificial TCP latency injection.',
                    active: tarpitActive,
                    action: toggleTarpit,
                    icon: Flame
                  },
                  { 
                    id: 'canary', 
                    name: 'Canary Mesh', 
                    desc: 'Deceptive session tokens.',
                    active: true,
                    action: () => addLog("Canary token mesh is immutable in Apex Tier.", "warn"),
                    icon: Eye
                  },
                  { 
                    id: 'logic', 
                    name: 'AI Logic Guard', 
                    desc: 'Prompt injection sanitization.',
                    active: true,
                    action: () => addLog("AI Logic Guard actively sanitizing ingress buffers.", "info"),
                    icon: Cpu
                  },
                  { 
                    id: 'fido', 
                    name: 'FIDO2 Enforcement', 
                    desc: 'Mandatory YubiKey binding.',
                    active: true,
                    action: () => addLog("FIDO2 binding confirmed for current terminal.", "success"),
                    icon: Shield
                  }
                ].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={feature.id}
                      className={`p-3.5 border transition-all ${feature.active ? 'bg-ghost-green/5 border-ghost-green/30' : 'bg-ghost-dark border-ghost-border'}`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <Icon className={`w-4 h-4 ${feature.active ? 'text-ghost-green' : 'text-zinc-700'}`} />
                        <button 
                          onClick={feature.action}
                          className={`text-[8px] font-mono px-2 py-0.5 border transition-colors uppercase font-bold tracking-tighter ${feature.active ? 'bg-ghost-green text-ghost-dark border-ghost-green' : 'border-ghost-border text-zinc-600 hover:text-white'}`}
                        >
                          {feature.active ? 'ENABLED' : 'OFFLINE'}
                        </button>
                      </div>
                      <h4 className={`text-[11px] font-mono font-bold uppercase tracking-tight ${feature.active ? 'text-white' : 'text-zinc-600'}`}>{feature.name}</h4>
                      <p className="text-[9px] text-zinc-500 mt-1 font-mono leading-tight">{feature.desc}</p>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-ghost-surface border border-ghost-border p-5 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5 text-ghost-green" /> Mitigation Velocity
                </h3>
             </div>
             
             <div className="flex items-end justify-between h-24 gap-1.5 mt-2">
                {[...Array(32)].map((_, i) => {
                  const val = Math.random() * 80 + 20;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                       <motion.div 
                          className="w-full bg-ghost-green opacity-40 border-t border-ghost-green"
                          animate={{ height: `${val}%` }}
                          transition={{ duration: 0.5 }}
                       />
                    </div>
                  );
                })}
             </div>
             <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase border-t border-ghost-border pt-2 tracking-widest">
                <span>00:00:00</span>
                <span>Active Threat Persistence // Real-Time</span>
                <span>23:59:59</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-ghost-surface border border-ghost-border p-5 flex flex-col gap-4 h-full">
            <h3 className="font-mono text-[10px] font-bold text-text-dim uppercase tracking-widest">
              Incident Queue
            </h3>
            
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
               {activeAlerts > 0 ? (
                 [
                  { vector: 'TCP_FLOOD_BYPASS', origin: '192.168.4.1', type: 'Critical' },
                  { vector: 'LLM_PROMPT_ESCAPE', origin: 'Session_442', type: 'High' },
                  { vector: 'CANARY_TOKEN_TRIP', origin: 'Internal_DB_S1', type: 'Severe' },
                 ].map((alert, i) => (
                    <div key={i} className="bg-ghost-dark p-2.5 border-l-2 border-ghost-danger border-y border-r border-ghost-border flex flex-col gap-0.5">
                       <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-ghost-danger font-bold uppercase">{alert.type}</span>
                          <span className="text-zinc-600 lowercase">2m ago</span>
                       </div>
                       <div className="text-[11px] font-mono text-white tracking-widest uppercase font-bold">{alert.vector}</div>
                       <div className="text-[8px] font-mono text-text-dim opacity-70 italic">{alert.origin}</div>
                    </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3 grayscale">
                    <Shield className="w-10 h-10" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-center">Threat Matrix Clean</span>
                 </div>
               )}
            </div>

            <button 
              onClick={clearAlerts}
              className={`w-full py-2 font-mono text-[9px] font-bold transition-all border ${activeAlerts > 0 ? 'bg-ghost-danger text-white border-ghost-danger hover:bg-white hover:text-ghost-danger' : 'bg-transparent text-zinc-700 border-ghost-border cursor-not-allowed opacity-50 uppercase shadow-none'}`}
            >
              PURGE_INCIDENT_QUEUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
