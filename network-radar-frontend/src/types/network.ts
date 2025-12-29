export type DeviceStatus = 'online' | 'offline' | 'unknown';

export type DeviceType = 
  | 'router' 
  | 'computer' 
  | 'mobile' 
  | 'server' 
  | 'iot' 
  | 'printer' 
  | 'unknown';

export interface Port {
  number: number;
  protocol: 'tcp' | 'udp';
  service: string;
  state: 'open' | 'closed' | 'filtered';
}

export interface NetworkDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string | null;
  vendor: string | null;
  deviceType: DeviceType;
  status: DeviceStatus;
  lastSeen: Date;
  firstSeen: Date;
  ports: Port[];
  signalStrength?: number;
  responseTime?: number;
}

export interface ScanResult {
  timestamp: Date;
  networkCidr: string;
  gatewayIp: string;
  devices: NetworkDevice[];
  scanDuration: number;
}

export interface RadarConfig {
  refreshInterval: number;
  maxDevices: number;
  showOffline: boolean;
  animationSpeed: number;
}
