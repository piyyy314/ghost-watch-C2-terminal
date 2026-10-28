export type ModuleId = 'overview' | 'cryptography' | 'defense' | 'satcom' | 'logs' | 'geolocation' | 'intelligence' | 'sandbox' | 'comm' | 'tactical';

export interface CustomTraceConfig {
  id: string;
  ipOrDomain: string;
  phoneNumber: string;
  crystalType: string;
  resonatingFrequency: number; // in MHz
  echoDelay: number; // in ms
  echoFeedback: number; // in %
  timestamp: string;
  status: 'QUEUED' | 'TRANSMITTING' | 'TRACE_COMPLETE';
}

export interface SystemStatus {
  tier: string;
  hardwareId: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'EMERGENCY';
  pqcStatus: string;
}

export const INITIAL_STATUS: SystemStatus = {
  tier: 'Apex Tier',
  hardwareId: 'HB-9982-AX-2026',
  status: 'OPERATIONAL',
  pqcStatus: 'PQC-Hardened',
};

export interface CpuCoreMetric {
  core: number;
  model: string;
  speed: number;
  usagePercent: number;
}

export interface SystemHealthData {
  timestamp: number;
  timeString: string;
  cpu: {
    usagePercent: number;
    cores: CpuCoreMetric[];
    loadAvg: [number, number, number];
    model: string;
    coreCount: number;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    totalGB: number;
    usedGB: number;
    freeGB: number;
    processRssMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
  };
  disk: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    totalGB: number;
    usedGB: number;
    freeGB: number;
    mountPoint: string;
  };
  system: {
    platform: string;
    arch: string;
    release: string;
    hostname: string;
    uptimeSeconds: number;
    uptimeFormatted: string;
    nodeVersion: string;
    pid: number;
  };
}


