'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Activity, Map, History, Play, Wind, Cpu, BarChart3, Video } from 'lucide-react'

interface DashboardProps {
  user: User
}

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Earthquake Detector
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: activeTab === id ? '#a78bfa' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: activeTab === id ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '2px',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{profileName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Google Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Sign out
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

          {/* Content placeholder - akan diisi dengan komponen */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Tab: {activeTab}</p>
            <p style={{ fontSize: '13px' }}>Komponen sedang dimigrasikan dari Firebase ke Supabase + Prisma</p>
          </div>
        </div>
      </main>
    </div>
  )
}
