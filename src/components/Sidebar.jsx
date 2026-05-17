"use client"
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CloudSun, Cpu, History, Home, LayoutGrid, MapPinned, Play, X, Globe, Globe2, Video, Bot } from 'lucide-react';

export default function Sidebar({
  connected,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed = false,
  toggleCollapsed = () => { },
  user = null,
}) {
  const navItems = [
    { id: 'overview', icon: <LayoutGrid size={18} />, label: 'Ringkasan' },
    { id: 'gempa', icon: <Home size={18} />, label: 'Gempa Bumi Terkini' },
    { id: 'peta', icon: <MapPinned size={18} />, label: 'Peta Gempa Indonesia' },
    { id: 'globe', icon: <Globe2 size={18} />, label: 'Globe Seismik 3D', badge: 'NEW' },
    { id: 'analitik', icon: <Globe size={18} />, label: 'Analitik & Tren' },
    { id: 'livecctv', icon: <Video size={18} />, label: 'Pantau Live' },
    { id: 'edukasi', icon: <Play size={18} />, label: 'Edukasi Bencana' },
    { id: 'cuaca', icon: <CloudSun size={18} />, label: 'Cuaca & Iklim' },
    { id: 'esp32', icon: <Cpu size={18} />, label: 'ESP32 Sensor' },
    { id: 'riwayat', icon: <History size={18} />, label: 'Riwayat Kejadian' },
    { id: 'aria', icon: <Bot size={18} />, label: 'ARIA AI' },
  ];

  // Load saved avatar + display name from localStorage (set by ProfilePage)
  const [savedAvatar, setSavedAvatar] = useState(null);
  const [savedName, setSavedName] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(`tectra_profile_${user.id}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.avatarDataUrl) setSavedAvatar(p.avatarDataUrl);
        if (p.displayName) setSavedName(p.displayName);
      }
    } catch { /* ignore */ }
  }, [user?.id, activeTab]);

  const avatarSrc = savedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName = savedName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

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
              <span className="nav-item__label">
                {item.label}
                {item.badge && (
                  <span style={{
                    marginLeft: '6px', fontSize: '9px', fontWeight: '700',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: '#fff', padding: '1px 5px', borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}>{item.badge}</span>
                )}
              </span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Profile card — klik untuk buka tab profil */}
          <button
            type="button"
            className={`sidebar-profile-btn ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profil'); setMobileOpen?.(false); }}
            title="Profil & Pengaturan"
          >
            {/* Avatar: prioritas savedAvatar (dari localStorage), lalu Google avatar, lalu inisial */}
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="sidebar-profile-avatar sidebar-profile-avatar--img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="sidebar-profile-avatar sidebar-profile-avatar--init">
                {(displayName || 'U')[0].toUpperCase()}
              </div>
            )}
            {/* Info — hidden when collapsed */}
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{displayName}</span>
              <span className="sidebar-profile-sub">
                <span className={`sidebar-esp-dot ${connected ? 'online' : 'offline'}`} />
                {connected ? 'ESP32 Online' : 'ESP32 Offline'}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
