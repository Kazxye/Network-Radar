import { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkDevice, ScanResult, DeviceStatus } from '../types/network';

const WS_URL = 'ws://localhost:8000/ws';
const API_URL = 'http://localhost:8000/api';

type WSMessage = {
  type: string;
  data: Record<string, unknown>;
};

function parseDevice(raw: Record<string, unknown>): NetworkDevice {
  return {
    id: raw.id as string,
    ip: raw.ip as string,
    mac: raw.mac as string,
    hostname: raw.hostname as string | null,
    vendor: raw.vendor as string | null,
    deviceType: (raw.device_type as string) || 'unknown',
    status: (raw.status as DeviceStatus) || 'unknown',
    lastSeen: new Date(raw.last_seen as string),
    firstSeen: new Date(raw.first_seen as string),
    ports: (raw.ports as NetworkDevice['ports']) || [],
    signalStrength: Math.floor(Math.random() * 40) + 60,
    responseTime: raw.response_time as number | undefined,
  } as NetworkDevice;
}

export function useNetworkData() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Conectado');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('[WS] Desconectado, reconectando em 3s...');
      setIsConnected(false);
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Erro:', err);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch (err) {
        console.error('[WS] Erro ao parsear mensagem:', err);
      }
    };
  }, []);

  const handleMessage = (msg: WSMessage) => {
    switch (msg.type) {
      case 'connected':
        console.log('[WS] Servidor confirmou conexão');
        break;

      case 'devices_list': {
        const list = (msg.data.devices as Record<string, unknown>[]) || [];
        setDevices(list.map(parseDevice));
        break;
      }

      case 'scan_started':
        setIsScanning(true);
        break;

      case 'device_found': {
        const device = parseDevice(msg.data as Record<string, unknown>);
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) {
            return prev.map(d => d.id === device.id ? device : d);
          }
          return [...prev, device];
        });
        break;
      }

      case 'device_updated': {
        const device = parseDevice(msg.data as Record<string, unknown>);
        setDevices(prev => prev.map(d => d.id === device.id ? device : d));
        break;
      }

      case 'scan_completed': {
        setIsScanning(false);
        const data = msg.data as Record<string, unknown>;
        setScanResult({
          timestamp: new Date(data.timestamp as string),
          networkCidr: data.network_cidr as string,
          gatewayIp: data.gateway_ip as string,
          devices: ((data.devices as Record<string, unknown>[]) || []).map(parseDevice),
          scanDuration: data.scan_duration as number,
        });
        break;
      }

      case 'scan_error':
        setIsScanning(false);
        console.error('[Scan] Erro:', msg.data.error);
        break;

      case 'pong':
        break;

      default:
        console.log('[WS] Mensagem não tratada:', msg.type);
    }
  };

  const performScan = useCallback(async () => {
    if (isScanning) return;

    try {
      await fetch(`${API_URL}/scan`, { method: 'POST' });
    } catch (err) {
      console.error('[API] Erro ao iniciar scan:', err);
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('scan');
      }
    }
  }, [isScanning]);

  const scanDevicePorts = useCallback(async (ip: string) => {
    try {
      const res = await fetch(`${API_URL}/devices/${ip}/scan-ports`, { method: 'POST' });
      if (res.ok) {
        const device = await res.json();
        const parsed = parseDevice(device);
        setDevices(prev => prev.map(d => d.ip === ip ? parsed : d));
        return parsed;
      }
    } catch (err) {
      console.error('[API] Erro ao escanear portas:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    if (isConnected && devices.length === 0) {
      performScan();
    }
  }, [isConnected]);

  return {
    devices,
    scanResult,
    isScanning,
    isConnected,
    selectedDevice,
    setSelectedDevice,
    performScan,
    scanDevicePorts,
  };
}
