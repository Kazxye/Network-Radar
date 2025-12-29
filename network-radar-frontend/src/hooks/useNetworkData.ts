import { useState, useEffect, useCallback } from 'react';
import { NetworkDevice, ScanResult, DeviceType, DeviceStatus } from '../types/network';

const VENDORS = [
  'Apple, Inc.', 'Samsung Electronics', 'Intel Corporate', 'Raspberry Pi Foundation',
  'TP-Link Technologies', 'Cisco Systems', 'Dell Inc.', 'Hewlett Packard',
  'ASUS Computer', 'Google, Inc.', 'Amazon Technologies', 'Xiaomi Communications',
];

const HOSTNAMES = [
  'macbook-pro', 'galaxy-s23', 'raspberrypi', 'desktop-pc', 'smart-tv',
  'printer-office', 'nest-hub', 'echo-dot', 'iphone-14', 'surface-laptop',
  'synology-nas', 'gaming-pc',
];

const DEVICE_TYPES: DeviceType[] = ['router', 'computer', 'mobile', 'server', 'iot', 'printer'];
const STATUSES: DeviceStatus[] = ['online', 'online', 'online', 'offline', 'unknown'];

function randomMac(): string {
  const hex = '0123456789ABCDEF';
  return Array.from({ length: 12 }, () => hex[Math.floor(Math.random() * 16)]).join('');
}

function randomPorts(type: DeviceType): NetworkDevice['ports'] {
  const portsByType: Record<string, { number: number; service: string }[]> = {
    router: [{ number: 80, service: 'HTTP' }, { number: 443, service: 'HTTPS' }, { number: 53, service: 'DNS' }],
    server: [{ number: 22, service: 'SSH' }, { number: 80, service: 'HTTP' }, { number: 443, service: 'HTTPS' }, { number: 3306, service: 'MySQL' }],
    computer: [{ number: 22, service: 'SSH' }, { number: 445, service: 'SMB' }],
    printer: [{ number: 9100, service: 'JetDirect' }, { number: 631, service: 'IPP' }],
    iot: [{ number: 80, service: 'HTTP' }],
    mobile: [],
    unknown: [],
  };

  return (portsByType[type] || []).map(p => ({
    ...p,
    protocol: 'tcp' as const,
    state: 'open' as const,
  }));
}

function createMockDevice(index: number): NetworkDevice {
  const type = index === 0 ? 'router' : DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
  const ip = index === 0 ? '192.168.1.1' : `192.168.1.${100 + index}`;
  
  return {
    id: `device-${index}`,
    ip,
    mac: randomMac(),
    hostname: HOSTNAMES[index % HOSTNAMES.length] || null,
    vendor: VENDORS[Math.floor(Math.random() * VENDORS.length)],
    deviceType: type,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    lastSeen: new Date(),
    firstSeen: new Date(Date.now() - Math.random() * 86400000 * 30),
    ports: randomPorts(type),
    signalStrength: Math.floor(Math.random() * 60) + 40,
    responseTime: Math.floor(Math.random() * 50) + 1,
  };
}

export function useNetworkData(refreshInterval = 5000) {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);

  const performScan = useCallback(() => {
    setIsScanning(true);
    
    setTimeout(() => {
      const count = Math.floor(Math.random() * 5) + 8;
      const newDevices = Array.from({ length: count }, (_, i) => createMockDevice(i));
      
      setDevices(newDevices);
      setScanResult({
        timestamp: new Date(),
        networkCidr: '192.168.1.0/24',
        gatewayIp: '192.168.1.1',
        devices: newDevices,
        scanDuration: Math.floor(Math.random() * 2000) + 500,
      });
      setIsScanning(false);
    }, 1500);
  }, []);

  useEffect(() => {
    performScan();
  }, [performScan]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        status: Math.random() > 0.1 ? device.status : STATUSES[Math.floor(Math.random() * 3)],
        responseTime: Math.floor(Math.random() * 50) + 1,
        lastSeen: device.status === 'online' ? new Date() : device.lastSeen,
      })));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    devices,
    scanResult,
    isScanning,
    selectedDevice,
    setSelectedDevice,
    performScan,
  };
}
