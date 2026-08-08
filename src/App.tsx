/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Satellite, 
  Terminal as TerminalIcon, 
  Lock, 
  Activity, 
  AlertTriangle,
  Cpu,
  Radio,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleId, INITIAL_STATUS, SystemStatus, CustomTraceConfig } from './types';

// Module Components
import Overview from './components/Overview';
import Cryptography from './components/Cryptography';
import Defense from './components/Defense';
import SatCom from './components/SatCom';
import Logs from './components/Logs';
import Geolocation from './components/Geolocation';
import Intelligence from './components/Intelligence';
import Sandbox from './components/Sandbox';
import SecureComm from './components/SecureComm';
import Tactical from './components/Tactical';
import { LocateFixed, Database, Zap, MessageSquare, Layers } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [status, setStatus] = useState<SystemStatus>(INITIAL_STATUS);
  const [bootSequence, setBootSequence] = useState(true);
  const [logs, setLogs] = useState<{ id: string; msg: string; type: 'info' | 'warn' | 'error' | 'success' }[]>([]);
  const [customTraces, setCustomTraces] = useState<CustomTraceConfig[]>([
    {
      id: 'TRC-9421',
      ipOrDomain: 'shadow-networks.apex',
      phoneNumber: '+1 (555) 102-9982',
      crystalType: 'Barium Borate [BBO-Apex]',
      resonatingFrequency: 1820.55,
      echoDelay: 250,
      echoFeedback: 75,
      timestamp: '03:45Z',
      status: 'QUEUED'
    }
  ]);

  // Automatically detect screen size and adapt layouts
  useEffect(() => {
    const handleResize = () => {
      const mobileActive = window.innerWidth < 1024;
      setIsMobile(mobileActive);
      if (mobileActive) {
        setIsLeftOpen(false);
        setIsRightOpen(false);
      } else {
        setIsLeftOpen(true);
        setIsRightOpen(true);
      }
    };
    handleResize(); // Execute once to initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(36), msg, type }, ...prev].slice(0, 100));
  };

  const navItems = [
    { id: 'overview' as const, label: 'Systems Brief', icon: Activity },
    { id: 'cryptography' as const, label: 'Crypto Engine', icon: Lock },
    { id: 'defense' as const, label: 'Active Defense', icon: Shield },
    { id: 'satcom' as const, label: 'SatCom Module', icon: Satellite },
    { id: 'geolocation' as const, label: 'Geo-Trace', icon: LocateFixed },
    { id: 'intelligence' as const, label: 'Threat Intel', icon: Database },
    { id: 'sandbox' as const, label: 'Neural Box', icon: Zap },
    { id: 'comm' as const, label: 'PQC Comms', icon: MessageSquare },
    { id: 'tactical' as const, label: 'Tactical Feed', icon: Layers },
    { id: 'logs' as const, label: 'Secure Logs', icon: TerminalIcon },
  ];

  if (bootSequence) {
    return (
      <div className="h-screen w-screen bg-ghost-dark flex flex-col items-center justify-center p-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-ghost-green blur-2xl opacity-10 rounded-full animate-pulse" />
          <Shield className="w-24 h-24 text-ghost-green relative z-10" />
        </motion.div>
        <div className="font-mono text-ghost-green text-sm tracking-widest pt-4">
          <motion.div
             initial={{ width: 0 }}
             animate={{ width: "auto" }}
             transition={{ duration: 1, ease: "linear" }}
             className="whitespace-nowrap overflow-hidden border-r-2 border-ghost-green"
          >
            BOOT_SEQUENCE_ALPHA_CORE_INIT...
          </motion.div>
        </div>
        <div className="w-64 h-1 bg-ghost-surface overflow-hidden rounded-full">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-ghost-green"
          />
        </div>
      </div>
    );
  }

  const renderLeftPanelContent = (isCollapsedMode = false) => {
    return (
      <div className={`flex flex-col gap-[15px] h-full ${isCollapsedMode ? 'items-center px-1' : ''}`}>
        <div className="panel-header-line w-full flex items-center justify-between">
          {!isCollapsedMode ? (
            <>
              <span className="font-semibold">System Modules</span>
              <span className="text-[9px] opacity-65">v6.0.4</span>
            </>
          ) : (
            <span className="mx-auto text-[9px] font-bold">C2</span>
          )}
        </div>
        
        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  if (isMobile) {
                    setMobileLeftOpen(false);
                  }
                }}
                title={isCollapsedMode ? item.label : undefined}
                className={`w-full flex transition-all text-left group relative ${
                  isCollapsedMode 
                    ? 'p-2 justify-center border hover:bg-ghost-surface' 
                    : 'flex-col p-2.5 border'
                } ${
                  isActive 
                    ? 'border-ghost-green bg-ghost-green/5 text-white' 
                    : 'border-ghost-border text-text-dim hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-2 ${isCollapsedMode ? '' : 'mb-1'}`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-ghost-green' : 'text-zinc-600 group-hover:text-white'}`} />
                  {!isCollapsedMode && (
                    <strong className="text-[11px] font-mono uppercase tracking-tighter whitespace-nowrap">{item.label}</strong>
                  )}
                </div>
                {!isCollapsedMode && (
                  <span className="text-[9px] text-text-dim uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.id === 'overview' && 'Stats / Health / Bio'}
                    {item.id === 'cryptography' && 'Kyber / Dilithium / NIST'}
                    {item.id === 'defense' && 'Canary / Tarpitting'}
                    {item.id === 'satcom' && 'Doppler / Media Forge'}
                    {item.id === 'geolocation' && 'Trace / Locate / Neutralize'}
                    {item.id === 'intelligence' && 'Nexus / Feed / Analysis'}
                    {item.id === 'sandbox' && 'Isolate / AI / Malware'}
                    {item.id === 'comm' && 'PQC / Cipher / Secure'}
                    {item.id === 'tactical' && 'Sat / Weather / Traffic'}
                    {item.id === 'logs' && 'Immutable / Audit'}
                  </span>
                )}
                {isCollapsedMode && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black border border-ghost-border text-[9px] font-mono uppercase tracking-widest text-ghost-green opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsedMode && (
          <>
            <div className="panel-header-line mt-4">
              <span>Active Processes</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="text-[10px] font-mono border-l-2 border-ghost-border pl-2 py-0.5 text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">PID 4402 - Encrypting Stream...</div>
              <div className="text-[10px] font-mono border-l-2 border-ghost-border pl-2 py-0.5 text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">PID 881 - Scrubbing Metadata...</div>
              <div className="text-[10px] font-mono border-l-2 border-ghost-border pl-2 py-0.5 text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">PID 109 - LEO Sync Locked</div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRightPanelContent = () => {
    return (
      <div className="flex flex-col gap-[15px] h-full">
        <div className="panel-header-line flex justify-between items-center">
          <span>Threat Mitigation</span>
          {!isMobile && (
            <button 
              onClick={() => setIsRightOpen(false)}
              className="text-[9px] text-zinc-500 hover:text-ghost-green cursor-pointer uppercase font-mono px-1 border border-zinc-800 hover:border-ghost-green/30"
              title="Close Panel"
            >
              Collapse
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
           <div className="text-[11px] font-mono border-l-2 border-ghost-border pl-2 py-1">
              <span className="text-white">Inbound Phishing</span><br/>
              <small className="text-ghost-green uppercase font-bold text-[9px]">IMMUNITY: FIDO2</small>
           </div>
           <div className="text-[11px] font-mono border-l-2 border-ghost-border pl-2 py-1">
              <span className="text-white">Voice Cloning</span><br/>
              <small className="text-ghost-warning uppercase font-bold text-[9px]">AUDIT: Heuristic Active</small>
           </div>
           <div className="text-[11px] font-mono border-l-2 border-ghost-danger pl-2 py-1">
              <span className="text-ghost-danger">Loc. Tracking Attempt</span><br/>
              <small className="text-text-dim uppercase text-[9px]">ACTION: Metadata Scrubbing</small>
           </div>
        </div>

        <div className="panel-header-line mt-4">
          <span>C2 Environment</span>
        </div>
        <div className="text-[11px] text-text-dim font-mono space-y-1">
          <p>Uptime: 412:12:05</p>
          <p>Memory: 1.4GB / 32GB</p>
          <p>Network: 915.0 MHz (LoRa)</p>
          <p>Gateway: 127.0.0.1:8080</p>
        </div>

        <div className="flex-1" />

        <div className="bg-ghost-warning/10 border border-ghost-warning p-3 mt-auto">
           <div className="text-[9px] text-ghost-warning uppercase font-bold font-mono">Entropy Shield</div>
           <div className="text-xl font-mono text-ghost-warning leading-none mt-1">99.99%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-ghost-dark flex flex-col text-sm overflow-hidden relative font-sans">
      <div className="scanline pointer-events-none" />
      
      {/* Header Bar */}
      <header className="h-[60px] border-b-2 border-ghost-border flex items-center px-4 justify-between bg-gradient-to-r from-[#151515] to-ghost-dark z-30 select-none">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Drawer Triggers */}
          {isMobile && (
            <button 
              onClick={() => setMobileLeftOpen(!mobileLeftOpen)}
              className="p-2 border border-ghost-border text-ghost-green hover:border-ghost-green/50 active:bg-ghost-surface mr-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold tracking-tighter text-[#E0E0E0] leading-none uppercase">GHOST-WATCH C2</h1>
            <p className="text-[10px] sm:text-[11px] text-text-dim font-mono mt-1">HW-ID: {status.hardwareId} // TIER: APEX</p>
          </div>
          <div className="hidden sm:block px-2 py-0.5 border border-ghost-green text-ghost-green text-[9px] font-mono rounded-sm font-semibold">
            OPERATIONAL // PQC-HARDENED
          </div>
        </div>
        
        {/* Workspace controls & status */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-xs font-mono">0.00ms LATENCY</p>
            <p className="text-[10px] text-ghost-green font-mono uppercase tracking-widest font-semibold">Link: LEO_MESH_7</p>
          </div>

          {/* Desktop Panel Toggle States */}
          {!isMobile && (
            <div className="flex bg-[#111] border border-ghost-border p-1 gap-1">
              <button 
                onClick={() => setIsLeftOpen(!isLeftOpen)}
                className={`px-2 py-1 font-mono text-[9px] border transition-all uppercase cursor-pointer ${
                  isLeftOpen ? 'border-ghost-green text-ghost-green bg-ghost-green/10' : 'border-zinc-800 text-zinc-500'
                }`}
                title="Toggle Left Sidebar mode (Rail/Expanded)"
              >
                LEFT: {isLeftOpen ? 'EXPAND' : 'RAIL'}
              </button>
              <button 
                onClick={() => setIsRightOpen(!isRightOpen)}
                className={`px-2 py-1 font-mono text-[9px] border transition-all uppercase cursor-pointer ${
                  isRightOpen ? 'border-ghost-green text-ghost-green bg-ghost-green/10' : 'border-zinc-800 text-zinc-500'
                }`}
                title="Toggle Right Threat Panel"
              >
                RIGHT: {isRightOpen ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Mobile Threat Drawer Button */}
          {isMobile && (
            <button 
              onClick={() => setMobileRightOpen(!mobileRightOpen)}
              className="p-2 border border-ghost-border text-ghost-warning hover:border-ghost-warning/50 active:bg-ghost-surface cursor-pointer"
            >
              <Shield className="w-5 h-5 text-ghost-warning" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area - Layout using Flex and width animation to prevent grid truncation */}
      <main className="flex-1 flex flex-row bg-ghost-border overflow-hidden gap-[1px]">
        
        {/* Desktop Left Panel - Collapsible with beautiful sliding width motion */}
        {!isMobile && (
          <motion.section 
            animate={{ width: isLeftOpen ? 245 : 64 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full bg-ghost-dark p-[15px] flex flex-col overflow-y-auto overflow-hidden border-r border-ghost-border border-box shrink-0 select-none scrollbar-none"
          >
            {/* Wrap in stable container to avoid ugly text wrapping on animate */}
            <div className="min-w-[215px] flex-1 flex flex-col h-full" style={{ width: isLeftOpen ? '100%' : '34px' }}>
              {renderLeftPanelContent(!isLeftOpen)}
            </div>
          </motion.section>
        )}

        {/* Center Panel (The active, fully expanding Module View) */}
        <section className="flex-1 bg-ghost-dark flex flex-col overflow-hidden relative min-w-0">
           <div className="p-2.5 bg-ghost-surface border-b border-ghost-border flex items-center justify-between z-20">
              <span className="text-[9px] sm:text-[10px] font-mono text-text-dim uppercase tracking-widest font-bold">
                Module Output // {activeModule}.src
              </span>
              <div className="flex gap-1.5 items-center">
                {/* Active Module Indicator lights */}
                <div className="w-1.5 h-1.5 bg-ghost-green rounded-full opacity-50" />
                <div className="w-1.5 h-1.5 bg-ghost-green rounded-full animate-ping" />
                <div className="w-1.5 h-1.5 bg-ghost-green rounded-full opacity-50" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="min-h-full"
                >
                  {activeModule === 'overview' && <Overview status={status} addLog={addLog} customTraces={customTraces} setCustomTraces={setCustomTraces} />}
                  {activeModule === 'cryptography' && <Cryptography addLog={addLog} />}
                  {activeModule === 'defense' && <Defense addLog={addLog} />}
                  {activeModule === 'satcom' && <SatCom addLog={addLog} />}
                  {activeModule === 'geolocation' && <Geolocation addLog={addLog} customTraces={customTraces} setCustomTraces={setCustomTraces} />}
                  {activeModule === 'intelligence' && <Intelligence addLog={addLog} />}
                  {activeModule === 'sandbox' && <Sandbox addLog={addLog} />}
                  {activeModule === 'comm' && <SecureComm addLog={addLog} />}
                  {activeModule === 'tactical' && <Tactical addLog={addLog} />}
                  {activeModule === 'logs' && <Logs logs={logs} />}
                </motion.div>
              </AnimatePresence>
           </div>
        </section>

        {/* Desktop Right Panel - Fully collapsible with beautiful collapse animation */}
        {!isMobile && (
          <motion.section 
            animate={{ 
              width: isRightOpen ? 260 : 0, 
              paddingLeft: isRightOpen ? 15 : 0, 
              paddingRight: isRightOpen ? 15 : 0,
              opacity: isRightOpen ? 1 : 0 
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full bg-ghost-dark flex flex-col overflow-y-auto border-l border-ghost-border shrink-0 select-none overflow-hidden"
          >
            <div className="min-w-[230px] h-full flex flex-col">
              {renderRightPanelContent()}
            </div>
          </motion.section>
        )}

        {/* Desktop Mini Right Collapse Grip/Trigger (visible only when closed) */}
        {!isMobile && !isRightOpen && (
          <div 
            onClick={() => setIsRightOpen(true)}
            className="w-[28px] h-full bg-ghost-surface hover:bg-ghost-green/5 border-l border-ghost-border flex flex-col items-center justify-start pt-6 cursor-pointer select-none transition-all group"
            title="Expand Threat Panel"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-600 group-hover:text-ghost-warning mb-4 transition-colors" />
            <div className="writing-vertical font-mono text-[8px] text-zinc-500 group-hover:text-white uppercase tracking-widest">
              [THREAT telemetry]
            </div>
          </div>
        )}
      </main>

      {/* Floating Sheets for Mobile View Drawer Overlays */}
      <AnimatePresence>
        {/* Mobile Left Drawer Overlay */}
        {isMobile && mobileLeftOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileLeftOpen(false)}
              className="absolute inset-0 bg-black z-40"
            />
            <motion.section 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute top-0 bottom-0 left-0 w-[280px] bg-[#0c0c0cd9] backdrop-blur-md border-r border-ghost-border p-5 flex flex-col overflow-y-auto z-45"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-ghost-border">
                <span className="text-xs uppercase font-mono tracking-widest text-[#E0E0E0]">Command Station</span>
                <button 
                  onClick={() => setMobileLeftOpen(false)} 
                  className="p-1 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="flex-1">
                {renderLeftPanelContent(false)}
              </div>
            </motion.section>
          </>
        )}

        {/* Mobile Right Drawer Overlay */}
        {isMobile && mobileRightOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileRightOpen(false)}
              className="absolute inset-0 bg-black z-40"
            />
            <motion.section 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute top-0 bottom-0 right-0 w-[284px] bg-[#0c0c0cd9] backdrop-blur-md border-l border-ghost-border p-5 flex flex-col overflow-y-auto z-45"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-ghost-border">
                <span className="text-xs uppercase font-mono tracking-widest text-[#E0E0E0]">Mitigation Intel</span>
                <button 
                  onClick={() => setMobileRightOpen(false)} 
                  className="p-1 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="flex-1">
                {renderRightPanelContent()}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <footer className="h-[80px] border-t border-ghost-border px-5 flex items-center justify-between bg-ghost-surface z-30">
        <div className="flex items-center gap-5">
           <button 
             className="bg-ghost-danger text-white border-none py-2.5 px-5 font-mono font-bold text-xs uppercase cursor-pointer hover:bg-white hover:text-ghost-danger transition-colors"
             onClick={() => addLog("EMERGENCY WIPE INITIATED - AUTH REQUIRED", "error")}
           >
             Omega Kill Switch
           </button>
           <div className="flex flex-col">
              <p className="text-[11px] font-bold text-white uppercase font-mono">Emergency Contingency</p>
              <p className="text-[10px] text-text-dim font-mono">Wipes Master Ghost-Watch Keys instantly.</p>
           </div>
        </div>

        <ul className="flex flex-col text-[10px] text-text-dim list-none font-mono gap-1">
           <li>RECOVERY REQ: <span className="text-white font-bold">Mnemonic Card</span></li>
           <li>HARDWARE REQ: <span className="text-white font-bold">YubiKey Tethered</span></li>
           <li>SECTOR: <span className="text-white font-bold">Global 01</span></li>
        </ul>

        <div className="text-right">
           <div className="text-[10px] uppercase tracking-[1px] text-text-dim mb-1 font-mono">Encryption Protocols</div>
           <div className="text-xs font-mono text-white tracking-widest leading-none">KYBER-512 // DILITHIUM-3</div>
        </div>
      </footer>
    </div>
  );
}
