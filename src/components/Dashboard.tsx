'use client'

import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { MapPinned, Cpu, History, Globe2, Activity, Clock, Radio, Database, AlertTriangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useNotifications } from '@/hooks/useNotifications'
import { useBMKG } from '@/hooks/useBMKG'
import { useBMKGMap } from '@/hooks/useBMKGMap'
import { useESP32 } from '@/hooks/useESP32'
import { usePWA } from '@/hooks/usePWA'
import { I18nProvider, useI18n } from '@/hooks/useI18n'
const BMKGGoogleMap = dynamic(() => import('./BMKGGoogleMap'), { ssr: false })

// Dynamic imports — semua komponen di-load client-side saja
const EarthquakeCard  = dynamic(() => import('./EarthquakeCard'), { ssr: false })
const AnalitikCard    = dynamic(() => import('./AnalitikCard.jsx'), { ssr: false })
const EventLogCard    = dynamic(() => import('./EventLogCard'), { ssr: false })
const EarthquakeMapCard = dynamic(() => import('./EarthquakeMapCard.jsx'), { ssr: false })
const LiveCCTVCard    = dynamic(() => import('./LiveCCTVCard.jsx'), { ssr: false })
const ReelsEducation  = dynamic(() => import('./ReelsEducation.jsx'), { ssr: false })
const WeatherCard     = dynamic(() => import('./WeatherCard.jsx'), { ssr: false })
const VisualisasiCard = dynamic(() => import('./VisualisasiCard.jsx'), { ssr: false })
const SeismographCard = dynamic(() => import('./SeismographCard.jsx'), { ssr: false })
const Topbar          = dynamic(() => import('./Topbar.jsx'), { ssr: false })
const Sidebar         = dynamic(() => import('./Sidebar.jsx'), { ssr: false })
const AriaChat        = dynamic(() => import('./AriaChat'), { ssr: false })
const ProfilePage = dynamic(() => import('./ProfilePage'), { ssr: false })


interface DashboardProps { user: User }
interface AppNotice {
  id: string
  type: 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp?: number
  source?: string
  magnitude?: number
}
interface NotifyPayload {
  type?: 'info' | 'warning' | 'error'
  title?: string
  message?: string
  duration?: number
}

