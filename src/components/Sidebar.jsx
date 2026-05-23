"use client"
import { useState, useEffect, useMemo } from 'react';
import {
  CloudSun, Cpu, History, Home, LayoutGrid, MapPinned,
  Play, X, Globe, Globe2, Video, Bot, Search, TrendingUp,
} from 'lucide-react';

export default function Sidebar({
  connected,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed = false,
  toggleCollapsed = () => {},
  user = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedAvatar, setSavedAvatar] = useState(null);
  const [savedName, setSavedName] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const navSections = [
    {
      title: '',
      items: [
        { id: 'overview', icon: <LayoutGrid size={18} />, label: 'Dashboard' },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        { id: 'peta',     icon: <MapPinned size={18} />, label: 'Peta Gempa'  },
        { id: 'globe',    icon: <Globe2 size={18} />,    label: 'Google Maps' },
        { id: 'livecctv', icon: <Video size={18} />,     label: 'Live CCTV'  },
        { id: 'cuaca',    icon: <CloudSun size={18} />,  label: 'Cuaca'       },
      ],
    },
    {
      title: 'Analisa & Data',
      items: [
        { id: 'gempa',   icon: <Home size={18} />,    label: 'Gempa Terkini' },
        { id: 'analitik',icon: <Globe size={18} />,   label: 'Analitik'      },
        { id: 'riwayat', icon: <History size={18} />, label: 'Riwayat'       },
      ],
    },
    {
      title: 'Sistem Pro',
      items: [
        { id: 'esp32',  icon: <Cpu size={18} />,  label: 'ESP32 Sensor' },
        { id: 'edukasi',icon: <Play size={18} />, label: 'Edukasi'      },
        { id: 'aria',   icon: <Bot size={18} />,  label: 'ARIA AI'      },
      ],
    },
    {
      title: 'Panduan',
      items: [
        { id: 'seo', icon: <TrendingUp size={18} />, label: 'SEO & Google', badge: 'NEW' },
      ],
    },
  ];

  const isVisuallyCollapsed = collapsed && !isHovered;

  // Filter nav based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase();
    return navSections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item =>
            item.label.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        ),
      }))
      .filter(section => section.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(`tectra_profile_${user.id}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.avatarDataUrl) setSavedAvatar(p.avatarDataUrl);
        if (p.displayName)   setSavedName(p.displayName);
      }
    } catch { /* ignore */ }
  }, [user?.id, activeTab]);

  let sidebarClass = `sidebar ${mobileOpen ? 'mobile-open' : ''}`;
  if (collapsed) {
    sidebarClass += isHovered ? ' sidebar--hover-expanded' : ' sidebar--collapsed';
  }

  const avatarSrc   = savedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName = savedName   || user?.user_metadata?.full_name  || user?.email?.split('@')[0]   || 'User';

  const handleNav = (e, id) => {
    e.preventDefault();
    setActiveTab(id);
    setMobileOpen?.(false);
  };

  return (
    <>
      <div className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside
        className={sidebarClass}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-header__brand">
            <div className="sidebar-brand-mark">
              <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <span className="sidebar-brand">Earthquake Detector</span>
          </div>
          <button type="button" className="mobile-close-btn" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        {/* ── Gemini-style Search bar ── */}
        {!isVisuallyCollapsed && (
          <div className="sidebar-search-wrap">
            <div className="sidebar-search-box">
              <Search size={14} className="sidebar-search-ico" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="sidebar-search-inp"
                aria-label="Cari menu"
              />
              {searchQuery && (
                <button className="sidebar-search-clr" onClick={() => setSearchQuery('')} aria-label="Hapus pencarian">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="sidebar-nav-section">
              {/* Section label */}
              {section.title && !isVisuallyCollapsed && (
                <div className="sidebar-section-label">{section.title}</div>
              )}
              {section.title && isVisuallyCollapsed && (
                <div className="sidebar-section-sep" />
              )}

              {section.items.map(item => (
                <a
                  key={item.id}
                  href="#"
                  className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                  onClick={e => handleNav(e, item.id)}
                  title={isVisuallyCollapsed ? item.label : undefined}
                >
                  <span className="nav-item__icon">{item.icon}</span>
                  <span className="nav-item__label">
                    {item.label}
                    {item.badge && (
                      <span className="nav-item__badge">{item.badge}</span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          ))}

          {/* Empty search state */}
          {searchQuery && filteredSections.length === 0 && (
            <div className="sidebar-search-empty">
              <Search size={22} />
              <span>Menu tidak ditemukan</span>
            </div>
          )}
        </nav>

        {/* ── Footer / Profile ── */}
        <div className="sidebar-footer">
          <button
            type="button"
            className={`sidebar-profile-btn${activeTab === 'profil' ? ' active' : ''}`}
            onClick={() => { setActiveTab('profil'); setMobileOpen?.(false); }}
            title="Profil"
          >
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
