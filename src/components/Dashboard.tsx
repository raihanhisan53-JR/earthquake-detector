'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Activity, Map, History, Play, Wind, Cpu, BarChart3, Video } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports untuk komponen berat
const EarthquakeCard = dynamic(() => import('./EarthquakeCard'), { ssr: false })
const AnalitikCard = dynamic(() => import('./AnalitikCard.jsx'), { ssr: false })
const EventLogCard = dynamic(() => import('./EventLogCard'), { ssr: false })

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
    { id: 'gempa', label: 'Gempa Terkini', icon: Activity },
    { id: 'peta', label: 'Peta Gempa', icon: Map },
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
              <p className="overview-desc">Ringkasan cepat: gempa terbaru dan status sensor.</p>
            </div>
            <div className="overview-grid">
              <div className="grid-left">
                <EarthquakeCard />
              </div>
              <div className="grid-right" style={{ background: 'var(--bg-card, rgba(17,24,39,0.8))', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #9ca3af)', minHeight: '300px' }}>
                <Cpu size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontWeight: '600' }}>ESP32 Sensor</p>
                <p style={{ fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>Hubungkan sensor ESP32 untuk monitoring seismik lokal</p>
              </div>
            </div>
          </div>
        )
      case 'gempa':
        return <div className="tab-content"><EarthquakeCard fullView /></div>
      case 'analitik':
        return <div className="tab-content"><AnalitikCard /></div>
      case 'riwayat':
        return <div className="tab-content"><EventLogCard /></div>
      default:
        return (
          <div className="tab-content">
            <div style={{ background: 'var(--bg-card, rgba(17,24,39,0.8))', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'var(--text-secondary, #9ca3af)' }}>
              <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>{tabs.find(t => t.id === activeTab)?.label}</p>
              <p style={{ fontSize: '13px' }}>Komponen ini sedang dalam pengembangan</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '16px 0',
        position: 'fixed', height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Earthquake Detector</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', borderRadius: '8px', border: 'none',
              background: activeTab === id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === id ? '#a78bfa' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: activeTab === id ? '600' : '400',
              cursor: 'pointer', textAlign: 'left', marginBottom: '2px', transition: 'all 0.15s',
            }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto} alt="Avatar" referrerPolicy="no-referrer" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{profileName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Google Account</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
          }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {tabs.find(t => t.id === activeTab)?.label || 'Ringkasan'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Sistem monitoring gempa bumi real-time — Data BMKG & Sensor ESP32
          </p>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
