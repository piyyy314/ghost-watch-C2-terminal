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

