'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Activity, Map, History, Play, Wind, Cpu, BarChart3, Video } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports - semua komponen di-load client-side
const EarthquakeCard = dynamic(() => import('./EarthquakeCard'), { ssr: false })
const AnalitikCard = dynamic(() => import('./AnalitikCard.jsx'), { ssr: false })
const EventLogCard = dynamic(() => import('./EventLogCard'), { ssr: false })
const EarthquakeMapCard = dynamic(() => import('./EarthquakeMapCard.jsx'), { ssr: false })
const LiveCCTVCard = dynamic(() => import('./LiveCCTVCard.jsx'), { ssr: false })
const ReelsEducation = dynamic(() => import('./ReelsEducation.jsx'), { ssr: false })
const WeatherCard = dynamic(() => import('./WeatherCard.jsx'), { ssr: false })
const VisualisasiCard = dynamic(() => import('./VisualisasiCard.jsx'), { ssr: false })
const SeismographCard = dynamic(() => import('./SeismographCard.jsx'), { ssr: false })

interface DashboardProps { user: User }

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const profileName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const profilePhoto = user.user_metadata?.avatar_url || ''

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: Activity },
    { id: 'gempa', label: 'Gempa Bumi Terkini', icon: Activity },
    { id: 'peta', label: 'Peta Gempa Indonesia', icon: Map },
    { id: 'analitik', label: 'Analitik & Tren', icon: BarChart3 },
    { id: 'livecctv', label: 'Pantau Live', icon: Video },
    { id: 'edukasi', label: 'Edukasi Bencana', icon: Play },
    { id: 'cuaca', label: 'Cuaca & Iklim', icon: Wind },
    { id: 'esp32', label: 'ESP32 Sensor', icon: Cpu },
    { id: 'riwayat', label: 'Riwayat', icon: History },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="overview-header">
              <h2 className="overview-title">Ringkasan</h2>
              <p className="overview-desc">Ringkasan cepat: gempa terbaru dan status sensor. Peta lengkap, detail gempa, cuaca, dan video edukasi ada di tab masing-masing.</p>
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
                  notifyUser={() => {}} pgaCms2={0} pgaPeakCms2={0}
                />
              </div>
            </div>
          </div>
        )
      case 'gempa':
        return <div className="tab-content"><EarthquakeCard fullView /></div>
      case 'peta':
        return <div className="tab-content"><EarthquakeMapCard notificationsEnabled={true} notifyUser={() => {}} /></div>
      case 'analitik':
        return <div className="tab-content"><AnalitikCard /></div>
      case 'livecctv':
        return <div className="tab-content"><LiveCCTVCard /></div>
      case 'edukasi':
        return <div className="tab-content" style={{ display: 'flex', justifyContent: 'center' }}><ReelsEducation /></div>
      case 'cuaca':
        return <div className="tab-content"><VisualisasiCard /><WeatherCard /></div>
      case 'esp32':
        return (
          <div className="tab-content">
            <SeismographCard
              dataPoints={[]} status="AMAN" threshold={2.5}
              updateThreshold={() => {}} calibrateSensor={() => {}} isCalibrating={false}
              triggerSimulation={() => {}} resetAlert={() => {}} alertLevel={0}
              connected={false} sensorReady={false} currentModeLabel="Simulator"
              changeMode={() => {}} isChangingMode={false} connectionIssue={false}
              notifyUser={() => {}} pgaCms2={0} pgaPeakCms2={0}
            />
          </div>
        )
      case 'riwayat':
        return <div className="tab-content"><EventLogCard /></div>
      default:
        return <div className="tab-content"><EarthquakeCard /></div>
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main, #0d1520)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: 'var(--bg-sidebar, #0f1e2e)',
        borderRight: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        display: 'flex', flexDirection: 'column', padding: '16px 0',
        position: 'fixed', height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color, #f9fafb)' }}>Earthquake Detector</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', borderRadius: '8px', border: 'none',
              background: activeTab === id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === id ? '#a78bfa' : 'var(--text-muted, #9ca3af)',
              fontSize: '13px', fontWeight: activeTab === id ? '600' : '400',
              cursor: 'pointer', textAlign: 'left', marginBottom: '2px', transition: 'all 0.15s',
            }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto} alt="Avatar" referrerPolicy="no-referrer"
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color, #f9fafb)' }}>{profileName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #9ca3af)' }}>Google Account</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '8px 12px', borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            background: 'transparent', color: 'var(--text-muted, #9ca3af)', fontSize: '13px', cursor: 'pointer',
          }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '24px', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  )
}
