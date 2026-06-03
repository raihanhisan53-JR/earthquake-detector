"use client"
import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  CloudSun, Cpu, History, Home, LayoutGrid, MapPinned,
  Play, X, Globe, Globe2, Video, Bot, Shield
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export default function Sidebar({
  connected,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed = false,
  user,
}) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const { savedAvatar, savedName } = useMemo(() => {
    if (!user?.id || typeof window === 'undefined') {
      return { savedAvatar: null, savedName: null };
    }
    try {
      const raw = localStorage.getItem(`tectra_profile_${user.id}`);
      if (!raw) return { savedAvatar: null, savedName: null };
      const p = JSON.parse(raw);
      return {
        savedAvatar: p.avatarDataUrl ?? null,
        savedName: p.displayName ?? null,
      };
    } catch {
      return { savedAvatar: null, savedName: null };
    }
  }, [user]);

  const navSections = [
    {
      title: '',
      items: [
        { id: 'overview', icon: <LayoutGrid size={18} />, label: t('overview') },
      ],
    },
    {
      title: t('navMonitoring') || 'Monitoring',
      items: [
        { id: 'peta',     icon: <MapPinned size={18} />, label: t('map')  },
        { id: 'globe',    icon: <Globe2 size={18} />,    label: t('googleMaps') },
        { id: 'livecctv', icon: <Video size={18} />,     label: t('liveCctv')  },
        { id: 'cuaca',    icon: <CloudSun size={18} />,  label: t('weather')       },
      ],
    },
    {
      title: t('navAnalytics') || 'Analisa & Data',
      items: [
        { id: 'gempa',   icon: <Home size={18} />,    label: t('earthquake') },
        { id: 'analitik',icon: <Globe size={18} />,   label: t('analytics')      },
        { id: 'riwayat', icon: <History size={18} />, label: t('history')       },
      ],
    },
    {
      title: t('navSystemPro') || 'Sistem Pro',
      items: [
        { id: 'edukasi',icon: <Play size={18} />, label: t('education')      },
        { id: 'evakuasi', icon: <Shield size={18} />, label: t('evakuasi') },
        { id: 'timetravel', icon: <History size={18} />, label: t('timetravel') },
        { id: 'aria',   icon: <Bot size={18} />,  label: t('aria')      },
      ],
    },
  ];

  const isVisuallyCollapsed = collapsed && !isHovered;

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
              <Image src="/logo-v2.png" alt="Logo" width={28} height={28} style={{ objectFit: 'contain' }} />
            </div>
            <span className="sidebar-brand">Earthquake Detector</span>
          </div>
          <button type="button" className="mobile-close-btn" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>


        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (section.items.length > 0 && (
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
          )))}
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
              <Image
                src={avatarSrc}
                alt="avatar"
                width={40}
                height={40}
                className="sidebar-profile-avatar sidebar-profile-avatar--img"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="sidebar-profile-avatar sidebar-profile-avatar--init">
                {(displayName || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{displayName}</span>
              <span className="sidebar-profile-sub">
                Tectra Pro
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
