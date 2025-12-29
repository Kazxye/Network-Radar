import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkDevice, DeviceStatus } from '../../types/network';
import DeviceCard from './DeviceCard';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import './DeviceList.css';

interface Props {
  devices: NetworkDevice[];
  selectedDevice: NetworkDevice | null;
  onDeviceSelect: (device: NetworkDevice) => void;
}

type SortField = 'ip' | 'status' | 'type' | 'lastSeen';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS = [
  { field: 'ip' as const, label: 'IP' },
  { field: 'status' as const, label: 'Status' },
  { field: 'type' as const, label: 'Tipo' },
  { field: 'lastSeen' as const, label: 'Atividade' },
];

export default function DeviceList({ devices, selectedDevice, onDeviceSelect }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('ip');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...devices];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.ip.includes(q) || d.mac.toLowerCase().includes(q) ||
        d.hostname?.toLowerCase().includes(q) || d.vendor?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'ip': cmp = parseInt(a.ip.split('.')[3]) - parseInt(b.ip.split('.')[3]); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'type': cmp = a.deviceType.localeCompare(b.deviceType); break;
        case 'lastSeen': cmp = b.lastSeen.getTime() - a.lastSeen.getTime(); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [devices, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const counts = useMemo(() => ({
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    unknown: devices.filter(d => d.status === 'unknown').length,
  }), [devices]);

  return (
    <div className="device-list">
      <div className="list-header">
        <h2 className="list-title">
          Dispositivos
          <span className="device-count">{devices.length}</span>
        </h2>
        
        <div className="status-summary">
          <span className="status-dot online" /><span>{counts.online}</span>
          <span className="status-dot offline" /><span>{counts.offline}</span>
          <span className="status-dot unknown" /><span>{counts.unknown}</span>
        </div>
      </div>

      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por IP, MAC, hostname..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className={`filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-buttons">
                {(['all', 'online', 'offline', 'unknown'] as const).map(s => (
                  <button
                    key={s}
                    className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'all' ? 'Todos' : s}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Ordenar por</label>
              <div className="filter-buttons">
                {SORT_OPTIONS.map(({ field, label }) => (
                  <button
                    key={field}
                    className={`filter-btn ${sortField === field ? 'active' : ''}`}
                    onClick={() => toggleSort(field)}
                  >
                    {label}
                    {sortField === field && (sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="list-content">
        <AnimatePresence mode="popLayout">
          {filtered.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.03 }}
            >
              <DeviceCard
                device={device}
                isSelected={selectedDevice?.id === device.id}
                onClick={() => onDeviceSelect(device)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="empty-state">Nenhum dispositivo encontrado</div>
        )}
      </div>
    </div>
  );
}
