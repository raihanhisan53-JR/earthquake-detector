"use client"
import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, ExternalLink, Trash2, X } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

// ── Desktop Notification helper ──────────────────────────────────────────────
async function requestDesktopPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function sendDesktopNotification(title, body, icon = '/logo.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon, badge: '/logo.png', tag: 'earthquake-alert' });
  } catch (e) {
    console.warn('[Desktop Notif]', e);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const [desktopPermission, setDesktopPermission] = useState('default');
  const prevNotifCountRef = useRef(0);

  // Init: cek permission saat mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission);
    }
  }, []);

  // Kirim desktop notification setiap ada notifikasi baru
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (notifications.length > prevNotifCountRef.current) {
      const newest = notifications[0];
      if (newest && Notification.permission === 'granted') {
        sendDesktopNotification(
          newest.title || 'Gempa Terdeteksi',
          newest.message || newest.body || '',
        );
      }
    }
    prevNotifCountRef.current = notifications.length;
  }, [notifications, notificationsEnabled]);

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

  const handleRequestPermission = async () => {
    const result = await requestDesktopPermission();
    setDesktopPermission(result);
  };

  return (
    <div className="notif-wrap" ref={panelRef} style={{ position: 'relative', zIndex: 1000 }}>
      {/* Bell button */}
      <button
        type="button"
        className="notif-bell-btn"
        onClick={(e) => {
          e.stopPropagation();
          panelOpen ? closePanel?.() : openPanel?.();
        }}
        title="Notifikasi gempa real-time"
        aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} baru)` : ''}`}
        style={{ position: 'relative', zIndex: 1001, cursor: 'pointer' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {panelOpen && (
        <div className="notif-panel" style={{ zIndex: 1002 }}>
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

          {/* Desktop notification permission banner */}
          {desktopPermission !== 'granted' && desktopPermission !== 'denied' && (
            <div style={{
              margin: '8px 12px',
              padding: '8px 12px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }}>
              <Bell size={13} style={{ flexShrink: 0, color: '#3b82f6' }} />
              <span style={{ flex: 1, color: 'var(--text-secondary, #94a3b8)' }}>
                Aktifkan notifikasi ke laptop/PC
              </span>
              <button
                type="button"
                onClick={handleRequestPermission}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Izinkan
              </button>
            </div>
          )}
          {desktopPermission === 'denied' && (
            <div style={{
              margin: '8px 12px',
              padding: '8px 12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#ef4444',
            }}>
              ⚠️ Notifikasi diblokir browser. Buka pengaturan situs untuk mengizinkan.
            </div>
          )}
          {desktopPermission === 'granted' && (
            <div style={{
              margin: '8px 12px',
              padding: '6px 12px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#10b981',
            }}>
              ✓ Notifikasi desktop aktif
            </div>
          )}

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
                  <div className="notif-item__body">{n.message || n.body}</div>
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
            BMKG tiap 5m · USGS tiap 5m · {desktopPermission === 'granted' ? '🔔 Push notif aktif' : 'Push notif belum aktif'}
          </div>
        </div>
      )}
    </div>
  );
}
