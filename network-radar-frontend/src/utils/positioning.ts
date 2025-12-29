import { NetworkDevice, DeviceType } from '../types/network';

export interface RadarPosition {
  x: number;
  y: number;
  angle: number;
  distance: number;
}

const DISTANCE_BY_TYPE: Record<DeviceType, number> = {
  router: 0.08,
  server: 0.3,
  computer: 0.5,
  printer: 0.55,
  mobile: 0.65,
  iot: 0.75,
  unknown: 0.6
};

const STATUS_COLORS: Record<string, string> = {
  online: '#00ff88',
  offline: '#ff4757',
  unknown: '#ffa502'
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

export function calculateDevicePosition(
  device: NetworkDevice,
  centerX: number,
  centerY: number,
  maxRadius: number
): RadarPosition {
  const idHash = hash(device.id);
  const macHash = hash(device.mac);
  
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = (idHash * goldenAngle) % (Math.PI * 2);
  
  const baseDistance = DISTANCE_BY_TYPE[device.deviceType];
  const variation = (macHash % 20) / 100;
  const distanceFactor = Math.min(0.9, Math.max(0.15, baseDistance + variation));
  const distance = maxRadius * distanceFactor;
  
  return {
    x: centerX + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
    angle: angle * (180 / Math.PI),
    distance
  };
}

export function formatMac(mac: string): string {
  return mac.toUpperCase().replace(/(.{2})(?=.)/g, '$1:');
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || STATUS_COLORS.unknown;
}
