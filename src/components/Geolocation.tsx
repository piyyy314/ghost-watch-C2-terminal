/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LocateFixed, Crosshair, Radar, Map as MapIcon, ShieldAlert, Satellite, Target, AlertTriangle, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomTraceConfig } from '../types';

interface GeolocationProps {
  addLog: (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  customTraces: CustomTraceConfig[];
  setCustomTraces: React.Dispatch<React.SetStateAction<CustomTraceConfig[]>>;
}

interface Intercept {
  id: string;
  ip: string;
  location: string;
  type: 'SIGNAL_INTERCEPT' | 'PACKET_SNIFF' | 'METADATA_PIN';
  coordinates: [number, number];
  status: 'TRACKING' | 'TRACED' | 'ACTIVE';
}

interface GeoFence {
  id: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const getCoordinatesForId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = (Math.abs(hash % 70) - 35); // Stable central tracking latitude
  const lon = ((hash * 3) % 220) - 110; // Stable central tracking longitude
  return [lat, lon] as [number, number];
};

export default function Geolocation({ addLog, customTraces, setCustomTraces }: GeolocationProps) {
  const [intercepts, setIntercepts] = useState<Intercept[]>([
    { id: 'INT-01', ip: '192.168.1.1', location: 'Frankfurt, DE', type: 'SIGNAL_INTERCEPT', coordinates: [50.11, 8.68], status: 'ACTIVE' },
    { id: 'INT-02', ip: '45.12.33.1', location: 'Unknown (Proxy)', type: 'PACKET_SNIFF', coordinates: [35.67, 139.65], status: 'TRACKING' },
    { id: 'INT-03', ip: '1.1.1.2', location: 'London, UK', type: 'METADATA_PIN', coordinates: [51.50, -0.12], status: 'TRACED' },
  ]);

  // Synchronize custom trace configurations dynamically
  useEffect(() => {
    setIntercepts(prev => {
      const defaults = prev.filter(p => p.id.startsWith('INT-'));
      const customs: Intercept[] = customTraces.map(t => {
        const existing = prev.find(p => p.id === t.id);
        const coords = existing ? existing.coordinates : getCoordinatesForId(t.id);
        const statusMap: 'TRACKING' | 'TRACED' | 'ACTIVE' = 
          t.status === 'TRACE_COMPLETE' ? 'TRACED' : t.status === 'TRANSMITTING' ? 'TRACKING' : 'ACTIVE';
        
        return {
          id: t.id,
          ip: t.ipOrDomain,
          location: `Crysta-Voice vector (${t.phoneNumber})`,
          type: 'SIGNAL_INTERCEPT',
          coordinates: coords,
          status: existing ? existing.status : statusMap
        };
      });
      return [...defaults, ...customs];
    });
  }, [customTraces]);

  const [tracingId, setTracingId] = useState<string | null>(null);
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [securityCode, setSecurityCode] = useState("");
  const [targetCode, setTargetCode] = useState("");

  const [geofences, setGeofences] = useState<GeoFence[]>([]);
  const [drawingFenceStart, setDrawingFenceStart] = useState<[number, number] | null>(null);
  const [drawingCurrentPos, setDrawingCurrentPos] = useState<[number, number] | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [typeFilter, setTypeFilter] = useState<Intercept['type'] | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Intercept['status'] | 'ALL'>('ALL');

  useEffect(() => {
    if (!tracingId) return;

    // Movement interval - simulates target trying to move/evade erratically
    const moveInterval = setInterval(() => {
      const logsToTrigger: { msg: string; type: 'info' | 'warn' | 'error' | 'success' }[] = [];

      setIntercepts(prev => {
        const nextState = prev.map(int => {
          if (int.id === tracingId && int.status !== 'TRACED') {
            // Standard jitter
            const jitterX = (Math.random() - 0.5) * 1.2;
            const jitterY = (Math.random() - 0.5) * 1.2;
            
            // Random probability of a "burst" jump to simulate evasive maneuvers
            const burstX = Math.random() > 0.8 ? (Math.random() - 0.5) * 8 : jitterX;
            const burstY = Math.random() > 0.8 ? (Math.random() - 0.5) * 8 : jitterY;

            const newLat = Math.min(90, Math.max(-90, int.coordinates[0] + burstX));
            const newLon = Math.min(180, Math.max(-180, int.coordinates[1] + burstY));

            // Geo-fence check
            geofences.forEach(fence => {
              const wasInside = int.coordinates[0] >= fence.minLat && int.coordinates[0] <= fence.maxLat &&
                                int.coordinates[1] >= fence.minLon && int.coordinates[1] <= fence.maxLon;
              const isInside = newLat >= fence.minLat && newLat <= fence.maxLat &&
                               newLon >= fence.minLon && newLon <= fence.maxLon;

              if (isInside && !wasInside) {
                logsToTrigger.push({ msg: `TARGET ${int.id} ENTERED SECURE BOUNDARY ${fence.id}`, type: 'error' });
              } else if (!isInside && wasInside) {
                logsToTrigger.push({ msg: `TARGET ${int.id} BREACHED PERIMETER ${fence.id}`, type: 'error' });
              }
            });

            return {
              ...int,
              coordinates: [newLat, newLon] as [number, number]
            };
          }
          return int;
        });
        return nextState;
      });

      if (logsToTrigger.length > 0) {
        setTimeout(() => {
          logsToTrigger.forEach(l => addLog(l.msg, l.type));
        }, 0);
      }
    }, 250); // Faster interval for erratic movement

    // Finalization timeout
    const finishTimeout = setTimeout(() => {
      setIntercepts(prev => prev.map(int => int.id === tracingId ? { ...int, status: 'TRACED' } : int));
      setCustomTraces(prev => prev.map(t => t.id === tracingId ? { ...t, status: 'TRACE_COMPLETE' } : t));
      setTracingId(null);
      addLog(`Trace complete. Physical location localized. Relay to local authorities.`, 'success');
    }, 6000);

    return () => {
      clearInterval(moveInterval);
      clearTimeout(finishTimeout);
    };
  }, [tracingId, addLog, geofences]);

  const initiateTrace = (id: string) => {
    setPendingConfirmId(id);
    setSecurityCode("");
    setTargetCode(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const confirmTrace = () => {
    if (!pendingConfirmId) return;
    if (securityCode !== targetCode) {
      addLog(`INVALID AUTH CODE. TRACE ABORTED.`, 'error');
      setPendingConfirmId(null);
      return;
    }
    setTracingId(pendingConfirmId);
    addLog(`Initiating trace sequence for target ${pendingConfirmId}...`, 'warn');
    setPendingConfirmId(null);
  };

  const activeTarget = intercepts.find(int => int.id === tracingId);
  const pendingTarget = intercepts.find(int => int.id === pendingConfirmId);

  const filteredIntercepts = intercepts.filter(int => {
    const typeMatch = typeFilter === 'ALL' || int.type === typeFilter;
    const statusMatch = statusFilter === 'ALL' || int.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    
    const lat = (relativeY * 1.8) - 90;
    const lon = (relativeX * 3.6) - 180;
    
    if (!drawingFenceStart) {
      setDrawingFenceStart([lat, lon]);
      setDrawingCurrentPos([lat, lon]);
      addLog("Anchor point set. Select secondary boundary point.", "info");
    } else {
      const newFence: GeoFence = {
        id: `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
        minLat: Math.min(drawingFenceStart[0], lat),
        maxLat: Math.max(drawingFenceStart[0], lat),
        minLon: Math.min(drawingFenceStart[1], lon),
        maxLon: Math.max(drawingFenceStart[1], lon),
      };
      setGeofences(prev => [...prev, newFence]);
      setDrawingFenceStart(null);
      setDrawingCurrentPos(null);
      setIsDrawingMode(false);
      addLog(`Geo-fence ${newFence.id} established and hot-swapped for runtime monitoring.`, "success");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !drawingFenceStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    
    const lat = (relativeY * 1.8) - 90;
    const lon = (relativeX * 3.6) - 180;
    
    setDrawingCurrentPos([lat, lon]);
  };

  const handleExportCoordinatesJson = () => {
    const data = intercepts.map(i => ({
      targetId: i.id,
      ip: i.ip,
      simulatedLocation: i.location,
      trackingType: i.type,
      latitude: i.coordinates[0],
      longitude: i.coordinates[1],
      state: i.status
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TACTICAL_GEO_INTERCEPTS.json`;
    link.click();
    addLog(`Exported coordinates mapping table for all intercepts in JSON format.`, 'success');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {pendingConfirmId && pendingTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ghost-dark/95 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-ghost-surface border-2 border-ghost-warning p-6 space-y-6"
            >
              <div className="flex items-center gap-3 text-ghost-warning mb-2">
                 <ShieldAlert className="w-6 h-6" />
                 <h2 className="font-mono text-lg font-bold uppercase tracking-tighter">Auth_Required // Trace_Start</h2>
              </div>
              
              <div className="space-y-4 font-mono">
                 <p className="text-[11px] text-text-dim leading-relaxed uppercase">
                    You are about to initiate an active triangulation trace on target <span className="text-white font-bold">{pendingTarget.id}</span>. 
                    This action will broadcast a high-gain sub-space ping which could potentially expose your presence to advanced eavesdroppers.
                 </p>
                 
                 <div className="bg-ghost-dark p-3 border border-ghost-border space-y-1">
                    <div className="text-[9px] text-zinc-500 uppercase">Target_ID: {pendingTarget.id}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">IP_Origin: {pendingTarget.ip}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Current_Sector: {pendingTarget.location}</div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] text-ghost-warning uppercase font-bold">Security_Challenge</span>
                       <span className="text-[10px] text-white font-mono bg-ghost-dark px-2 py-0.5 border border-ghost-warning/30">{targetCode}</span>
                    </div>
                    <input 
                       type="text"
                       value={securityCode}
                       onChange={(e) => setSecurityCode(e.target.value)}
                       placeholder="ENTER CODE TO AUTHORIZE..."
                       className="w-full bg-ghost-dark border border-ghost-border p-3 font-mono text-[10px] text-white focus:border-ghost-warning outline-none uppercase tracking-widest placeholder:text-zinc-800"
                    />
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                 <button 
                   onClick={() => setPendingConfirmId(null)}
                   className="flex-1 py-3 border border-ghost-border font-mono text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-ghost-dark transition-all uppercase tracking-widest"
                 >
                   Aborted
                 </button>
                 <button 
                   onClick={confirmTrace}
                   className="flex-1 py-3 bg-ghost-warning text-ghost-dark font-mono text-[10px] font-bold hover:bg-white transition-all uppercase tracking-widest"
                 >
                   Confirm_Trace
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="panel-header-line flex items-center justify-between">
        <span>Geolocation // trace.node.origin</span>
        <button 
          onClick={handleExportCoordinatesJson}
          className="flex items-center gap-1.5 px-3 py-1 bg-ghost-green/10 border border-ghost-green/40 hover:border-ghost-green hover:bg-ghost-green text-ghost-green hover:text-ghost-dark font-mono text-[9px] font-bold uppercase transition-all tracking-wider ml-auto cursor-pointer"
          title="Export GPS coordinates table"
        >
          <FileDown className="w-3.5 h-3.5" /> EXPORT_COORDS_INTEL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Map Visualizer */}
          <div className="bg-ghost-surface border border-ghost-border flex-1 relative overflow-hidden flex flex-col">
            <div className="p-3 border-b border-ghost-border flex items-center justify-between bg-ghost-dark/30">
               <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                  <MapIcon className="w-3.5 h-3.5 text-ghost-green" /> Tactical Intercept Map
               </h3>
               <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => {
                      setIsDrawingMode(!isDrawingMode);
                      setDrawingFenceStart(null);
                      setDrawingCurrentPos(null);
                    }}
                    className={`flex items-center gap-2 font-mono text-[9px] font-bold uppercase transition-all px-2 py-1 border ${
                      isDrawingMode ? 'bg-ghost-green text-ghost-dark border-ghost-green' : 'text-ghost-green border-ghost-green/30 hover:border-ghost-green'
                    }`}
                  >
                    <Crosshair className={`w-3 h-3 ${isDrawingMode ? 'animate-pulse' : ''}`} />
                    {isDrawingMode ? 'Drawing_Boundary...' : 'Define_Geo-Fence'}
                  </button>
                  <div className="flex gap-2 items-center">
                    <Radar className="w-3 h-3 text-ghost-green animate-spin" />
                    <span className="text-[9px] font-mono text-ghost-green font-bold">GRID_LOCK_ACTIVE</span>
                  </div>
               </div>
            </div>

            <div 
              onClick={handleMapClick}
              onMouseMove={handleMouseMove}
              className={`flex-1 relative bg-ghost-dark overflow-hidden group ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
            >
               {/* Decorative Grid */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(var(--ghost-green) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
               
               {/* Geo-Fences */}
               {geofences.map(fence => (
                 <div 
                   key={fence.id}
                   className="absolute border border-ghost-danger/40 bg-ghost-danger/5 pointer-events-none flex items-center justify-center overflow-hidden"
                   style={{
                     top: `${(fence.minLat + 90) / 1.8}%`,
                     left: `${(fence.minLon + 180) / 3.6}%`,
                     width: `${(fence.maxLon - fence.minLon) / 3.6}%`,
                     height: `${(fence.maxLat - fence.minLat) / 1.8}%`,
                   }}
                 >
                   <div className="absolute top-1 left-1 font-mono text-[7px] text-ghost-danger font-bold uppercase opacity-50">{fence.id}</div>
                   <div className="w-full h-full border-2 border-dashed border-ghost-danger/10 animate-pulse" />
                 </div>
               ))}

               {/* Drawing Progress */}
               {isDrawingMode && drawingFenceStart && drawingCurrentPos && (
                 <div 
                   className="absolute border border-ghost-green/50 bg-ghost-green/5 pointer-events-none"
                   style={{
                     top: `${(Math.min(drawingFenceStart[0], drawingCurrentPos[0]) + 90) / 1.8}%`,
                     left: `${(Math.min(drawingFenceStart[1], drawingCurrentPos[1]) + 180) / 3.6}%`,
                     width: `${Math.abs(drawingCurrentPos[1] - drawingFenceStart[1]) / 3.6}%`,
                     height: `${Math.abs(drawingCurrentPos[0] - drawingFenceStart[0]) / 1.8}%`,
                   }}
                 />
               )}
               
               {/* Intercept Pins */}
               {filteredIntercepts.map((int) => (
                 <motion.div
                   key={int.id}
                   style={{ 
                     top: `${(int.coordinates[0] + 90) / 1.8}%`, 
                     left: `${(int.coordinates[1] + 180) / 3.6}%` 
                   }}
                   className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair group/pin"
                 >
                   <div className={`w-3 h-3 rounded-full border-2 animate-ping opacity-30 ${int.status === 'TRACED' ? 'bg-blue-400 border-blue-400' : 'bg-ghost-green border-ghost-green'}`} />
                   <div className={`w-1.5 h-1.5 rounded-full relative z-10 ${int.status === 'TRACED' ? 'bg-blue-400' : 'bg-ghost-green'}`} />
                   
                   <div className="absolute top-4 left-4 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity bg-ghost-surface border border-ghost-border p-2 text-[8px] font-mono z-50">
                      <div className="text-white font-bold">{int.id} // {int.ip}</div>
                      <div className="text-text-dim uppercase tracking-tighter">{int.location}</div>
                   </div>
                 </motion.div>
               ))}

               {tracingId && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-ghost-green pointer-events-none"
                 />
               )}

               {activeTarget ? (
                 <div className="absolute top-4 right-4 bg-ghost-dark/80 border border-ghost-green/40 p-2 font-mono text-[8px] text-ghost-green shadow-[0_0_10px_rgba(0,255,65,0.1)]">
                    <div className="text-zinc-600 mb-1 uppercase tracking-tighter border-b border-zinc-800 pb-1 font-bold">Target_Locked</div>
                    LAT: {activeTarget.coordinates[0].toFixed(4)}<br/>
                    LON: {activeTarget.coordinates[1].toFixed(4)}<br/>
                    ALT: {Math.floor(Math.random() * 50) + 400}m
                 </div>
               ) : (
                 <div className="absolute top-4 right-4 bg-ghost-dark/80 border border-ghost-border p-2 font-mono text-[8px] text-zinc-600">
                    LAT: 00.0000<br/>
                    LON: 00.0000<br/>
                    ALT: ---
                 </div>
               )}
            </div>
            
            <div className="p-2.5 bg-ghost-dark/50 border-t border-ghost-border flex justify-between text-[8px] font-mono text-zinc-700 uppercase tracking-widest font-bold">
               <span>Mercator Overlay // Ready</span>
               <span>Auto-Sync // Enabled</span>
            </div>
          </div>

          <div className="bg-ghost-surface border border-ghost-border p-5 h-48">
             <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest mb-4">
                <Radar className="w-3.5 h-3.5 text-ghost-green" /> Signal Triangulation Analysis
             </h3>
             <div className="flex items-end gap-1.5 h-24 overflow-hidden px-2">
                {[...Array(24)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [10, 80, 40, 95, 20, 60] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                    className="flex-1 bg-ghost-green/40 border-t border-ghost-green"
                  />
                ))}
             </div>
             <div className="mt-2 flex justify-between text-[8px] font-mono text-zinc-600 uppercase font-bold tracking-widest border-t border-zinc-900 pt-2">
                <span>0.1Hz</span>
                <span>Sub-Space Ping Analysis</span>
                <span>$2.4GHz</span>
             </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col h-full min-h-0">
          <div className="bg-ghost-surface border border-ghost-border p-5 flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[10px] font-bold text-text-dim uppercase tracking-widest"> Detected Intercepts</h3>
              
              {/* Filters UI */}
              <div className="space-y-2 pb-2 border-b border-ghost-border/30">
                <div className="flex flex-wrap gap-1">
                  {['ALL', 'SIGNAL_INTERCEPT', 'PACKET_SNIFF', 'METADATA_PIN'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTypeFilter(f as any)}
                      className={`text-[7px] font-mono px-1.5 py-0.5 border transition-all ${
                        typeFilter === f ? 'bg-ghost-green text-ghost-dark border-ghost-green' : 'text-zinc-600 border-zinc-900 hover:border-ghost-green/50'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                   {['ALL', 'TRACKING', 'TRACED', 'ACTIVE'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f as any)}
                      className={`text-[7px] font-mono px-1.5 py-0.5 border transition-all ${
                        statusFilter === f ? 'bg-ghost-green text-ghost-dark border-ghost-green' : 'text-zinc-600 border-zinc-900 hover:border-ghost-green/50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
               {filteredIntercepts.map((int) => (
                 <div key={int.id} className="bg-ghost-dark p-3 border border-ghost-border flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="text-[10px] font-mono font-bold text-white tracking-widest">{int.id}</div>
                          <div className="text-[8px] font-mono text-text-dim uppercase">{int.type}</div>
                       </div>
                       <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${
                         int.status === 'TRACED' ? 'bg-blue-400/10 border-blue-400 text-blue-400' : 'bg-ghost-green/10 border-ghost-green text-ghost-green'
                       }`}>
                          {int.status}
                       </div>
                    </div>
                    
                    <div className="text-[9px] font-mono text-zinc-500">
                       IP: {int.ip}<br/>
                       LOC: {int.location}
                    </div>

                    <button
                      onClick={() => initiateTrace(int.id)}
                      disabled={tracingId !== null || int.status === 'TRACED'}
                      className={`w-full mt-1 py-1.5 text-[8px] font-mono font-bold border transition-all ${
                        int.status === 'TRACED' 
                        ? 'bg-transparent border-zinc-800 text-zinc-800 cursor-not-allowed'
                        : tracingId === int.id
                          ? 'bg-ghost-danger text-white border-ghost-danger animate-pulse'
                          : 'bg-ghost-surface border-ghost-border text-text-dim hover:text-ghost-green hover:border-ghost-green'
                      }`}
                    >
                      {int.status === 'TRACED' ? 'TRACE_COMPLETE' : tracingId === int.id ? 'TRACING...' : 'INITIATE_TRACE'}
                    </button>
                 </div>
               ))}
            </div>

            <div className="bg-ghost-danger/10 border border-ghost-danger/30 p-2.5 flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-ghost-danger" />
               <div className="flex-1">
                  <div className="text-[9px] font-bold text-ghost-danger uppercase font-mono">Counter-Eavesdrop</div>
                  <div className="text-[8px] text-zinc-500 font-mono italic">Trace-Route spoofing active by default.</div>
               </div>
            </div>
          </div>
          
          <div className="bg-ghost-surface border border-ghost-border p-5 space-y-4">
             <h3 className="font-mono text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <Satellite className="w-3 h-3 text-ghost-green" /> GPS Lock Status
             </h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-ghost-dark p-2 border border-ghost-border">
                   <div className="text-[8px] text-zinc-600 uppercase font-mono">Satellites</div>
                   <div className="text-sm font-mono text-white">09/12</div>
                </div>
                <div className="bg-ghost-dark p-2 border border-ghost-border">
                   <div className="text-[8px] text-zinc-600 uppercase font-mono">DOP</div>
                   <div className="text-sm font-mono text-white">0.82</div>
                </div>
             </div>
             <div className="text-[9px] font-mono text-ghost-green uppercase text-center border border-ghost-green/20 py-1 font-bold">
                PRECISION_LOCKED
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
