'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, ShieldAlert, Cpu, Map, ChevronRight, BarChart3, AlertTriangle, Clock, Waves, Navigation } from 'lucide-react'

// Interface untuk data BMKG
interface AutoGempa {
  Tanggal: string
  Jam: string
  Magnitude: string
  Kedalaman: string
  Coordinates: string
  Lintang: string
  Bujur: string
  Wilayah: string
  Potensi: string
  Dirasakan: string
  Shakemap: string
}

export default function LandingPage() {
  const [latestQuake, setLatestQuake] = useState<AutoGempa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBMKG = async () => {
      try {
        const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')
        const data = await response.json()
        setLatestQuake(data.Infogempa.gempa)
      } catch (error) {
        console.error('Gagal mengambil data BMKG:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBMKG()
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <header style={{ 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-sidebar)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-v2.png" alt="Earthquake Detector Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>Earthquake Detector</span>
        </div>
        <div>
          <Link href="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: '600' }}>
            Masuk / Login <ChevronRight size={18} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ 
        padding: '80px 20px', 
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ 
          display: 'inline-block',
          backgroundColor: 'rgba(109, 40, 217, 0.1)',
          color: 'var(--accent)',
          padding: '6px 16px',
          borderRadius: '50px',
          border: '1px solid rgba(109, 40, 217, 0.3)',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Sistem Deteksi Gempa BMKG & ESP32
        </div>
        
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.2' }}>
          Monitor Aktivitas Seismik Secara <span style={{ color: 'var(--accent)' }}>Real-Time</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '700px' }}>
          Tectra Pro mengintegrasikan data resmi BMKG, USGS, dan sensor hardware ESP32 ke dalam satu Command Center profesional. Dapatkan notifikasi kilat sebelum bahaya datang.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '50px' }}>
            Buka Dashboard
          </Link>
          <a href="#live-data" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '50px' }}>
            Lihat Data Live
          </a>
        </div>
      </section>

      {/* LIVE DATA SECTION (Fungsionalitas Nyata di Landing Page) */}
      <section id="live-data" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
          <span style={{ 
            display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'var(--danger)', borderRadius: '50%', 
            boxShadow: '0 0 10px var(--danger)'
          }}></span>
          <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Live: Gempa Terkini</h2>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Activity size={32} style={{ margin: '0 auto 16px', color: 'var(--accent)', animation: 'pulse 2s infinite' }} />
              Memuat data langsung dari BMKG...
            </div>
          ) : latestQuake ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                backgroundColor: parseFloat(latestQuake.Magnitude) >= 5.0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(109, 40, 217, 0.1)',
                borderBottom: '1px solid var(--border-color)',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}>
                <div style={{ 
                  backgroundColor: parseFloat(latestQuake.Magnitude) >= 5.0 ? 'var(--danger)' : 'var(--accent)',
                  color: '#fff',
                  width: '80px', height: '80px',
                  borderRadius: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>MAG</span>
                  <span style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1 }}>{latestQuake.Magnitude}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{latestQuake.Wilayah}</h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {latestQuake.Tanggal} | {latestQuake.Jam}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Waves size={16} /> Kedalaman: {latestQuake.Kedalaman}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: 'var(--bg-sidebar)' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Koordinat</p>
                  <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Navigation size={16} color="var(--accent)"/> {latestQuake.Coordinates}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Potensi Tsunami</p>
                  <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: latestQuake.Potensi.includes('Tidak') ? 'var(--safe)' : 'var(--danger)' }}>
                    <AlertTriangle size={16} /> {latestQuake.Potensi}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Dirasakan (Skala MMI)</p>
                  <p style={{ fontWeight: '600' }}>{latestQuake.Dirasakan || 'Tidak ada data dirasakan'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>Gagal memuat data BMKG.</div>
          )}
        </div>
      </section>

      {/* Fitur Grid */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', marginBottom: '48px' }}>Platform Terintegrasi</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {/* Fitur 1 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--accent)' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              backgroundColor: 'rgba(109, 40, 217, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Map color="var(--accent)" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Peta Gempa BMKG</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Visualisasi langsung titik gempa di seluruh Indonesia dengan detail kedalaman, magnitudo, dan radius guncangan.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--danger)' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert color="var(--danger)" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Peringatan Dini</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Sistem alarm otomatis yang akan berbunyi saat mendeteksi gempa signifikan atau anomali dari sensor.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--safe)' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              backgroundColor: 'rgba(14, 159, 110, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu color="var(--safe)" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Koneksi ESP32 IoT</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Hubungkan sensor fisik Anda untuk mendeteksi getaran lokal dan melihat gelombang seismograf secara live.
            </p>
          </div>

          {/* Fitur 4 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--warning)' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              backgroundColor: 'rgba(232, 138, 0, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BarChart3 color="var(--warning)" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Analitik & Histori</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Seluruh data kejadian gempa tersimpan rapi untuk keperluan pelaporan dan analisis tren seismik.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-sidebar)',
        padding: '40px 32px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <img src="/logo-v2.png" alt="Earthquake Detector" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
          <span style={{ fontWeight: '700' }}>Earthquake Detector</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          © {new Date().getFullYear()} Hak Cipta Dilindungi. Sistem Monitoring Gempa Indonesia.
        </p>
      </footer>
    </div>
  )
}

