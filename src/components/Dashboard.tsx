'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { MapPinned, Play, CloudSun, Cpu, History, Video, Bot, Globe2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useNotifications } from '@/hooks/useNotifications'
import { useBMKG } from '@/hooks/useBMKG'
import { useBMKGMap } from '@/hooks/useBMKGMap'
import { useESP32 } from '@/hooks/useESP32'
import { usePWA } from '@/hooks/usePWA'
import { I18nProvider, useI18n } from '@/hooks/useI18n'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LanguageToggle  = dynamic<any>(() => import('./LanguageToggle'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BMKGGoogleMap = dynamic<any>(() => import('./BMKGGoogleMap'), { ssr: false })

// Dynamic imports — semua komponen di-load client-side saja
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EarthquakeCard  = dynamic<any>(() => import('./EarthquakeCard'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnalitikCard    = dynamic<any>(() => import('./AnalitikCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EventLogCard    = dynamic<any>(() => import('./EventLogCard'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EarthquakeMapCard = dynamic<any>(() => import('./EarthquakeMapCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LiveCCTVCard    = dynamic<any>(() => import('./LiveCCTVCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReelsEducation  = dynamic<any>(() => import('./ReelsEducation.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WeatherCard     = dynamic<any>(() => import('./WeatherCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VisualisasiCard = dynamic<any>(() => import('./VisualisasiCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SeismographCard = dynamic<any>(() => import('./SeismographCard.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Topbar          = dynamic<any>(() => import('./Topbar.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Sidebar         = dynamic<any>(() => import('./Sidebar.jsx'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AriaChat        = dynamic<any>(() => import('./AriaChat'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NotificationPanel = dynamic<any>(() => import('./NotificationPanel'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProfilePage = dynamic<any>(() => import('./ProfilePage'), { ssr: false })

interface DashboardProps { user: User }

// Inner component — needs I18nProvider wrapper
function DashboardInner({ user }: DashboardProps) {
  const { t } = useI18n()
  const router  = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTabState] = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme]               = useState('dark')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appNotices, setAppNotices]     = useState<any[]>([])
  const [mounted, setMounted]           = useState(false)
  const mainContentRef   = useRef<HTMLElement>(null)
  const noticeTimersRef  = useRef(new Map())

  // ══════════════════════════════════════════
  // ESP32 Hook — semua data sensor real-time
  // Ini yang sebelumnya TIDAK disambungkan!
  // ══════════════════════════════════════════
  const esp32 = useESP32()
  const { gempa } = useBMKG()
  const bmkgMap   = useBMKGMap()
  const { installPrompt, isInstalled, installApp } = usePWA()

  // Hydration fix: baca localStorage setelah mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const savedTab       = localStorage.getItem('activeTab') || 'overview'
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    const savedTheme     = localStorage.getItem('theme') || 'dark'
    const savedNotif     = localStorage.getItem('notificationsEnabled')
    setActiveTabState(savedTab)
    setSidebarCollapsed(savedCollapsed)
    setTheme(savedTheme)
    if (savedNotif != null) setNotificationsEnabled(savedNotif === 'true')
  }, [])

  const handleSetActiveTab = (tab: string) => {
    setActiveTabState(tab)
    localStorage.setItem('activeTab', tab)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const dismissNotice = useCallback((id: string) => {
    const timer = noticeTimersRef.current.get(id)
    if (timer) { window.clearTimeout(timer); noticeTimersRef.current.delete(id) }
    setAppNotices(current => current.filter(n => n.id !== id))
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifyUser = useCallback(({ type = 'info', title, message = '', duration = 4600 }: any) => {
    if (!title) return ''
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setAppNotices(current => [...current, { id, type, title, message }].slice(-4))
    const timeoutId = window.setTimeout(() => dismissNotice(id), duration)
    noticeTimersRef.current.set(id, timeoutId)
    return id
  }, [dismissNotice])

  // ── Auto-fetch BMKG & USGS untuk Supabase (data juga dipakai di Globe & ARIA) ──

  // ── Notifications — sekarang pakai data REAL dari esp32 ──
  const {
    notifications,
    unreadCount,
    panelOpen: notifPanelOpen,
    openPanel: openNotifPanel,
    closePanel: closeNotifPanel,
    clearAll: clearNotifications,
    addNotification,
    notifThreshold,
    setNotifThreshold,
  } = useNotifications({
    esp32AlertLevel: esp32.alertLevel,
    esp32Connected:  esp32.connected,
    notificationsEnabled,
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0
  }, [activeTab])

  // ── Alarm banner global saat ESP32 deteksi gempa ──
  const isEsp32Alert = esp32.connected && esp32.alertLevel > 0

  // ── Notifikasi otomatis saat ada gempa baru dari BMKG/USGS ──
  // Pakai Set untuk track ID yang sudah dinotifikasi (session ini)
  const notifiedIdsRef = useRef<Set<string>>(new Set())
  const initialLoadDoneRef = useRef(false)

  useEffect(() => {
    if (!notificationsEnabled) return
    const pts = bmkgMap.points
    if (!pts || pts.length === 0) return

    // Saat pertama kali data masuk: load semua gempa yang ada (max 5 terbaru)
    // agar panel tidak kosong saat app baru dibuka
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true
      const recent = pts
        .filter(p => p.magnitude >= 4.0)
        .slice(0, 5) // ambil 5 terbaru
      recent.forEach(p => {
        if (notifiedIdsRef.current.has(p.id)) return
        notifiedIdsRef.current.add(p.id)
        addNotification({
          type: p.magnitude >= 5 ? 'error' : 'warning',
          title: `${p.source} M${p.magnitude.toFixed(1)} — ${p.wilayah}`,
          message: `Kedalaman ${p.kedalaman} · ${p.potensi}`,
          timestamp: p.epochMs ?? Date.now(),
          source: p.source,
          magnitude: p.magnitude,
        })
      })
      return
    }

    // Setelah initial load: hanya push gempa yang belum pernah dinotifikasi
    pts.forEach(p => {
      if (!p || p.magnitude < 4.0) return
      if (notifiedIdsRef.current.has(p.id)) return
      notifiedIdsRef.current.add(p.id)
      addNotification({
        type: p.magnitude >= 5 ? 'error' : 'warning',
        title: `${p.source} M${p.magnitude.toFixed(1)} — ${p.wilayah}`,
        message: `Kedalaman ${p.kedalaman} · ${p.potensi}`,
        timestamp: p.epochMs ?? Date.now(),
        source: p.source,
        magnitude: p.magnitude,
      })
    })
  }, [bmkgMap.points, notificationsEnabled, addNotification])

  // ── Auto-save ESP32 alert ke database ──
  const prevEsp32AlertRef = useRef(0)
  useEffect(() => {
    if (esp32.connected && esp32.alertLevel > 0 && prevEsp32AlertRef.current === 0) {
      const mag = esp32.pgaCms2 > 0 ? (Math.log10(esp32.pgaCms2) + 1.5).toFixed(1) : (esp32.alertLevel === 2 ? '5.5' : '4.0')
      fetch('/api/earthquakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          magnitude: parseFloat(mag), 
          location: 'Sensor Lokal (Alat ESP32)',
          source: 'ESP32',
          level: esp32.alertLevel === 2 ? 'BAHAYA' : 'WASPADA',
          detail: `Getaran lokal terdeteksi (PGA: ${esp32.pgaCms2} cm/s²)`
        })
      }).catch(console.error)
    }
    prevEsp32AlertRef.current = esp32.alertLevel
  }, [esp32.connected, esp32.alertLevel, esp32.pgaCms2])

  // ── Props seismograph — satu objek dipakai di dua tempat ──
  const seismographProps = {
    dataPoints:      esp32.dataPoints,
    status:          esp32.status,
    threshold:       esp32.threshold,
    updateThreshold: esp32.updateThreshold,
    calibrateSensor: esp32.calibrateSensor,
    isCalibrating:   esp32.isCalibrating,
    triggerSimulation: esp32.triggerSimulation,
    resetAlert:      esp32.resetAlert,
    alertLevel:      esp32.alertLevel,
    connected:       esp32.connected,
    sensorReady:     esp32.sensorReady,
    currentModeLabel: esp32.currentModeLabel,
    changeMode:      esp32.changeMode,
    isChangingMode:  esp32.isChangingMode,
    connectionIssue: esp32.connectionIssue,
    notifyUser,
    pgaCms2:         esp32.pgaCms2,
    pgaPeakCms2:     esp32.pgaPeakCms2,
  }

  const quickAccessItems = [
    { id: 'peta',     icon: <MapPinned size={18} />, label: t('map'),        desc: t('mapTitle') },
    { id: 'globe',    icon: <Globe2 size={18} />,    label: t('googleMaps'), desc: 'Google Maps BMKG' },
    { id: 'livecctv', icon: <Video size={18} />,     label: t('liveCctv'),   desc: t('liveCctv') },
    { id: 'edukasi',  icon: <Play size={18} />,      label: t('education'),  desc: t('education') },
    { id: 'cuaca',    icon: <CloudSun size={18} />,  label: t('weather'),    desc: t('weather') },
    { id: 'esp32',    icon: <Cpu size={18} />,       label: t('esp32'),      desc: t('esp32') },
    { id: 'riwayat',  icon: <History size={18} />,   label: t('history'),    desc: t('history') },
    { id: 'aria',     icon: <Bot size={18} />,       label: t('aria'),       desc: t('aria') },
  ]

  // Build latestEarthquake object for ARIA from real BMKG data
  const latestEarthquakeForAria = gempa ? {
    magnitude: parseFloat(gempa.Magnitude),
    location: gempa.Wilayah?.replace(/^pusat gempa berada /i, '') || '-',
    time: `${gempa.Tanggal} ${gempa.Jam}`,
    depth: gempa.Kedalaman,
    potensi: gempa.Potensi,
  } : null

  const renderContent = () => {
    switch (activeTab) {
      case 'gempa':
        return <div className="tab-content"><EarthquakeCard fullView /></div>
      case 'peta':
        return (
          <div className="tab-content">
            <EarthquakeMapCard notificationsEnabled={notificationsEnabled} notifyUser={notifyUser} />
          </div>
        )
      case 'globe':
        return (
          <div className="tab-content" style={{ padding: 0 }}>
            <BMKGGoogleMap />
          </div>
        )
      case 'analitik':
        return <div className="tab-content"><AnalitikCard /></div>
      case 'livecctv':
        return <div className="tab-content"><LiveCCTVCard /></div>
      case 'edukasi':
        return (
          <div className="tab-content" style={{ display: 'flex', justifyContent: 'center' }}>
            <ReelsEducation />
          </div>
        )
      case 'cuaca':
        return <div className="tab-content"><VisualisasiCard /><WeatherCard /></div>
      case 'esp32':
        return (
          <div className="tab-content">
            <SeismographCard {...seismographProps} />
          </div>
        )
      case 'riwayat':
        return <div className="tab-content"><EventLogCard /></div>
      case 'profil':
        return (
          <div className="tab-content">
            <ProfilePage
              user={user}
              onBack={() => handleSetActiveTab('overview')}
              onLogout={handleLogout}
            />
          </div>
        )
      case 'aria':
        return (
          <div style={{ 
            height: 'calc(100vh - 72px)', 
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <AriaChat
              latestEarthquake={latestEarthquakeForAria}
              esp32Connected={esp32.connected}
              esp32Status={esp32.status}
              esp32AlertLevel={esp32.alertLevel}
            />
          </div>
        )

      default: // overview
        return (
          <div className="tab-content">
            <div className="overview-header">
              <h2 className="overview-title">{t('summary')}</h2>
              <p className="overview-desc">{t('summaryDesc')}</p>
              <div className="esp-status-badge">
                <div className={`status-dot ${esp32.connected ? 'online' : 'offline'}`} />
                <span>{esp32.connected ? `${t('esp32Online')} · ${esp32.esp32Ip}` : t('esp32Offline')}</span>
              </div>
            </div>

            {isEsp32Alert && (
              <div className="alarm-banner" role="alert" aria-live="assertive">
                <span className="alarm-banner__icon">🚨</span>
                <span className="alarm-banner__text">
                  ALARM — {t('esp32')} Level {esp32.alertLevel} · {esp32.status}
                </span>
                <button className="alarm-banner__stop" onClick={() => esp32.resetAlert()}>■ RESET</button>
              </div>
            )}

            <div className="overview-grid">
              <div className="grid-left"><EarthquakeCard /></div>
              <div className="grid-right"><SeismographCard {...seismographProps} /></div>
            </div>

            <div className="quick-access-section">
              <div className="quick-access-header">
                <h3>{t('quickAccess')}</h3>
                <span className="quick-access-tag">{t('quickAccessTag')}</span>
              </div>
              <div className="quick-access-grid">
                {quickAccessItems.map(item => (
                  <button key={item.id} type="button" className="quick-access-card" onClick={() => handleSetActiveTab(item.id)}>
                    <div className="quick-access-icon">{item.icon}</div>
                    <div className="quick-access-info">
                      <span className="quick-access-label">{item.label}</span>
                      <span className="quick-access-desc">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  const tabLabelMap: Record<string, string> = {
    overview:  t('overview'),
    gempa:     t('earthquake'),
    peta:      t('map'),
    globe:     t('googleMaps'),
    analitik:  t('analytics'),
    livecctv:  t('liveCctv'),
    edukasi:   t('education'),
    cuaca:     t('weather'),
    esp32:     t('esp32'),
    riwayat:   t('history'),
    aria:      t('aria'),
    profil:    t('profile'),
  }

  const isCompact = activeTab !== 'overview'

  if (!mounted) return null

  return (
    <div className="dashboard-layout">
      {/* Toast Notices */}
      {appNotices.length > 0 && (
        <div className="app-notice-stack" aria-live="polite">
          {appNotices.map(notice => (
            <div key={notice.id} className={`app-notice app-notice--${notice.type}`}>
              <div className="app-notice__copy">
                <strong>{notice.title}</strong>
                {notice.message && <span>{notice.message}</span>}
              </div>
              <button type="button" className="app-notice__close" onClick={() => dismissNotice(notice.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Topbar — sekarang semua prop ESP32 terhubung */}
      <Topbar
        theme={theme}
        toggleTheme={() => setTheme((th: string) => th === 'dark' ? 'light' : 'dark')}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={() => setNotificationsEnabled((v: boolean) => !v)}
        connected={esp32.connected}
        compact={isCompact}
        pageLabel={tabLabelMap[activeTab] || ''}
        user={user}
        onLogout={handleLogout}
        esp32Ip={esp32.esp32Ip}
        onConnect={esp32.connectToESP32}
        onDisconnect={esp32.disconnectESP32}
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed((v: boolean) => !v)}
        notifyUser={notifyUser}
        notifications={notifications}
        unreadCount={unreadCount}
        notifPanelOpen={notifPanelOpen}
        openNotifPanel={openNotifPanel}
        closeNotifPanel={closeNotifPanel}
        clearNotifications={clearNotifications}
        notifThreshold={notifThreshold}
        setNotifThreshold={setNotifThreshold}
        installPrompt={installPrompt}
        isInstalled={isInstalled}
        installApp={installApp}
      />

      <div className="dashboard-body">
        {/* Sidebar — status ESP32 real */}
        <Sidebar
          connected={esp32.connected}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          toggleCollapsed={() => setSidebarCollapsed(v => !v)}
          user={user}
        />

        {/* Main Content */}
        <main className="main-content" ref={mainContentRef}>
          {renderContent()}
          <footer className="app-footer">
            {t('footer')}
          </footer>
        </main>
      </div>
    </div>
  )
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <I18nProvider>
      <DashboardInner user={user} />
    </I18nProvider>
  )
}
