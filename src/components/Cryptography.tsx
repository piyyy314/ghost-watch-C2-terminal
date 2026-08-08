import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, Key, RefreshCw, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface CryptographyProps {
  addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function Cryptography({ addLog }: CryptographyProps) {
  const [isRotating, setIsRotating] = useState(false);
  const [pqcEnabled, setPqcEnabled] = useState(true);

  const rotateKeys = () => {
    setIsRotating(true);
    addLog("Initiating Dilithium-5 Key Rotation...", "info");
    setTimeout(() => {
      setIsRotating(false);
      addLog("Master Seed Rotated. New fragment distributed across mesh clusters.", "success");
    }, 2000);
  };

  const protocols = [
    { name: 'Kyber-1024', type: 'KEM (Key Encapsulation)', level: 'Level 5 (Max)', status: 'Active' },
    { name: 'Dilithium-5', type: 'Digital Signature', level: 'Level 5 (Max)', status: 'Active' },
    { name: 'AES-256-GCM', type: 'Symmetric Block Cipher', level: 'Legacy Hardened', status: 'Active' },
    { name: 'SHA-3-512', type: 'Cryptographic Hash', level: 'Quantum-Hardened', status: 'Active' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line">
        <span>Cryo-Vault // NIST_PQC_HANDSHAKE</span>
        <span>LEVEL: APEX_S</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="space-y-6">
          <div className="bg-ghost-surface border border-ghost-border p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 text-ghost-green" /> Key Lifecycle
              </h3>
              <div className={`px-2 py-0.5 text-[9px] font-mono border ${pqcEnabled ? 'bg-ghost-green/10 text-ghost-green border-ghost-green/30' : 'bg-ghost-danger/10 text-ghost-danger border-ghost-danger/30'}`}>
                {pqcEnabled ? 'PQC_ENFORCED' : 'LEGACY_MODE'}
              </div>
            </div>

            <div className="bg-ghost-dark p-4 border border-ghost-border flex flex-col gap-3">
               <div className="flex flex-col gap-1.5">
                 <span className="text-[9px] text-text-dim font-mono uppercase">Master Seed Fingerprint</span>
                 <code className="text-ghost-green bg-ghost-green/5 p-2 border border-ghost-green/10 text-[11px] break-all font-mono leading-tight">
                   GHOST_772A_88B3_CC12_FE49_9921_AF00_DE12_BCEE
                 </code>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={rotateKeys}
                   disabled={isRotating}
                   className="flex-1 bg-ghost-green text-ghost-dark px-4 py-2 font-mono text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-white transition-all uppercase"
                 >
                   <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
                   {isRotating ? 'REGEN_INITIATED' : 'ROTATE_FRAGMENTS'}
                 </button>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-dim font-mono uppercase tracking-widest">Protocol Sync</span>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" checked={pqcEnabled} onChange={(e) => {
                      setPqcEnabled(e.target.checked);
                      addLog(`Protocol Security Level updated to ${e.target.checked ? 'PQC-MAX' : 'MIXED-LEGACY'}`, e.target.checked ? 'success' : 'warn');
                    }} className="sr-only peer" />
                    <div className="w-8 h-4 bg-ghost-dark peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-300 after:border after:rounded-none after:h-3 after:w-3 after:transition-all peer-checked:after:bg-ghost-green peer-checked:bg-ghost-green/20 border border-ghost-border"></div>
                  </label>
               </div>
               <p className="text-[9px] text-zinc-500 font-mono italic leading-relaxed">
                 Kyber-1024 enforcement active. Handshake latency +12ms. Status: SECURE.
               </p>
            </div>
          </div>

          <div className="bg-ghost-surface border border-ghost-border p-5 flex flex-col gap-4">
             <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                <Database className="w-3.5 h-3.5 text-ghost-green" /> Entropy Analysis
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-ghost-dark p-3 border border-ghost-border">
                  <span className="text-[8px] text-text-dim font-mono uppercase tracking-tighter">Pool Depth</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-mono text-white">4096 / B1</span>
                  </div>
                </div>
                <div className="bg-ghost-dark p-3 border border-ghost-border">
                  <span className="text-[8px] text-text-dim font-mono uppercase tracking-tighter">I/O Velocity</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-mono text-white">12.2 ms</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-ghost-surface border border-ghost-border flex flex-col overflow-hidden">
           <div className="p-4 border-b border-ghost-border bg-ghost-dark/30">
              <h3 className="font-mono text-[10px] font-bold text-text-dim uppercase tracking-widest">
                Active Protocol Stack
              </h3>
           </div>
           <div className="divide-y divide-ghost-border">
              {protocols.map((proto) => (
                <div key={proto.name} className="p-3.5 flex items-center justify-between hover:bg-ghost-surface transition-colors">
                  <div className="flex flex-col">
                    <span className="text-white font-mono text-[11px] uppercase font-bold tracking-tight">{proto.name}</span>
                    <span className="text-text-dim font-mono text-[9px] uppercase tracking-tighter">{proto.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-ghost-green font-mono text-[9px] italic uppercase">{proto.level}</span>
                    <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">STABLE</span>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="flex-1 bg-ghost-dark/50 p-6 flex flex-col justify-center items-center gap-3">
              <div className="p-3 border border-ghost-green/20 relative">
                 <RefreshCw className="w-8 h-8 text-ghost-green/10 animate-[spin_12s_linear_infinite]" />
                 <Key className="w-4 h-4 text-ghost-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-zinc-600 font-mono text-center text-[9px] max-w-[180px] uppercase leading-tight tracking-tighter">
                QKD Entropy Injection Active. Session tunnel parity verified.
              </p>
           </div>
        </div>
      </div>
    </div>
  );

}
