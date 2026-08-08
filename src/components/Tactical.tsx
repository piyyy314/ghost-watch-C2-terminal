/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Satellite, Cloud, Wind, Activity, Layers, Map as MapIcon, Target, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Tactical({ addLog }: { addLog: (msg: string, type?: any) => void }) {
  const [zoom, setZoom] = useState(12);
  const [activeLayers, setActiveLayers] = useState<string[]>(['satellite', 'weather', 'traffic']);
  
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  
  const layerInfo: Record<string, { label: string, desc: string }> = {
    satellite: {
      label: "Satellite",
      desc: "High-resolution orbital imagery (0.15m/px)"
    },
    weather: {
      label: "Weather",
      desc: "Live atmospheric precipitation and wind velocity overlays"
    },
    traffic: {
      label: "Traffic",
      desc: "Network packet stream and signal latency visualization"
    }
  };

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="panel-header-line">
        <span>Tactical environment // real-time.data.feeds</span>
        <span>LAT: 48.8566 // LON: 2.3522</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 bg-ghost-surface border border-ghost-border relative overflow-hidden flex flex-col group">
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-start gap-4">
             <div className="bg-ghost-dark/80 backdrop-blur-md border border-ghost-border p-2 flex flex-col gap-2 relative">
                {['satellite', 'weather', 'traffic'].map((l) => (
                   <button 
                     key={l}
                     onClick={() => toggleLayer(l)}
                     onMouseEnter={() => setHoveredLayer(l)}
                     onMouseLeave={() => setHoveredLayer(null)}
                     className={`p-2 border transition-all ${
                        activeLayers.includes(l) ? 'border-ghost-green bg-ghost-green/10 text-ghost-green' : 'border-ghost-border text-text-dim'
                     }`}
                   >
                      {l === 'satellite' && <Satellite className="w-4 h-4" />}
                      {l === 'weather' && <Cloud className="w-4 h-4" />}
                      {l === 'traffic' && <Activity className="w-4 h-4" />}
                   </button>
                ))}
             </div>

             <AnimatePresence>
                {hoveredLayer && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-ghost-dark/95 border border-ghost-green/30 p-3 max-w-[180px] space-y-1 shadow-[0_0_20px_rgba(0,255,65,0.1)]"
                  >
                    <div className="text-ghost-green font-mono text-[9px] font-bold uppercase tracking-widest border-b border-ghost-green/20 pb-1 mb-1">
                      {layerInfo[hoveredLayer].label}_Module
                    </div>
                    <div className="text-white font-mono text-[8px] leading-tight uppercase opacity-80">
                      {layerInfo[hoveredLayer].desc}
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="absolute top-4 right-4 z-20 bg-ghost-dark/80 backdrop-blur-md border border-ghost-border p-3 font-mono text-[9px] space-y-2">
             <div className="flex justify-between gap-4">
                <span className="text-text-dim uppercase">SAT_LOCK</span>
                <span className="text-ghost-green font-bold text-right">08/12</span>
             </div>
             <div className="flex justify-between gap-4">
                <span className="text-text-dim uppercase">W_PRECIP</span>
                <span className="text-white font-bold text-right">0.02%</span>
             </div>
             <div className="flex justify-between gap-4">
                <span className="text-text-dim uppercase">NET_LOAD</span>
                <span className="text-ghost-warning font-bold text-right">CRITICAL</span>
             </div>
          </div>

          {/* Simulated Map Canvas */}
          <div className="flex-1 relative bg-zinc-950 overflow-hidden cursor-move">
             {/* Satellite View (Simulated with an image or pattern) */}
             <div className={`absolute inset-0 transition-opacity duration-1000 ${activeLayers.includes('satellite') ? 'opacity-40' : 'opacity-0'}`} 
                  style={{ backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
             {/* Weather Overlay */}
             <AnimatePresence>
               {activeLayers.includes('weather') && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 pointer-events-none overflow-hidden"
                 >
                    {[...Array(5)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="absolute w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full"
                        animate={{ 
                          x: [Math.random() * 800, Math.random() * 800], 
                          y: [Math.random() * 500, Math.random() * 500],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                      />
                    ))}
                    <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-ghost-dark/50 p-2 border border-ghost-border">
                       <Wind className="w-4 h-4 text-cyan-400 animate-pulse" />
                       <span className="text-[10px] font-mono text-cyan-400">WIND: 14kt @ 220°</span>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Network Traffic Overlay (Packet Streams) */}
             <AnimatePresence>
                {activeLayers.includes('traffic') && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                     {[...Array(12)].map((_, i) => (
                       <div key={i} className="absolute h-px bg-ghost-green/30 shadow-[0_0_10px_rgba(0,255,65,0.3)] origin-left"
                            style={{ 
                              top: `${Math.random() * 100}%`, 
                              left: `${Math.random() * 100}%`, 
                              width: `${Math.random() * 300 + 100}px`,
                              transform: `rotate(${Math.random() * 360}deg)`
                            }}>
                          <motion.div 
                            className="w-1 h-1 bg-ghost-green rounded-full shadow-[0_0_5px_white]"
                            animate={{ left: ["0%", "100%"] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                          />
                       </div>
                     ))}
                  </motion.div>
                )}
             </AnimatePresence>

             {/* UI Elements */}
             <div className="absolute inset-0 border border-ghost-green/5 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border border-ghost-green/20 rounded-full animate-ping opacity-20" />
                <div className="w-32 h-32 border border-ghost-green/40 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-1 h-1 bg-ghost-green rounded-full" />
                </div>
                <div className="absolute h-full w-px bg-ghost-green/10" />
                <div className="absolute w-full h-px bg-ghost-green/10" />
             </div>

             {/* Bottom Left Stats */}
             <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 text-[9px] font-mono text-text-dim">
                <div className="flex gap-2">
                   <span className="text-ghost-green">LIVE // SATELLITE_FEED_01</span>
                   <span>AZIMUTH: 184.2</span>
                </div>
                <div className="text-zinc-600">RESOLUTION: 0.15m/px</div>
             </div>
          </div>
          
          <div className="p-3 bg-ghost-dark/50 border-t border-ghost-border flex justify-between items-center text-[10px] font-mono">
             <div className="flex items-center gap-4">
                <span className="text-text-dim">GRID_SNAP: ON</span>
                <span className="text-text-dim">ELEVATION: 102m</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-text-dim uppercase">Zoom Level</span>
                <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-1 ${i <= 3 ? 'bg-ghost-green' : 'bg-ghost-border'}`} />
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar">
           <div className="bg-ghost-surface border border-ghost-border p-5 space-y-4">
              <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                 <Radio className="w-3.5 h-3.5 text-ghost-green" /> Signal Echelons
              </h3>
              <div className="space-y-4">
                 <div className="p-3 bg-ghost-dark border border-ghost-border">
                    <div className="text-[9px] text-text-dim font-mono uppercase mb-1">HF / VHF Band</div>
                    <div className="text-xs font-mono text-white">415.002 MHz</div>
                    <div className="mt-2 h-1 bg-zinc-800 relative overflow-hidden">
                       <motion.div animate={{ left: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-y-0 w-1/4 bg-ghost-green" />
                    </div>
                 </div>
                 <div className="p-3 bg-ghost-dark border border-ghost-border">
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">X-Band Uplink</div>
                    <div className="text-xs font-mono text-ghost-green">ACTIVE PK_8</div>
                 </div>
              </div>
           </div>

           <div className="bg-ghost-surface border border-ghost-border p-5 flex-1 flex flex-col gap-4">
              <h3 className="font-mono text-[10px] font-bold text-text-dim flex items-center gap-2 uppercase tracking-widest">
                 <Layers className="w-3.5 h-3.5 text-ghost-green" /> Environmental Feed
              </h3>
              <div className="flex-1 space-y-3">
                 <div className="flex justify-between border-b border-ghost-border/50 py-2">
                    <span className="text-[10px] text-text-dim font-mono uppercase">Temperature</span>
                    <span className="text-[10px] text-white font-mono">14°C</span>
                 </div>
                 <div className="flex justify-between border-b border-ghost-border/50 py-2">
                    <span className="text-[10px] text-text-dim font-mono uppercase">Humidity</span>
                    <span className="text-[10px] text-white font-mono">62%</span>
                 </div>
                 <div className="flex justify-between border-b border-ghost-border/50 py-2">
                    <span className="text-[10px] text-text-dim font-mono uppercase">Pressure</span>
                    <span className="text-[10px] text-white font-mono">1014 hPa</span>
                 </div>
                 <div className="flex justify-between border-b border-ghost-border/50 py-2">
                    <span className="text-[10px] text-text-dim font-mono uppercase">UV Index</span>
                    <span className="text-[10px] text-ghost-warning font-mono">MODERATE</span>
                 </div>
              </div>
              <div className="bg-ghost-dark p-3 border border-ghost-border">
                 <div className="text-[9px] text-text-dim font-mono uppercase mb-2">Satellite Status</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-ghost-green rounded-full shadow-[0_0_5px_#00ff41]" />
                    <span className="text-[9px] text-white font-mono">NORD_LINK_6 // ONLINE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
