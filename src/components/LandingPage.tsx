'use client'

import React from 'react'
import Link from 'next/link'
import { Activity, ShieldAlert, Cpu, Map, ChevronRight, BarChart3, BellRing } from 'lucide-react'

export default function LandingPage() {
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
          <div style={{ 
            backgroundColor: 'var(--accent)', 
            padding: '8px', 
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity color="#fff" size={24} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>TECTRA PRO</span>
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
        flexDirection: 'col',
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
          marginBottom: '24px'
        }}>
          Sistem Deteksi Gempa BMKG & ESP32
        </div>
        
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px' }}>
          Monitor Aktivitas Seismik Secara <span style={{ color: 'var(--accent)' }}>Real-Time</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
          Tectra Pro mengintegrasikan data resmi BMKG, USGS, dan sensor hardware ESP32 ke dalam satu Command Center profesional. Dapatkan notifikasi kilat sebelum bahaya datang.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '50px' }}>
            Buka Dashboard
          </Link>
          <a href="#fitur" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '50px' }}>
            Pelajari Fitur
          </a>
        </div>
      </section>

      {/* Fitur Grid */}
      <section id="fitur" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', marginBottom: '48px' }}>Platform Terintegrasi</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {/* Fitur 1 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        padding: '32px',
        textAlign: 'center',
        marginTop: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <Activity color="var(--accent)" size={20} />
          <span style={{ fontWeight: '700' }}>TECTRA PRO</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          © {new Date().getFullYear()} Hak Cipta Dilindungi. Sistem Monitoring Gempa Indonesia.
        </p>
      </footer>
    </div>
  )
}
