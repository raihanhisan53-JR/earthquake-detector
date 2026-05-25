"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellOff, ExternalLink, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

function timeAgo(ts, lang = 'id') {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (lang === 'en') {
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
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

function sendDesktopNotification(title, body, icon = '/logo-v2.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon, badge: '/logo-v2.png', tag: 'earthquake-alert' });
  } catch (e) {
    console.warn('[Desktop Notif]', e);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLD_STEPS = [0, 2, 3, 4, 5, 6, 7];

export default function NotificationPanel({
  notifications = [],
  unreadCount = 0,
  panelOpen = false,
  openPanel,
  closePanel,
  clearAll,
  notificationsEnabled,
  toggleNotifications,
  notifThreshold = 4,
  setNotifThreshold,
}) {
  const { t, lang } = useI18n();
  const bellRef  = useRef(null);
  const panelRef = useRef(null);
  const [desktopPermission, setDesktopPermission] = useState('default');
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const [showThreshold, setShowThreshold] = useState(false);
  const prevNotifCountRef = useRef(0);

  // Hitung posisi panel berdasarkan posisi bell button (fixed positioning)
  const updatePanelPos = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const panelWidth = window.innerWidth <= 480 ? window.innerWidth - 24 : 360;
    const rightFromEdge = window.innerWidth - rect.right;
    const clampedRight = Math.max(8, Math.min(rightFromEdge, window.innerWidth - panelWidth - 8));
    setPanelPos({
      top: rect.bottom + 10,
      right: clampedRight,
    });
  }, []);

  // Init: cek permission saat mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setTimeout(() => {
        setDesktopPermission(Notification.permission);
      }, 0);
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

  // Hitung posisi saat panel dibuka & saat window di-resize/scroll
  useEffect(() => {
    if (!panelOpen) return;
    updatePanelPos();
    window.addEventListener('resize', updatePanelPos);
    window.addEventListener('scroll', updatePanelPos, true);
    return () => {
      window.removeEventListener('resize', updatePanelPos);
      window.removeEventListener('scroll', updatePanelPos, true);
    };
  }, [panelOpen, updatePanelPos]);

  // Close on outside click — cek bell + panel
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      const clickedBell  = bellRef.current?.contains(e.target);
      const clickedPanel = panelRef.current?.contains(e.target);
      if (!clickedBell && !clickedPanel) closePanel?.();
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

  // Panel dropdown — di-render via portal ke document.body agar tidak terpotong overflow:hidden
  const panelContent = panelOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={panelRef}
          className="notif-panel"
          style={{
            position: 'fixed',
            top: panelPos.top,
            right: panelPos.right,
            zIndex: 99999,
          }}
        >
          {/* Header */}
          <div className="notif-panel__header">
            <div className="notif-panel__title">
              <Bell size={15} />
              <span>{t('notifications')}</span>
              {unreadCount > 0 && (
                <span className="notif-panel__badge">{unreadCount}</span>
              )}
            </div>
            <div className="notif-panel__controls">
              {/* Threshold toggle */}
              <button
                type="button"
                className={`notif-ctrl-btn ${showThreshold ? 'notif-ctrl-btn--active' : ''}`}
                onClick={() => setShowThreshold(v => !v)}
                title={t('minMagnitude')}
              >
                <SlidersHorizontal size={14} />
              </button>
              <button
                type="button"
                className="notif-ctrl-btn"
                onClick={toggleNotifications}
                title={notificationsEnabled ? t('disableNotif') : t('enableNotif')}
              >
                {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              </button>
              {notifications.length > 0 && (
                <button type="button" className="notif-ctrl-btn" onClick={clearAll} title={t('clearAll')}>
                  <Trash2 size={14} />
                </button>
              )}
              <button type="button" className="notif-ctrl-btn notif-ctrl-btn--close" onClick={closePanel} title="Tutup">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Magnitude threshold slider */}
          {showThreshold && (
            <div className="notif-threshold">
              <div className="notif-threshold__label">
                <SlidersHorizontal size={12} />
                <span>{t('minMagnitude')}</span>
                <strong className="notif-threshold__value">M {notifThreshold.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                className="notif-threshold__slider"
                min={0}
                max={7}
                step={0.5}
                value={notifThreshold}
                onChange={(e) => setNotifThreshold?.(parseFloat(e.target.value))}
                aria-label={t('minMagnitude')}
              />
              <div className="notif-threshold__ticks">
                {THRESHOLD_STEPS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`notif-threshold__tick ${notifThreshold === v ? 'active' : ''}`}
                    onClick={() => setNotifThreshold?.(v)}
                  >
                    {v === 0 ? t('all') : `M${v}`}
                  </button>
                ))}
              </div>
              <p className="notif-threshold__hint">{t('minMagnitudeHint')}</p>
            </div>
          )}

          {/* Source tags */}
          <div className="notif-panel__sources">
            <span className="notif-src-tag" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>BMKG</span>
            <span className="notif-src-tag" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>USGS</span>
            <span className="notif-src-tag" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>ESP32</span>
            <span className="notif-panel__live-dot">● Live</span>
          </div>

          {/* Desktop notification permission banner */}
          {desktopPermission !== 'granted' && desktopPermission !== 'denied' && (
            <div className="notif-perm-banner notif-perm-banner--info">
              <Bell size={13} style={{ flexShrink: 0, color: '#3b82f6' }} />
              <span>{t('desktopNotifAllow')}</span>
              <button type="button" className="notif-perm-btn" onClick={handleRequestPermission}>
                {t('desktopNotifAllow2')}
              </button>
            </div>
          )}
          {desktopPermission === 'denied' && (
            <div className="notif-perm-banner notif-perm-banner--error">
              {t('desktopNotifBlocked')}
            </div>
          )}
          {desktopPermission === 'granted' && (
            <div className="notif-perm-banner notif-perm-banner--success">
              {t('desktopNotifActive')}
            </div>
          )}

          {/* List */}
          <div className="notif-panel__list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <p>{t('noNotifications')}</p>
                <small>{t('noNotificationsHint')}</small>
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
                    <span className="notif-item__time">{timeAgo(n.timestamp, lang)}</span>
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
                      <ExternalLink size={10} /> {lang === 'en' ? 'View detail' : 'Lihat detail'}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notif-panel__footer">
            {t('notifFooter')} · {desktopPermission === 'granted' ? t('pushActive') : t('pushInactive')}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* Bell button */}
      <button
        ref={bellRef}
        type="button"
        className="notif-bell-btn"
        onClick={() => { panelOpen ? closePanel?.() : openPanel?.(); }}
        title={t('notifications')}
        aria-label={`${t('notifications')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        aria-expanded={panelOpen}
        aria-haspopup="true"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Panel dropdown via portal — tidak terpotong overflow:hidden */}
      {panelContent}
    </>
  );
}
