import { motion } from 'framer-motion';
import { RadarCanvas } from '../Radar';
import { DeviceList } from '../DeviceList';
import { useNetworkData } from '../../hooks/useNetworkData';
import { RefreshCw, Settings, Activity, Wifi, Clock, Zap } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { devices, scanResult, isScanning, selectedDevice, setSelectedDevice, performScan } = useNetworkData(10000);

  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-icon"><Wifi size={24} /></div>
          <div className="brand-text">
            <h1>Network Radar</h1>
            <span className="brand-subtitle">Real-time Network Monitor</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <Activity size={16} />
            <span className="stat-value">{onlineCount}</span>
            <span className="stat-label">Online</span>
          </div>
          <div className="stat-item">
            <Zap size={16} />
            <span className="stat-value">{devices.length}</span>
            <span className="stat-label">Dispositivos</span>
          </div>
          {scanResult && (
            <div className="stat-item">
              <Clock size={16} />
              <span className="stat-value">{formatTime(scanResult.timestamp)}</span>
              <span className="stat-label">Último scan</span>
            </div>
          )}
        </div>

        <div className="header-actions">
          <motion.button
            className="action-btn primary"
            onClick={performScan}
            disabled={isScanning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} className={isScanning ? 'spinning' : ''} />
            {isScanning ? 'Escaneando...' : 'Novo Scan'}
          </motion.button>
          <button className="action-btn"><Settings size={16} /></button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="radar-section">
          <div className="section-header">
            <h2>Mapa da Rede</h2>
            {scanResult && (
              <span className="network-info">{scanResult.networkCidr} • Gateway: {scanResult.gatewayIp}</span>
            )}
          </div>
          <div className="radar-wrapper">
            <RadarCanvas
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceSelect={setSelectedDevice}
              isScanning={isScanning}
            />
          </div>
        </section>

        <aside className="devices-section">
          <DeviceList devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
        </aside>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-left">
          <span className="connection-status">
            <span className="status-indicator online" />
            Conectado à rede local
          </span>
        </div>
        <div className="footer-right">
          {scanResult && <span className="scan-duration">Scan em {scanResult.scanDuration}ms</span>}
          <span className="version">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
