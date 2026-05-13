"use client"
import { ChevronLeft, ChevronRight, CloudSun, Cpu, History, Home, LayoutGrid, MapPinned, Play, Wind, X, Globe, Video, ShieldCheck } from 'lucide-react';

export default function Sidebar({
  connected,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed = false,
  toggleCollapsed = () => { },
}) {
  const navItems = [
    { id: 'overview', icon: <LayoutGrid size={18} />, label: 'Ringkasan' },
    { id: 'gempa', icon: <Home size={18} />, label: 'Gempa Bumi Terkini' },
    { id: 'peta', icon: <MapPinned size={18} />, label: 'Peta Gempa Indonesia' },
    { id: 'analitik', icon: <Globe size={18} />, label: 'Analitik & Tren' },
    { id: 'livecctv', icon: <Video size={18} />, label: 'Pantau Live' },
    { id: 'edukasi', icon: <Play size={18} />, label: 'Edukasi Bencana' },
    { id: 'cuaca', icon: <CloudSun size={18} />, label: 'Cuaca & Iklim' },
    { id: 'udara', icon: <Wind size={18} />, label: 'Kualitas Udara' },
    { id: 'esp32', icon: <Cpu size={18} />, label: 'ESP32 Sensor' },
    { id: 'riwayat', icon: <History size={18} />, label: 'Riwayat Kejadian' },
  ];

  const getNavClass = (id) => `nav-item ${activeTab === id ? 'active' : ''}`;

  const handleNav = (event, id) => {
    event.preventDefault();
    setActiveTab(id);
    setMobileOpen?.(false);
  };

  return (
    <>
      <div className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)}></div>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}${collapsed ? ' sidebar--collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header__brand">
            <div className="sidebar-brand-mark">
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '34px', height: '34px', objectFit: 'contain' }}
              />
            </div>
            <span className="sidebar-brand">Earthquake Detector</span>
          </div>
          <button type="button" className="mobile-close-btn" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={getNavClass(item.id)}
              onClick={(event) => handleNav(event, item.id)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              <span className="nav-item__label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="esp-status" title={connected ? 'ESP32 Online' : 'ESP32 Offline'}>
            <div className={`status-dot ${connected ? 'online' : 'offline'}`}></div>
            <span>{connected ? 'ESP32 Online' : 'ESP32 Offline'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