// Inner component — needs I18nProvider wrapper
function DashboardInner({ user }: DashboardProps) {
  const { t } = useI18n()
  const router  = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTabState] = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme]               = useState('dark')
  const [userPlan, setUserPlan]         = useState('Starter')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [appNotices, setAppNotices]     = useState<AppNotice[]>([])
  const [mounted, setMounted]           = useState(false)
  const [now, setNow]                   = useState(0)
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
    const savedPlan      = localStorage.getItem('userPlan') || 'Starter'
    setActiveTabState(savedTab)
    setSidebarCollapsed(savedCollapsed)
    setTheme(savedTheme)
    setUserPlan(savedPlan)
    if (savedNotif != null) setNotificationsEnabled(savedNotif === 'true')
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
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

  const notifyUser = useCallback(({ type = 'info', title, message = '', duration = 4600 }: NotifyPayload) => {
    if (!title) return ''
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setAppNotices(current => [...current, { id, type, title, message, timestamp: Date.now() }].slice(-4))
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

  // ── Auto-save ESP32 alert ke database (earthquake_logs & sensor_readings) ──
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

      // Simpan juga ke sensor_readings
      fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgaCms2: esp32.pgaCms2,
          pgaPeak: esp32.pgaPeakCms2,
          alertLevel: esp32.alertLevel,
          status: esp32.status,
          sensorIp: esp32.esp32Ip,
        }),
      }).catch(console.error)
    }
    prevEsp32AlertRef.current = esp32.alertLevel
  }, [esp32.connected, esp32.alertLevel, esp32.pgaCms2, esp32.pgaPeakCms2, esp32.status, esp32.esp32Ip])

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
    { id: 'peta',     icon: <MapPinned size={18} />, label: t('map'),        desc: 'Peta gempa interaktif' },
    { id: 'globe',    icon: <Globe2 size={18} />,    label: t('googleMaps'), desc: 'Google Maps BMKG live' },
    { id: 'esp32',    icon: <Cpu size={18} />,       label: t('esp32'),      desc: t('esp32') },
    { id: 'aria',     icon: <Bot size={18} />,       label: 'ARIA AI',       desc: 'Asisten AI Cerdas' },
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
          <div className="tab-content" style={{ padding: 0 }}>
            <EarthquakeMapCard notificationsEnabled={notificationsEnabled} notifyUser={notifyUser} />
          </div>
        )
      case 'globe':
        return (
          <div className="tab-content" style={{ padding: 0, height: 'calc(100vh - 72px)' }}>
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
              userPlan={userPlan}
              latestEarthquake={latestEarthquakeForAria}
              esp32Connected={esp32.connected}
              esp32Status={esp32.status}
              esp32AlertLevel={esp32.alertLevel}
            />
          </div>
        )


      default: // overview
        const pts = bmkgMap.points || []
        const todayPoints = pts.filter(p => p.epochMs && (now - p.epochMs) < 86400000)
        const maxMagToday = todayPoints.length > 0 ? Math.max(...todayPoints.map(p => p.magnitude)) : 0
        const lastUpdate = gempa ? `${gempa.Tanggal} ${gempa.Jam}` : null
        const loadingBMKG = bmkgMap.points === null && !bmkgMap.error

        return (
          <div className="tab-content">
            {/* ── OVERVIEW HEADER ── */}
            <div className="overview-header">
              <div className="overview-header-left">
                <h2 className="overview-title">{t('summary')}</h2>
                <p className="overview-desc">{t('summaryDesc')}</p>
              </div>
              <div className="esp-status-badge">
                <div className={`status-dot ${esp32.connected ? 'online' : 'offline'}`} />
                <span>{esp32.connected ? `${t('esp32Online')} · ${esp32.esp32Ip}` : t('esp32Offline')}</span>
              </div>
            </div>

            {/* ── KPI STAT CARDS ── */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                  <Activity size={20} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">{t('totalEarthquakes')}</span>
                  <span className="kpi-value">
                    {loadingBMKG ? <span className="kpi-loading" /> : todayPoints.length}
                  </span>
                  <span className="kpi-sub">{t('lastDay')}</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                  <Radio size={20} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">{t('maxMagnitude')}</span>
                  <span className="kpi-value" style={{ color: maxMagToday >= 5 ? '#ef4444' : maxMagToday >= 4 ? '#f59e0b' : '#22c55e' }}>
                    {loadingBMKG ? <span className="kpi-loading" /> : maxMagToday > 0 ? `M${maxMagToday.toFixed(1)}` : '-'}
                  </span>
                  <span className="kpi-sub">{t('today')}</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: esp32.connected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: esp32.connected ? '#10b981' : '#ef4444' }}>
                  <Cpu size={20} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">{t('sensorStatus')}</span>
                  <span className="kpi-value" style={{ color: esp32.connected ? '#10b981' : '#ef4444' }}>
                    {esp32.connected ? t('online') : t('offline')}
                  </span>
                  <span className="kpi-sub">ESP32 · {esp32.connected ? esp32.esp32Ip : '-'}</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                  <Clock size={20} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">{t('dataFreshness')}</span>
                  <span className="kpi-value" style={{ fontSize: '15px' }}>
                    {lastUpdate || (loadingBMKG ? <span className="kpi-loading" /> : '-')}
                  </span>
                  <span className="kpi-sub">BMKG</span>
                </div>
              </div>
            </div>

            {/* ── ALARM BANNER ── */}
            {isEsp32Alert && (
              <div className="alarm-banner" role="alert" aria-live="assertive">
                <AlertTriangle size={22} className="alarm-banner__icon" />
                <span className="alarm-banner__text">
                  ALARM — {t('esp32')} Level {esp32.alertLevel} · {esp32.status}
                </span>
                <button className="alarm-banner__stop" onClick={() => esp32.resetAlert()}>■ RESET</button>
              </div>
            )}

            {/* ── SYSTEM HEALTH ── */}
            <div className="health-grid">
              <div className="health-card">
                <Database size={14} />
                <span className="health-label">BMKG</span>
                <span className={`health-dot ${bmkgMap.error ? 'offline' : 'online'}`} />
                <span className="health-status">{bmkgMap.error ? t('offline') : t('online')}</span>
              </div>
              <div className="health-card">
                <Database size={14} />
                <span className="health-label">USGS</span>
                <span className="health-dot online" />
                <span className="health-status">{t('online')}</span>
              </div>
              <div className="health-card">
                <Database size={14} />
                <span className="health-label">ESP32</span>
                <span className={`health-dot ${esp32.connected ? 'online' : 'offline'}`} />
                <span className="health-status">{esp32.connected ? t('online') : t('offline')}</span>
              </div>
              <div className="health-card">
                <Database size={14} />
                <span className="health-label">Database</span>
                <span className="health-dot online" />
                <span className="health-status">{t('online')}</span>
              </div>
            </div>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="overview-grid">
              <div className="grid-left"><EarthquakeCard /></div>
              <div className="grid-right"><SeismographCard {...seismographProps} /></div>
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <div className="recent-activity-section">
              <div className="recent-activity-header">
                <h3>{t('recentActivity')}</h3>
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleSetActiveTab('riwayat')}>
                  {t('viewAll')}
                </button>
              </div>
              {loadingBMKG ? (
                <div className="recent-activity-loading">
                  {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
                </div>
              ) : todayPoints.length > 0 ? (
                <div className="recent-activity-list">
                  {todayPoints.slice(0, 6).map((p, idx) => (
                    <div key={p.id || idx} className="recent-activity-item">
                      <div className="recent-activity-mag" style={{
                        background: p.magnitude >= 5 ? 'rgba(239,68,68,0.15)' : p.magnitude >= 4 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                        color: p.magnitude >= 5 ? '#ef4444' : p.magnitude >= 4 ? '#f59e0b' : '#22c55e',
                      }}>
                        M{p.magnitude.toFixed(1)}
                      </div>
                      <div className="recent-activity-info">
                        <span className="recent-activity-location">{p.wilayah || p.lokasi || '-'}</span>
                        <span className="recent-activity-time">
                          {p.kedalaman || ''} · {p.tanggal || p.date ? `${p.tanggal || p.date}` : ''} {p.jam || p.time || ''}
                        </span>
                      </div>
                      <span className="recent-activity-source">{p.source || 'BMKG'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="recent-activity-empty">
                  <Activity size={24} />
                  <p>{t('recentActivityEmpty')}</p>
                </div>
              )}
            </div>

            {/* ── QUICK ACCESS ── */}
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
    globe:     'Google Maps BMKG',
    analitik:  t('analytics'),
    livecctv:  t('liveCctv'),
    edukasi:   t('education'),
    cuaca:     t('weather'),
    esp32:     t('esp32'),
    riwayat:   t('history'),
    evakuasi:  'Evakuasi',
    timetravel: 'History 3D',
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
          user={user}
        />

        {/* Main Content */}
        <main className="main-content" ref={mainContentRef}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
          <footer className="app-footer">
            <div className="app-footer-inner">
              <div className="app-footer-brand">
                <Image src="/logo-v2.png" alt="logo" width={28} height={28} className="app-footer-logo" />
                <span>{t('footer')}</span>
              </div>
              <div className="app-footer-links">
                <a href="https://www.bmkg.go.id" target="_blank" rel="noreferrer">BMKG</a>
                <a href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS</a>
                <a href="https://github.com/raihanhisan" target="_blank" rel="noreferrer">GitHub</a>
                <span className="app-footer-version">v2.0.0</span>
              </div>
            </div>
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
