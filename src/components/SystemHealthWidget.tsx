import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Server, 
  Pause, 
  Play, 
  RotateCcw, 
  Download, 
  Wifi, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { SystemHealthData } from '../types';

interface SystemHealthWidgetProps {
  onHealthAlert?: (msg: string, type: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function SystemHealthWidget({ onHealthAlert }: SystemHealthWidgetProps) {
  const [history, setHistory] = useState<SystemHealthData[]>([]);
  const [current, setCurrent] = useState<SystemHealthData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'cpu' | 'memory' | 'disk'>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('--:--:--');
  const eventSourceRef = useRef<EventSource | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Load historical metrics first to avoid empty charts
  useEffect(() => {
    let isMounted = true;

    async function loadInitialHistory() {
      try {
        const res = await fetch('/api/system/history');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.history && Array.isArray(data.history)) {
            setHistory(data.history);
            if (data.history.length > 0) {
              const latest = data.history[data.history.length - 1];
              setCurrent(latest);
              setLastUpdated(latest.timeString);
            }
          }
        }
      } catch (err) {
        console.warn('Initial system history load error:', err);
      }
    }

    loadInitialHistory();

    // Setup SSE connection for real-time live telemetry
    function setupEventSource() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sse = new EventSource('/api/system/stream');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      sse.onmessage = (event) => {
        if (!isMounted || isPausedRef.current) return;
        try {
          const snapshot: SystemHealthData = JSON.parse(event.data);
          setCurrent(snapshot);
          setLastUpdated(snapshot.timeString);
          setIsConnected(true);

          setHistory(prev => {
            const next = [...prev, snapshot];
            if (next.length > 30) {
              return next.slice(next.length - 30);
            }
            return next;
          });
        } catch (e) {
          console.error('Failed to parse SSE system health packet:', e);
        }
      };

      sse.onerror = () => {
        if (isMounted) setIsConnected(false);
      };
    }

    setupEventSource();

    // Fallback polling heartbeat if SSE drops
    const fallbackPoll = setInterval(async () => {
      if (!isMounted || isPausedRef.current) return;
      if (eventSourceRef.current?.readyState !== EventSource.OPEN) {
        try {
          const res = await fetch('/api/system/health');
          if (res.ok) {
            const snapshot: SystemHealthData = await res.json();
            setCurrent(snapshot);
            setLastUpdated(snapshot.timeString);
            setIsConnected(true);
            setHistory(prev => {
              const next = [...prev, snapshot];
              return next.length > 30 ? next.slice(next.length - 30) : next;
            });
          }
        } catch {
          setIsConnected(false);
        }
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(fallbackPoll);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Format charting series data
  const chartData = history.map((item) => ({
    time: item.timeString,
    cpuUsage: item.cpu.usagePercent,
    loadAvg1m: Math.round(item.cpu.loadAvg[0] * 10), // scaled load indicator
    memUsage: item.memory.usagePercent,
    memUsedGB: item.memory.usedGB,
    memTotalGB: item.memory.totalGB,
    diskUsage: item.disk.usagePercent,
    diskUsedGB: item.disk.usedGB,
    diskTotalGB: item.disk.totalGB,
    processRssMB: item.memory.processRssMB,
  }));

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      currentSnapshot: current,
      recentTimeline: history,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SYSTEM_HEALTH_TELEMETRY_${Date.now()}.json`;
    link.click();
    if (onHealthAlert) {
      onHealthAlert('Real-time system health diagnostics JSON exported.', 'success');
    }
  };

  const getHealthBadgeColor = (val: number) => {
    if (val >= 90) return 'text-ghost-danger border-ghost-danger/40 bg-ghost-danger/10';
    if (val >= 75) return 'text-ghost-warning border-ghost-warning/40 bg-ghost-warning/10';
    return 'text-ghost-green border-ghost-green/40 bg-ghost-green/10';
  };

  // Custom Dark Tactical Tooltip for Recharts
  const CustomTacticalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-ghost-border p-2.5 rounded shadow-xl font-mono text-[10px] space-y-1 z-50">
          <div className="text-zinc-400 border-b border-zinc-800 pb-1 mb-1 font-bold">
            TIMESTAMP: <span className="text-white">{label}</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 inline-block rounded-xs" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="text-white font-bold">{entry.value}%</span>
            </div>
          ))}
          {current && (
            <div className="pt-1 border-t border-zinc-900 text-[9px] text-zinc-500">
              Host: {current.system.hostname} | Load: {current.cpu.loadAvg.join(', ')}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-ghost-surface border border-ghost-border p-5 rounded space-y-5">
      {/* Header Bar with Live Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ghost-border gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Activity className="w-5 h-5 text-ghost-green" />
            {isConnected && !isPaused && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ghost-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ghost-green"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              System Health // Real-Time Node Telemetry
            </h3>
            <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
              Live kernel telemetry via SSE &bull; Sample interval: 1000ms &bull; Updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-2 py-1 text-[9px] font-mono uppercase border rounded flex items-center gap-1.5 ${
            isConnected ? 'border-ghost-green/40 text-ghost-green bg-ghost-green/5' : 'border-ghost-warning/40 text-ghost-warning bg-ghost-warning/5'
          }`}>
            <Wifi className="w-3 h-3" />
            <span>{isConnected ? 'LIVE FEED (SSE)' : 'RECONNECTING...'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2.5 py-1 text-[9px] font-mono border transition-all uppercase flex items-center gap-1 ${
              isPaused 
                ? 'border-ghost-warning text-ghost-warning bg-ghost-warning/10' 
                : 'border-ghost-border text-zinc-400 hover:text-white hover:border-ghost-green'
            }`}
            title={isPaused ? 'Resume live streaming' : 'Pause live streaming'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="px-2.5 py-1 text-[9px] font-mono border border-ghost-border text-zinc-400 hover:text-ghost-green hover:border-ghost-green transition-all uppercase flex items-center gap-1"
            title="Export full telemetry metrics JSON"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: CPU, RAM, Disk, System */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CPU Utilization */}
        <div className="bg-ghost-dark/80 border border-ghost-border p-3.5 rounded relative overflow-hidden group hover:border-ghost-green/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">CPU UTILIZATION</span>
            <Cpu className="w-4 h-4 text-ghost-green group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-ghost-green">
              {current ? `${current.cpu.usagePercent}%` : '--'}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              {current ? `${current.cpu.coreCount} Cores` : ''}
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-ghost-green"
              animate={{ width: `${current ? current.cpu.usagePercent : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1.5">
            <span>Load: {current ? current.cpu.loadAvg[0] : '0.00'}</span>
            <span>Speed: {current?.cpu.cores[0]?.speed || 0} MHz</span>
          </div>
        </div>

        {/* RAM Utilization */}
        <div className="bg-ghost-dark/80 border border-ghost-border p-3.5 rounded relative overflow-hidden group hover:border-[#00e5ff]/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">RAM ALLOCATION</span>
            <Layers className="w-4 h-4 text-[#00e5ff] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#00e5ff]">
              {current ? `${current.memory.usagePercent}%` : '--'}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              {current ? `${current.memory.usedGB} / ${current.memory.totalGB} GB` : ''}
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-[#00e5ff]"
              animate={{ width: `${current ? current.memory.usagePercent : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1.5">
            <span>Free: {current?.memory.freeGB || 0} GB</span>
            <span>Node RSS: {current?.memory.processRssMB || 0} MB</span>
          </div>
        </div>

        {/* Disk Utilization */}
        <div className="bg-ghost-dark/80 border border-ghost-border p-3.5 rounded relative overflow-hidden group hover:border-ghost-warning/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">DISK PARTITION</span>
            <HardDrive className="w-4 h-4 text-ghost-warning group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-ghost-warning">
              {current ? `${current.disk.usagePercent}%` : '--'}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              {current ? `${current.disk.usedGB} / ${current.disk.totalGB} GB` : ''}
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-ghost-warning"
              animate={{ width: `${current ? current.disk.usagePercent : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1.5">
            <span>Mount: {current?.disk.mountPoint || '/'}</span>
            <span>Free: {current?.disk.freeGB || 0} GB</span>
          </div>
        </div>

        {/* System Uptime / Host */}
        <div className="bg-ghost-dark/80 border border-ghost-border p-3.5 rounded relative overflow-hidden group hover:border-zinc-500 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">SYSTEM RUNTIME</span>
            <Server className="w-4 h-4 text-zinc-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-white truncate">
              {current ? current.system.uptimeFormatted : '--:--:--'}
            </span>
          </div>
          <div className="text-[9px] font-mono text-zinc-400 truncate mt-2">
            HOST: <span className="text-white font-semibold">{current?.system.hostname || 'c2-host'}</span>
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
            <span>{current?.system.platform || 'linux'} ({current?.system.arch || 'x64'})</span>
            <span>Node: {current?.system.nodeVersion || 'v20'}</span>
          </div>
        </div>
      </div>

      {/* Tabs to select active telemetry view */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border transition-all ${
              activeTab === 'all'
                ? 'border-ghost-green text-ghost-green bg-ghost-green/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Combined Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cpu')}
            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border transition-all ${
              activeTab === 'cpu'
                ? 'border-ghost-green text-ghost-green bg-ghost-green/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            CPU Deep-Dive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border transition-all ${
              activeTab === 'memory'
                ? 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            RAM Allocation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disk')}
            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border transition-all ${
              activeTab === 'disk'
                ? 'border-ghost-warning text-ghost-warning bg-ghost-warning/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Disk Storage
          </button>
        </div>

        <span className="text-[9px] font-mono text-zinc-600 uppercase hidden md:inline">
          BUFFER WINDOW: {history.length} SAMPLES RECORDED
        </span>
      </div>

      {/* Recharts Visualizations */}
      <div className="bg-[#050505] border border-ghost-border/80 p-4 rounded min-h-[260px] flex flex-col justify-between">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600 font-mono text-[11px] gap-2">
            <Activity className="w-6 h-6 animate-spin text-ghost-green" />
            <span>INITIALIZING LIVE TELEMETRY STREAM...</span>
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'all' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff41" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00ff41" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#555" 
                    tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#555" 
                    tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} 
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomTacticalTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10, fontSize: 10, fontFamily: 'monospace' }} 
                    iconType="rect"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpuUsage" 
                    name="CPU Utilization" 
                    stroke="#00ff41" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#cpuGrad)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memUsage" 
                    name="RAM Utilization" 
                    stroke="#00e5ff" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#memGrad)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="diskUsage" 
                    name="Disk Partition" 
                    stroke="#ffaa00" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#diskGrad)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : activeTab === 'cpu' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuSingle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff41" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#00ff41" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} unit="%" />
                  <Tooltip content={<CustomTacticalTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 10, fontFamily: 'monospace' }} />
                  <Area 
                    type="monotone" 
                    dataKey="cpuUsage" 
                    name="Overall CPU Load %" 
                    stroke="#00ff41" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#cpuSingle)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : activeTab === 'memory' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ramSingle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} unit="%" />
                  <Tooltip content={<CustomTacticalTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 10, fontFamily: 'monospace' }} />
                  <Area 
                    type="monotone" 
                    dataKey="memUsage" 
                    name="RAM Utilization %" 
                    stroke="#00e5ff" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#ramSingle)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="diskSingle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#666', fontSize: 9, fontFamily: 'monospace' }} unit="%" />
                  <Tooltip content={<CustomTacticalTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 10, fontFamily: 'monospace' }} />
                  <Area 
                    type="monotone" 
                    dataKey="diskUsage" 
                    name="Disk Space %" 
                    stroke="#ffaa00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#diskSingle)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Sub-grid: Multi-core CPU bar breakdown & Memory Breakdown */}
      {current && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Per-Core Load Bars */}
          <div className="bg-ghost-dark/60 border border-ghost-border/70 p-3 rounded space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-white">CPU Per-Core Thread Load</span>
              <span className="text-ghost-green">{current.cpu.model.slice(0, 30)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {current.cpu.cores.slice(0, 8).map((core) => (
                <div key={`core-${core.core}`} className="bg-black/60 border border-zinc-900 p-2 rounded font-mono">
                  <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                    <span>CORE {core.core}</span>
                    <span className="text-white font-bold">{core.usagePercent}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        core.usagePercent > 85 ? 'bg-ghost-danger' : core.usagePercent > 60 ? 'bg-ghost-warning' : 'bg-ghost-green'
                      }`}
                      style={{ width: `${core.usagePercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Distribution & Process Telemetry */}
          <div className="bg-ghost-dark/60 border border-ghost-border/70 p-3 rounded space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-white">Kernel & Node.js Footprint</span>
              <span className="text-[#00e5ff]">PID: {current.system.pid}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px]">
              <div className="bg-black/60 border border-zinc-900 p-2 rounded">
                <span className="text-zinc-500 uppercase block text-[8px]">Node RSS</span>
                <span className="text-white font-bold text-xs">{current.memory.processRssMB} MB</span>
              </div>
              <div className="bg-black/60 border border-zinc-900 p-2 rounded">
                <span className="text-zinc-500 uppercase block text-[8px]">Heap Used</span>
                <span className="text-[#00e5ff] font-bold text-xs">{current.memory.heapUsedMB} MB</span>
              </div>
              <div className="bg-black/60 border border-zinc-900 p-2 rounded">
                <span className="text-zinc-500 uppercase block text-[8px]">Available RAM</span>
                <span className="text-ghost-green font-bold text-xs">{current.memory.freeGB} GB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
