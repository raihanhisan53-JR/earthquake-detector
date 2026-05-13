"use client"
import { useEffect, useRef } from 'react';
import { Bell, BellOff, ExternalLink, Trash2, X } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

export default function NotificationPanel({
  notifications = [],
  unreadCount = 0,
  panelOpen = false,
  openPanel,
  closePanel,
  clearAll,
  notificationsEnabled,
  toggleNotifications,
}) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closePanel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [panelOpen, closePanel]);

  return (
    <div className="notif-wrap" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        className="notif-bell-btn"
        onClick={panelOpen ? closePanel : openPanel}
        title="Notifikasi gempa real-time"
        aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} baru)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {panelOpen && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-panel__header">
            <div className="notif-panel__title">
              <Bell size={15} />
              <span>Notifikasi Gempa</span>
              {unreadCount > 0 && (
                <span className="notif-panel__badge">{unreadCount}</span>
              )}
            </div>
            <div className="notif-panel__controls">
              <button
                type="button"
                className="notif-ctrl-btn"
                onClick={toggleNotifications}
                title={notificationsEnabled ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
              >
                {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              </button>
              {notifications.length > 0 && (
                <button type="button" className="notif-ctrl-btn" onClick={clearAll} title="Hapus semua">
                  <Trash2 size={14} />
                </button>
              )}
              <button type="button" className="notif-ctrl-btn notif-ctrl-btn--close" onClick={closePanel} title="Tutup">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Source tags */}
          <div className="notif-panel__sources">
            <span className="notif-src-tag" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>BMKG</span>
            <span className="notif-src-tag" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>USGS</span>
            <span className="notif-src-tag" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>ESP32</span>
            <span className="notif-panel__live-dot">● Live</span>
          </div>

          {/* List */}
          <div className="notif-panel__list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <p>Belum ada notifikasi</p>
                <small>Gempa M≥4.0 akan muncul otomatis</small>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                  style={{ borderLeftColor: n.level?.color || '#3b82f6' }}
                >
                  <div className="notif-item__row">
                    <span className="notif-item__src" style={{ color: n.sourceColor }}>{n.source}</span>
                    <span className="notif-item__time">{timeAgo(n.timestamp)}</span>
                    {!n.read && <span className="notif-item__dot" style={{ background: n.level?.color }} />}
                  </div>
                  <div className="notif-item__title">{n.title}</div>
                  <div className="notif-item__body">{n.body}</div>
                  {n.potensi && (
                    <div className="notif-item__potensi" style={{ color: n.level?.color }}>
                      {n.potensi}
                    </div>
                  )}
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noreferrer" className="notif-item__link">
                      <ExternalLink size={10} /> Lihat detail
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notif-panel__footer">
            BMKG tiap 30d · USGS tiap 60d · Push notif ke laptop aktif
          </div>
        </div>
      )}
    </div>
  );
}
