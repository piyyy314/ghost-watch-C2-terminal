/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, ShieldCheck, User, Cpu, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  encrypted: boolean;
}

export default function SecureComm({ addLog }: { addLog: (msg: string, type?: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: 'Secure PQC-Link Established. KYBER-1024 Handshake Verified.', timestamp: '10:01', encrypted: true },
    { id: '2', sender: 'agent', text: 'Waiting for tactical directive...', timestamp: '10:02', encrypted: true },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    addLog(`Outgoing signal encrypted via Dilithium-3.`, 'info');

    // Simulate Agent Response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `Message Received. Data decohered and processed. Standing by.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        encrypted: true
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="panel-header-line">
        <span>Secure communication // pqc.link.stream</span>
        <span>CIPHER: KYBER-1024 / DILITHIUM-3</span>
      </div>

      <div className="flex-1 flex flex-col bg-ghost-surface border border-ghost-border overflow-hidden">
        {/* Header Status */}
        <div className="p-3 border-b border-ghost-border flex items-center justify-between bg-ghost-dark/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ghost-green shadow-[0_0_8px_rgba(0,255,65,0.5)]" />
            <h3 className="font-mono text-[10px] font-bold text-white uppercase tracking-widest">End-to-End Encrypted Channel</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-ghost-green rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-ghost-green">PQC_SYNC_OK</span>
             </div>
             <div className="w-px h-3 bg-ghost-border" />
             <span className="text-[9px] font-mono text-text-dim">LATENCY: 12ms</span>
          </div>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[url('/grid.svg')] bg-repeat">
           <AnimatePresence initial={false}>
             {messages.map((msg) => (
               <motion.div 
                 key={msg.id}
                 initial={{ opacity: 0, y: 10, scale: 0.98 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
               >
                 <div className={`flex items-center gap-2 mb-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 border flex items-center justify-center ${msg.sender === 'user' ? 'bg-ghost-green border-ghost-green' : 'bg-ghost-dark border-ghost-border'}`}>
                       {msg.sender === 'user' ? <User className="w-3 h-3 text-ghost-dark" /> : <Cpu className="w-3 h-3 text-ghost-green" />}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-text-dim uppercase tracking-widest">
                       {msg.sender === 'user' ? 'LOCAL_NODE' : 'REMOTE_COMMAND'}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-700">{msg.timestamp}</span>
                 </div>

                 <div className={`max-w-[80%] p-4 border font-mono text-xs relative ${
                    msg.sender === 'user' 
                    ? 'bg-ghost-green/10 border-ghost-green text-ghost-green rounded-tl-xl rounded-bl-xl rounded-br-sm' 
                    : 'bg-ghost-dark border-ghost-border text-white rounded-tr-xl rounded-br-xl rounded-bl-sm shadow-xl'
                 }`}>
                    {msg.sender !== 'user' && (
                       <Terminal className="w-3 h-3 text-ghost-green absolute top-2 right-2 opacity-30" />
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">
                       {msg.text}
                    </div>
                    {msg.encrypted && (
                       <div className="mt-3 pt-3 border-t border-ghost-border/30 flex items-center justify-between">
                          <div className="flex gap-1">
                             <div className="w-1 h-3 bg-ghost-green/40" />
                             <div className="w-1 h-3 bg-ghost-green/20" />
                             <div className="w-1 h-3 bg-ghost-green/60" />
                          </div>
                          <span className="text-[8px] uppercase tracking-tighter opacity-40 font-bold">AES-256-GCM_WRAPPED</span>
                       </div>
                    )}
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-ghost-dark border-t border-ghost-border">
          <div className="flex gap-4 items-center">
             <div className="flex-1 relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="TRANSMIT SECURE SIGNAL..."
                  className="w-full bg-ghost-surface border border-ghost-border p-3 pl-10 font-mono text-xs text-white placeholder:text-zinc-700 focus:border-ghost-green outline-none transition-all"
                />
                <Zap className="w-4 h-4 text-ghost-warning absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
             </div>
             <button 
               onClick={handleSend}
               disabled={!input.trim()}
               className="p-3 bg-ghost-green text-ghost-dark hover:bg-white transition-all disabled:opacity-20"
             >
                <Send className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
      
      <div className="bg-ghost-warning/5 border border-ghost-warning/30 p-4 flex items-center gap-4">
         <Lock className="w-8 h-8 text-ghost-warning opacity-50" />
         <div className="flex-1">
            <h4 className="text-[10px] font-bold text-ghost-warning uppercase tracking-widest font-mono">Cognitive Integrity Enforced</h4>
            <p className="text-[9px] text-text-dim font-mono uppercase mt-1">This channel is quantum-resistant. No records are kept in central buffers.</p>
         </div>
      </div>
    </div>
  );
}
