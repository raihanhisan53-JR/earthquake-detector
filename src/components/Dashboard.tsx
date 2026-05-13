'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { MapPinned, Play, CloudSun, Wind, Cpu, History, Video } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useNotifications } from '@/hooks/useNotifications'
import { useBMKG } from '@/hooks/useBMKG'
import { useBMKGMap } from '@/hooks/useBMKGMap'
import { useESP32 } from '@/hooks/useESP32'

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

interface DashboardProps { user: User }

export default function Dashboard({ user }: DashboardProps) {
  const router  = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTabState] = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme]               = useState('dark')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [appNotices, setAppNotices]     = useState<any[]>([])
  const [mounted, setMounted]           = useState(false)
  const mainContentRef   = useRef<HTMLElement>(null)
  const noticeTimersRef  = useRef(new Map())

  // ══════════════════════════════════════════
  // ESP32 Hook — semua data sensor real-time
  // Ini yang sebelumnya TIDAK disambungkan!
  // ══════════════════════════════════════════
  const esp32 = useESP32()

  // Hydration fix: baca localStorage setelah mount
  useEffect(() => {
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

  const notifyUser = useCallback(({ type = 'info', title, message = '', duration = 4600 }: any) => {
    if (!title) return ''
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setAppNotices(current => [...current, { id, type, title, message }].slice(-4))
    const timeoutId = window.setTimeout(() => dismissNotice(id), duration)
    noticeTimersRef.current.set(id, timeoutId)
    return id
  }, [dismissNotice])

  // ── Auto-fetch BMKG & USGS untuk Supabase ──
  useBMKG()
  useBMKGMap()

  // ── Notifications — sekarang pakai data REAL dari esp32 ──
  const {
    notifications,
    unreadCount,
    panelOpen: notifPanelOpen,
    openPanel: openNotifPanel,
    closePanel: closeNotifPanel,
    clearAll: clearNotifications,
  } = useNotifications({
    esp32AlertLevel: esp32.alertLevel,   // ← data real
    esp32Connected:  esp32.connected,    // ← data real
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
    { id: 'peta',     icon: <MapPinned size={18} />, label: 'Peta Gempa',     desc: 'Peta command center' },
    { id: 'livecctv', icon: <Video size={18} />,     label: 'Pantau Live',    desc: 'Pemantauan real-time' },
    { id: 'edukasi',  icon: <Play size={18} />,      label: 'Edukasi',        desc: 'Video & materi gempa' },
    { id: 'cuaca',    icon: <CloudSun size={18} />,  label: 'Cuaca & Iklim',  desc: 'Visualisasi cuaca BMKG' },
    { id: 'udara',    icon: <Wind size={18} />,      label: 'Kualitas Udara', desc: 'Monitoring AQI' },
    { id: 'esp32',    icon: <Cpu size={18} />,       label: 'ESP32 Sensor',   desc: 'Kontrol sensor lokal' },
    { id: 'riwayat',  icon: <History size={18} />,   label: 'Riwayat',        desc: 'Log insiden gempa' },
  ]

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
      case 'udara':
        return <div className="tab-content"><WeatherCard /></div>
      case 'esp32':
        return (
          <div className="tab-content">
            <SeismographCard {...seismographProps} />
          </div>
        )
      case 'riwayat':
        return <div className="tab-content"><EventLogCard /></div>

      default: // overview
        return (
          <div className="tab-content">
            <div className="overview-header">
              <h2 className="overview-title">Ringkasan</h2>
              <p className="overview-desc">
                Ringkasan cepat: gempa terbaru dan status sensor. Peta lengkap, detail gempa, cuaca, dan video edukasi ada di tab masing-masing.
              </p>
              <div className="esp-status-badge">
                <div className={`status-dot ${esp32.connected ? 'online' : 'offline'}`} />
                <span>{esp32.connected ? `ESP32 Online · ${esp32.esp32Ip}` : 'ESP32 Offline'}</span>
              </div>
            </div>

            {/* Alarm banner saat ESP32 deteksi gempa */}
            {isEsp32Alert && (
              <div className="alarm-banner" role="alert" aria-live="assertive">
                <span className="alarm-banner__icon">🚨</span>
                <span className="alarm-banner__text">
                  ALARM AKTIF — Getaran Level {esp32.alertLevel} terdeteksi! Status: {esp32.status}
                </span>
                <button className="alarm-banner__stop" onClick={() => esp32.resetAlert()}>
                  ■ RESET
                </button>
              </div>
            )}

            <div className="overview-grid">
              <div className="grid-left"><EarthquakeCard /></div>
              <div className="grid-right">
                <SeismographCard {...seismographProps} />
              </div>
            </div>

            <div className="quick-access-section">
              <div className="quick-access-header">
                <h3>Akses cepat</h3>
                <span className="quick-access-tag">BUKA MODUL LENGKAP TANPA DUPLIKASI</span>
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
    overview: 'Ringkasan', gempa: 'Gempa Bumi Terkini', peta: 'Peta Gempa Indonesia',
    analitik: 'Analitik & Tren', livecctv: 'Pantau Live', edukasi: 'Edukasi',
    cuaca: 'Cuaca & Iklim', udara: 'Kualitas Udara', esp32: 'ESP32 Sensor', riwayat: 'Riwayat Kejadian',
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
        toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={() => setNotificationsEnabled(v => !v)}
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
        toggleSidebar={() => setSidebarCollapsed(v => !v)}
        notifyUser={notifyUser}
        notifications={notifications}
        unreadCount={unreadCount}
        notifPanelOpen={notifPanelOpen}
        openNotifPanel={openNotifPanel}
        closeNotifPanel={closeNotifPanel}
        clearNotifications={clearNotifications}
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
        />

        {/* Main Content */}
        <main className="main-content" ref={mainContentRef}>
          {renderContent()}
          <footer className="app-footer">
            © 2026 <strong>Raihan Hisan</strong> · TECTRA PRO Earthquake Detector
          </footer>
        </main>
      </div>
    </div>
  )
}
