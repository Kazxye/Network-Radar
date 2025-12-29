import { motion } from 'framer-motion';
import { NetworkDevice, DeviceType } from '../../types/network';
import { RadarPosition, getStatusColor } from '../../utils/positioning';
import { Router, Monitor, Smartphone, Server, Cpu, Printer, HelpCircle } from 'lucide-react';

interface Props {
  device: NetworkDevice;
  position: RadarPosition;
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

export default function RadarDevice({ device, position, isSelected, onClick }: Props) {
  const Icon = icons[device.deviceType];
  const color = getStatusColor(device.status);
  
  return (
    <motion.div
      className={`radar-device ${isSelected ? 'selected' : ''} status-${device.status}`}
      style={{ left: position.x, top: position.y, '--status-color': color } as React.CSSProperties}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {device.status === 'online' && (
        <motion.span 
          className="device-pulse"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      
      <div className="device-icon">
        <Icon size={16} />
      </div>
      
      <div className="device-tooltip">
        <span className="tooltip-ip">{device.ip}</span>
        {device.hostname && <span className="tooltip-hostname">{device.hostname}</span>}
      </div>
    </motion.div>
  );
}
