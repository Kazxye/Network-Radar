import { motion } from 'framer-motion';
import { NetworkDevice, DeviceType } from '../../types/network';
import { formatMac, getStatusColor } from '../../utils/positioning';
import { Router, Monitor, Smartphone, Server, Cpu, Printer, HelpCircle, Clock, Wifi, Activity } from 'lucide-react';
import './DeviceList.css';

interface Props {
  device: NetworkDevice;
  isSelected: boolean;
  onClick: () => void;
}

const icons: Record<DeviceType, React.ElementType> = {
  router: Router,
  computer: Monitor,
  mobile: Smartphone,
  server: Server,
  iot: Cpu,
  printer: Printer,
  unknown: HelpCircle,
};

const labels: Record<DeviceType, string> = {
  router: 'Roteador',
  computer: 'Computador',
  mobile: 'Dispositivo Móvel',
  server: 'Servidor',
  iot: 'IoT Device',
  printer: 'Impressora',
  unknown: 'Desconhecido',
};

export default function DeviceCard({ device, isSelected, onClick }: Props) {
  const Icon = icons[device.deviceType];
  const color = getStatusColor(device.status);
  
  const lastSeen = () => {
    const diff = Date.now() - device.lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <motion.div
      className={`device-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ '--status-color': color } as React.CSSProperties}
    >
      <div className="card-status-bar" />
      
      <div className="card-icon">
        <Icon size={20} />
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="card-ip">{device.ip}</span>
          <span className={`card-status-badge status-${device.status}`}>
            {device.status.toUpperCase()}
          </span>
        </div>
        
        {device.hostname && <span className="card-hostname">{device.hostname}</span>}
        <span className="card-type">{labels[device.deviceType]}</span>
        {device.vendor && <span className="card-vendor">{device.vendor}</span>}

        {isSelected && (
          <motion.div 
            className="card-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="detail-item">
              <span className="detail-label">MAC</span>
              <span className="detail-value mono">{formatMac(device.mac)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label"><Clock size={12} /> Última vez visto</span>
              <span className="detail-value">{lastSeen()}</span>
            </div>
            
            {device.responseTime && (
              <div className="detail-item">
                <span className="detail-label"><Activity size={12} /> Latência</span>
                <span className="detail-value">{device.responseTime}ms</span>
              </div>
            )}
            
            {device.signalStrength && (
              <div className="detail-item">
                <span className="detail-label"><Wifi size={12} /> Sinal</span>
                <span className="detail-value">{device.signalStrength}%</span>
              </div>
            )}
            
            {device.ports.length > 0 && (
              <div className="detail-ports">
                <span className="detail-label">Portas Abertas</span>
                <div className="ports-list">
                  {device.ports.map(port => (
                    <span key={port.number} className="port-badge">
                      {port.number}/{port.protocol}
                      <span className="port-service">{port.service}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
