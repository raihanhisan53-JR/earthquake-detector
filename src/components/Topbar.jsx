"use client"
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  BellOff,
  FlaskConical,
  Link,
  LogOut,
  Menu,
  Moon,
  Sun,
  Unlink,
  Wifi,
  WifiOff,
  X,
  Camera,
  ChevronDown,
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import LanguageToggle from './LanguageToggle';
import { useI18n } from '@/hooks/useI18n';

const getProfileName = (user) => {
  // Supabase: user_metadata.full_name atau email
  return user?.user_metadata?.full_name 
    || user?.user_metadata?.name
    || user?.email?.split('@')[0] 
    || 'Operator'
}

const getProfileInitials = (user) => {
  const base = getProfileName(user).trim()
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }
  return base.slice(0, 2).toUpperCase() || 'OP'
}

const getProfilePhoto = (user) => {
  // Supabase Google: user_metadata.avatar_url atau picture
  return user?.user_metadata?.avatar_url 
    || user?.user_metadata?.picture 
    || ''
}

const getProviderLabel = (user) => {
  const provider = user?.app_metadata?.provider || ''
  if (provider === 'google') return 'Google Account'
  if (provider === 'email') return 'Email & Password'
  return 'Secure Session'
}

// Warna avatar berdasarkan nama (konsisten)
const getAvatarColor = (name) => {
  const colors = ['#8b5cf6','#6366f1','#3b82f6','#0ea5e9','#10b981','#f59e0b','#ef4444']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ─── Audio singleton di luar React ───────────────────────────────────────────
// Disimpan di module scope agar tidak hilang saat re-render
let _siren = null;

function playSiren(onOk, onErr) {
  // Hentikan yang lama dulu
  if (_siren) {
    try { _siren.pause(); } catch (_) { /* ignore */ }
    _siren = null;
  }

  function trySource(src, fallbackSrc) {
    const a = new Audio(src);
    a.loop = true;
    a.volume = 1.0;
    _siren = a;
    a.play().then(onOk).catch(() => {
      if (fallbackSrc) {
        const b = new Audio(fallbackSrc);
        b.loop = true;
        b.volume = 1.0;
        _siren = b;
        b.play().then(onOk).catch(onErr);
      } else {
        onErr(new Error('All sources failed'));
      }
    });
  }

  trySource('/tornado-siren.mp3', '/alert.m4a');
}

function stopSiren() {
  if (_siren) {
    try { _siren.pause(); _siren.currentTime = 0; } catch (_) { /* ignore */ }
    _siren = null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Topbar({
  theme,
  toggleTheme,
  notificationsEnabled,
  toggleNotifications,
  connected,
  compact = false,
  pageLabel = '',
  hidden = false,
  user = {},
  onLogout,
  esp32Ip = '',
  onConnect,
  onDisconnect,
  onMenuClick,
  sidebarCollapsed,
  toggleSidebar,
  notifyUser = (..._args) => {},
  notifications = [],
  unreadCount = 0,
  notifPanelOpen = false,
  openNotifPanel,
  closeNotifPanel,
  clearNotifications,
  notifThreshold = 4,
  setNotifThreshold,
  installPrompt = false,
  isInstalled = false,
  installApp,
}) {
  const [time, setTime] = useState('');
  const [ipInput, setIpInput] = useState(esp32Ip);
  const [showIpPanel, setShowIpPanel] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const ipPanelWrapperRef = useRef(null);
  const accountMenuRef = useRef(null);
  const { t, lang } = useI18n();

  const profileName = user ? getProfileName(user) : '';
  const profileEmail = user?.email || '';
  const profilePhoto = user ? getProfilePhoto(user) : '';
  const profileInitials = user ? getProfileInitials(user) : '';
  const providerLabel = user ? getProviderLabel(user) : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIpInput(esp32Ip);
    }, 0);
    return () => clearTimeout(timer);
  }, [esp32Ip]);

  // Clock — format sesuai bahasa
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (lang === 'en') {
        setTime(now.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZone: 'Asia/Jakarta', hour12: false,
        }) + ' WIB');
      } else {
        setTime(
          now.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'Asia/Jakarta',
          }).replace(/:/g, '.') + ' WIB'
        );
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  // Close account panel on outside click / Escape
  useEffect(() => {
    if (!accountOpen) return undefined;
    const onDown = (e) => { if (!accountMenuRef.current?.contains(e.target)) setAccountOpen(false); };
    const onKey  = (e) => { if (e.key === 'Escape') setAccountOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [accountOpen]);

  // Close IP panel on outside click / Escape
  useEffect(() => {
    if (!showIpPanel) return undefined;
    const onDown = (e) => { if (ipPanelWrapperRef.current && !ipPanelWrapperRef.current.contains(e.target)) setShowIpPanel(false); };
    const onKey  = (e) => { if (e.key === 'Escape') setShowIpPanel(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [showIpPanel]);

  // Cleanup siren on unmount
  useEffect(() => () => stopSiren(), []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConnect = () => {
    if (ipInput.trim()) { onConnect?.(ipInput.trim()); setShowIpPanel(false); }
  };
  const handleDisconnect = () => {
    onDisconnect?.(); setIpInput(''); setShowIpPanel(false);
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleConnect(); };

  const handleAlarm = () => {
    if (alarmActive) {
      stopSiren();
      setAlarmActive(false);
      notifyUser({ type: 'info', title: lang === 'en' ? 'Siren stopped' : 'Sirine dihentikan', message: lang === 'en' ? 'Test alarm stopped.' : 'Uji alarm web sudah berhenti.' });
      return;
    }
    playSiren(
      () => {
        setAlarmActive(true);
        notifyUser({ type: 'warning', title: `🚨 ${lang === 'en' ? 'Test alarm active' : 'Uji alarm aktif'}`, message: lang === 'en' ? 'Click the button again to stop the siren.' : 'Klik tombol lagi untuk menghentikan sirine.' });
      },
      (err) => {
        console.error('[Alarm] play failed:', err);
        notifyUser({
          type: 'error',
          title: lang === 'en' ? 'Siren cannot play' : 'Sirine tidak bisa diputar',
          message: lang === 'en'
            ? 'Open chrome://settings/content/sound → add this site → Allow. Then refresh.'
            : 'Buka chrome://settings/content/sound → tambahkan earthquake-detector.web.app → Allow. Lalu refresh halaman.',
          duration: 12000,
        });
      }
    );
  };

  const handleLogout = async () => { setAccountOpen(false); await onLogout?.(); };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <header className={`topbar${compact ? ' topbar--compact' : ''}${hidden ? ' topbar--hidden' : ''}`}>
      <button type="button" className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={24} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button type="button" className="desktop-menu-btn hide-mobile" onClick={toggleSidebar}
          title={sidebarCollapsed ? (lang === 'en' ? 'Open sidebar' : 'Buka sidebar') : (lang === 'en' ? 'Close sidebar' : 'Tutup sidebar')}>
          <Menu size={20} />
        </button>
        {compact ? (
          <div className="topbar-compact-label" title={pageLabel || 'Dashboard'}>{pageLabel || 'Dashboard'}</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="topbar-left">
              <h1>{t('appName')}</h1>
              <p>{t('appSubtitle')}</p>
            </div>
            <div className="clock" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{time}</div>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">

          {/* ESP32 IP Panel */}
          <div ref={ipPanelWrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            <div
              className={`action-btn status-pill ${connected ? 'active' : ''}`}
              title={connected ? `ESP32 ${t('online')} (${esp32Ip})` : `ESP32 ${t('offline')}`}
              onClick={() => { setAccountOpen(false); setShowIpPanel((v) => !v); }}
              style={{ cursor: 'pointer' }}
            >
              {connected ? <Wifi size={18} /> : <WifiOff size={18} />}
              <span>{connected ? t('online') : t('offline')}</span>
            </div>
            {showIpPanel && (
              <div className="ip-panel">
                <div className="ip-panel__input-row">
                  <input type="text" className="ip-panel__input" placeholder="IP ESP32"
                    value={ipInput} onChange={(e) => setIpInput(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <div className="ip-panel__buttons">
                  <button type="button" className="ip-panel__btn ip-panel__btn--connect" onClick={handleConnect}>
                    <Link size={14} /> Connect
                  </button>
                  {connected && (
                    <button type="button" className="ip-panel__btn ip-panel__btn--disconnect" onClick={handleDisconnect}>
                      <Unlink size={14} /> Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alert toggle */}
          <button type="button" className={`action-btn ${notificationsEnabled ? 'active' : ''}`}
            onClick={toggleNotifications}
            title={notificationsEnabled ? t('disableNotif') : t('enableNotif')}>
            <BellOff size={18} />
            <span>{notificationsEnabled ? t('alertOn') : t('alertOff')}</span>
          </button>

          {/* Notification panel */}
          <NotificationPanel
            notifications={notifications} unreadCount={unreadCount}
            panelOpen={notifPanelOpen} openPanel={openNotifPanel}
            closePanel={closeNotifPanel} clearAll={clearNotifications}
            notificationsEnabled={notificationsEnabled} toggleNotifications={toggleNotifications}
            notifThreshold={notifThreshold} setNotifThreshold={setNotifThreshold}
          />

          {/* PWA Install button */}
          {installPrompt && !isInstalled && (
            <button type="button" className="action-btn" onClick={installApp}
              title={lang === 'en' ? 'Install app to device' : 'Install app ke perangkat'}
              style={{ gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⬇</span>
              <span className="hide-mobile">{lang === 'en' ? 'Install' : 'Install'}</span>
            </button>
          )}

          {/* Language toggle */}
          <LanguageToggle />

          {/* Uji Alarm button */}
          <button type="button"
            className={`action-btn simulate-btn ${alarmActive ? 'alarm-active' : ''}`}
            onClick={handleAlarm}
            title={alarmActive ? t('stopAlarm') : t('testAlarm')}>
            {alarmActive ? <AlertTriangle size={18} /> : <FlaskConical size={18} />}
            <span>{alarmActive ? t('stopAlarm') : t('testAlarm')}</span>
          </button>

          {/* Theme toggle */}
          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Account menu */}
          {user ? (
            <div className="account-menu" ref={accountMenuRef}>
              <button type="button" className={`account-trigger ${accountOpen ? 'open' : ''}`}
                onClick={() => { setShowIpPanel(false); setAccountOpen((v) => !v); }}
                aria-expanded={accountOpen}>
                <span className={`account-avatar ${profilePhoto ? '' : 'account-avatar--generated'}`}
                  style={!profilePhoto ? { background: `linear-gradient(135deg, ${getAvatarColor(profileName)}, ${getAvatarColor(profileName + '1')})` } : {}}>
                  {profilePhoto
                    ? <Image src={profilePhoto} alt={profileName} width={32} height={32} unoptimized />
                    : <span>{profileInitials}</span>}
                </span>
                <span className="account-trigger__copy">
                  <strong>{profileName}</strong>
                  <small>{providerLabel}</small>
                </span>
                <ChevronDown size={16} className="account-trigger__chevron" />
              </button>

              {accountOpen && (
                <div className="account-panel account-panel--google">
                  <button type="button" className="close-btn" onClick={() => setAccountOpen(false)}><X size={18} /></button>
                  {profileEmail && <div className="email">{profileEmail}</div>}
                  <div className="avatar-wrapper" style={{ position: 'relative', display: 'inline-block', marginTop: '16px', marginBottom: '8px' }}>
                    <span className={`account-avatar account-avatar--xl ${profilePhoto ? '' : 'account-avatar--generated'}`}
                      style={{ width: '72px', height: '72px', fontSize: '32px' }}>
                      {profilePhoto
                        ? <Image src={profilePhoto} alt={profileName} width={72} height={72} unoptimized style={{ borderRadius: '50%' }} />
                        : <span>{profileInitials}</span>}
                    </span>
                    <button type="button" className="avatar-camera-btn" title="Change profile picture"
                      onClick={() => window.open('https://myaccount.google.com/profile', '_blank', 'noopener,noreferrer')}
                      style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', border: '1px solid #dadce0', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1a73e8', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="greeting" style={{ fontSize: '20px', fontWeight: '400', color: 'var(--text-primary)', marginBottom: '24px' }}>{t('hi')}, {profileName}!</div>
                  
                  <button type="button" className="manage-btn" onClick={() => window.open('https://myaccount.google.com/', '_blank', 'noopener,noreferrer')}>
                    {t('manageAccount')}
                  </button>
                  <div className="account-panel__divider" style={{ width: '100%', marginBottom: '16px', backgroundColor: '#5f6368' }} />
                  <div className="actions-container">
                    <button type="button" className="action-btn-half" onClick={() => window.open('https://accounts.google.com/AddSession', '_blank', 'noopener,noreferrer')}>
                      <span style={{ fontSize: '18px', fontWeight: '300' }}>+</span> {lang === 'en' ? 'Add account' : 'Tambah akun'}
                    </button>
                    <button type="button" className="action-btn-half" onClick={handleLogout}>
                      <LogOut size={16} /> {t('signOut')}
                    </button>
                  </div>
                  <div className="footer">
                    <span>Privacy Policy</span><span>•</span><span>Terms of Service</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </header>
  );
}
