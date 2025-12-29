import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkDevice } from '../../types/network';
import { calculateDevicePosition } from '../../utils/positioning';
import RadarDevice from './RadarDevice';
import './Radar.css';

interface Props {
  devices: NetworkDevice[];
  selectedDevice: NetworkDevice | null;
  onDeviceSelect: (device: NetworkDevice) => void;
  isScanning: boolean;
}

export default function RadarCanvas({ devices, selectedDevice, onDeviceSelect, isScanning }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(500);
  const [containerSize, setContainerSize] = useState({ width: 500, height: 500 });

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { offsetWidth, offsetHeight } = containerRef.current;
      setSize(Math.min(offsetWidth, offsetHeight));
      setContainerSize({ width: offsetWidth, height: offsetHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const center = size / 2;
  const containerCenter = { x: containerSize.width / 2, y: containerSize.height / 2 };
  const maxRadius = center - 40;
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="radar-container" ref={containerRef}>
      <svg width={size} height={size} className="radar-svg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 245, 255, 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {rings.map((factor, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * factor}
            fill="none"
            stroke="rgba(0, 245, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        <line x1={center} y1={40} x2={center} y2={size - 40} stroke="rgba(0, 245, 255, 0.1)" />
        <line x1={40} y1={center} x2={size - 40} y2={center} stroke="rgba(0, 245, 255, 0.1)" />

        <g className="radar-sweep" style={{ transformOrigin: `${center}px ${center}px` }}>
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - maxRadius}
            stroke="rgba(0, 245, 255, 0.9)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          <path
            d={`M ${center} ${center} L ${center} ${center - maxRadius} A ${maxRadius} ${maxRadius} 0 0 0 ${center - maxRadius * 0.26} ${center - maxRadius * 0.97} Z`}
            fill="rgba(0, 245, 255, 0.15)"
          />
        </g>

        <circle cx={center} cy={center} r="8" fill="#00f5ff" filter="url(#glow)" />
        <circle cx={center} cy={center} r="4" fill="#0a1628" />
      </svg>

      <AnimatePresence>
        {devices.map(device => {
          const position = calculateDevicePosition(device, containerCenter.x, containerCenter.y, maxRadius);
          return (
            <RadarDevice
              key={device.id}
              device={device}
              position={position}
              isSelected={selectedDevice?.id === device.id}
              onClick={() => onDeviceSelect(device)}
            />
          );
        })}
      </AnimatePresence>

      {isScanning && (
        <motion.div className="scanning-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <span className="pulse" />
          SCANNING...
        </motion.div>
      )}

      <div className="ring-labels">
        {rings.map((factor, i) => (
          <span key={i} className="ring-label" style={{ bottom: `${factor * 45 + 5}%`, left: '52%' }}>
            {Math.round(factor * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}
