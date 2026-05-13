'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { MapPinned, Play, CloudSun, Wind, Cpu, History, Video, Globe } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports
const EarthquakeCard = dynamic(() => import('./EarthquakeCard'), { ssr: false })
const AnalitikCard = dynamic(() => import('./AnalitikCard.jsx'), { ssr: false })
const EventLogCard = dynamic(() => import('./EventLogCard'), { ssr: false })
const EarthquakeMapCard = dynamic(() => import('./EarthquakeMapCard.jsx'), { ssr: false })
const LiveCCTVCard = dynamic(() => import('./LiveCCTVCard.jsx'), { ssr: false })
const ReelsEducation = dynamic(() => import('./ReelsEducation.jsx'), { ssr: false })
const WeatherCard = dynamic(() => import('./WeatherCard.jsx'), { ssr: false })
const VisualisasiCard = dynamic(() => import('./VisualisasiCard.jsx'), { ssr: false })
const SeismographCard = dynamic(() => import('./SeismographCard.jsx'), { ssr: false })
const Topbar = dynamic(() => import('./Topbar.jsx'), { ssr: false })
const Sidebar = dynamic(() => import('./Sidebar.jsx'), { ssr: false })

interface DashboardProps { user: User }

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('activeTab') || 'overview'
    return 'overview'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [appNotices, setAppNotices] = useState<any[]>([])
  const [alarmActive, setAlarmActive] = useState(false)
  const mainContentRef = useRef<HTMLElement>(null)
  const noticeTimersRef = useRef(new Map())

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') localStorage.setItem('activeTab', tab)
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0
  }, [activeTab])

  const quickAccessItems = [
    { id: 'peta', icon: <MapPinned size={18} />, label: 'Peta Gempa', desc: 'Peta command center' },
    { id: 'livecctv', icon: <Video size={18} />, label: 'Pantau Live', desc: 'Pemantauan real-time' },
    { id: 'edukasi', icon: <Play size={18} />, label: 'Edukasi', desc: 'Video & materi gempa' },
    { id: 'cuaca', icon: <CloudSun size={18} />, label: 'Cuaca & Iklim', desc: 'Visualisasi cuaca BMKG' },
    { id: 'udara', icon: <Wind size={18} />, label: 'Kualitas Udara', desc: 'Monitoring AQI' },
    { id: 'esp32', icon: <Cpu size={18} />, label: 'ESP32 Sensor', desc: 'Kontrol sensor lokal' },
    { id: 'riwayat', icon: <History size={18} />, label: 'Riwayat', desc: 'Log insiden gempa' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'gempa':
        return <div className="tab-content"><EarthquakeCard fullView /></div>
      case 'peta':
        return <div className="tab-content"><EarthquakeMapCard notificationsEnabled={notificationsEnabled} notifyUser={notifyUser} /></div>
      case 'analitik':
        return <div className="tab-content"><AnalitikCard /></div>
      case 'livecctv':
        return <div className="tab-content"><LiveCCTVCard /></div>
      case 'edukasi':
        return <div className="tab-content" style={{ display: 'flex', justifyContent: 'center' }}><ReelsEducation /></div>
      case 'cuaca':
        return <div className="tab-content"><VisualisasiCard /><WeatherCard /></div>
      case 'udara':
        return <div className="tab-content"><WeatherCard /></div>
      case 'esp32':
        return (
          <div className="tab-content">
            <SeismographCard
              dataPoints={[]} status="AMAN" threshold={2.5}
              updateThreshold={() => {}} calibrateSensor={() => {}} isCalibrating={false}
              triggerSimulation={() => {}} resetAlert={() => {}} alertLevel={0}
              connected={false} sensorReady={false} currentModeLabel="Simulator"
              changeMode={() => {}} isChangingMode={false} connectionIssue={false}
              notifyUser={notifyUser} pgaCms2={0} pgaPeakCms2={0}
            />
          </div>
        )
      case 'riwayat':
        return <div className="tab-content"><EventLogCard /></div>
      default: // overview
        return (
          <div className="tab-content">
            <div className="overview-header">
              <h2 className="overview-title">Ringkasan</h2>
              <p className="overview-desc">Ringkasan cepat: gempa terbaru dan status sensor. Peta lengkap, detail gempa, cuaca, dan video edukasi ada di tab masing-masing.</p>
              <div className="esp-status-badge">
                <div className="status-dot offline"></div>
                <span>ESP32 Offline</span>
              </div>
            </div>
            <div className="overview-grid">
              <div className="grid-left"><EarthquakeCard /></div>
              <div className="grid-right">
                <SeismographCard
                  dataPoints={[]} status="AMAN" threshold={2.5}
                  updateThreshold={() => {}} calibrateSensor={() => {}} isCalibrating={false}
                  triggerSimulation={() => {}} resetAlert={() => {}} alertLevel={0}
                  connected={false} sensorReady={false} currentModeLabel="Simulator"
                  changeMode={() => {}} isChangingMode={false} connectionIssue={false}
                  notifyUser={notifyUser} pgaCms2={0} pgaPeakCms2={0}
                />
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

      {/* Topbar */}
      <Topbar
        theme={theme}
        toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={() => setNotificationsEnabled(v => !v)}
        connected={false}
        compact={isCompact}
        pageLabel={tabLabelMap[activeTab] || ''}
        user={user}
        onLogout={handleLogout}
        esp32Ip=""
        onConnect={() => {}}
        onDisconnect={() => {}}
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(v => !v)}
        notifyUser={notifyUser}
        notifications={[]}
        unreadCount={0}
        notifPanelOpen={false}
        openNotifPanel={() => {}}
        closeNotifPanel={() => {}}
        clearNotifications={() => {}}
      />

      <div className="dashboard-body">
        {/* Sidebar */}
        <Sidebar
          connected={false}
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
            © 2026 <strong>Raihan Hisan</strong> · Earthquake Detector
          </footer>
        </main>
      </div>
    </div>
  )
}
