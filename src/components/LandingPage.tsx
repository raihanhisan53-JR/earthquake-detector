'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Activity, ShieldAlert, Cpu, Map, ChevronRight, BarChart3,
  AlertTriangle, Clock, Waves, Navigation, Smartphone, Globe,
  Zap, Database, Bell, Users, CheckCircle, Star, Menu, X,
  ArrowRight, Eye, Layers, Radio, TrendingUp, Shield,
  Monitor, Satellite, Heart, MessageCircle, ChevronDown,
  ChevronUp, Mail, Code, Share2
} from 'lucide-react'

/* ─── Types ─── */
interface AutoGempa {
  Tanggal: string; Jam: string; Magnitude: string; Kedalaman: string
  Coordinates: string; Lintang: string; Bujur: string; Wilayah: string
  Potensi: string; Dirasakan: string; Shakemap: string
}

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Fitur', href: '#fitur' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Data', href: '#live-data' },
    { label: 'Harga', href: '#harga' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <header
      id="navbar"
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(13,21,32,0.95)' : 'var(--bg-sidebar)',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        padding: '0 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '72px',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image src="/logo-v2.png" alt="TECTRA PRO" width={36} height={36} style={{ borderRadius: '10px' }} />
        <div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '2px', color: 'var(--text-primary)' }}>TECTRA</span>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '2px', color: '#dc2626' }}> PRO</span>
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="lp-desktop-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} style={{
            color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px',
            fontWeight: '500', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >{l.label}</a>
        ))}
        <Link href="/login" className="btn btn-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 24px', fontWeight: '600', fontSize: '14px',
        }}>
          Masuk Dashboard <ChevronRight size={16} />
        </Link>
      </nav>

      {/* Mobile Hamburger */}
      <button
        className="lp-mobile-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', background: 'none', border: 'none',
          color: 'var(--text-primary)', cursor: 'pointer', padding: '8px',
        }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '72px', left: 0, right: 0,
          backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)',
          padding: '16px 32px', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}
            >{l.label}</a>
          ))}
          <Link href="/login" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
            Masuk Dashboard
          </Link>
        </div>
      )}
    </header>
  )
}

/* ─── Hero ─── */
function HeroSection() {
  const [pulse, setPulse] = useState(true)
  useEffect(() => {
    const i = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(i)
  }, [])

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      minHeight: '92vh', display: 'flex', alignItems: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)',
    }}>
      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(109,40,217,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Floating seismic waves */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute', width: `${180 + i * 160}px`, height: `${180 + i * 160}px`,
            borderRadius: '50%', border: `1px solid rgba(109,40,217,${0.15 - i * 0.04})`,
            transform: 'translate(-50%,-50%)',
            animation: `seismicWave 4s ease-out ${i * 1.2}s infinite`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        {/* Status badge */}
        <AnimatedSection>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, rgba(109,40,217,0.15), rgba(220,38,38,0.1))',
            border: '1px solid rgba(109,40,217,0.3)',
            padding: '8px 20px', borderRadius: '50px', marginBottom: '32px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: pulse ? 'var(--danger)' : 'var(--safe)',
              boxShadow: pulse ? '0 0 12px var(--danger)' : '0 0 12px var(--safe)',
              transition: 'all 0.5s',
            }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
              SISTEM AKTIF — MONITORING 24/7
            </span>
          </div>
        </AnimatedSection>

        {/* Headline */}
        <AnimatedSection delay={100}>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: '900', lineHeight: '1.1',
            marginBottom: '24px', letterSpacing: '-1px',
            color: 'var(--text-primary)',
          }}>
            Lindungi Keluarga Anda dari<br />
            <span style={{
              background: 'linear-gradient(135deg, #dc2626, #6d28d9, #e88a00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Bencana Gempa Bumi
            </span>
          </h1>
        </AnimatedSection>

        {/* Subheadline */}
        <AnimatedSection delay={200}>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: '680px', margin: '0 auto 40px', lineHeight: '1.7',
          }}>
            TECTRA PRO menggabungkan data resmi <strong style={{ color: 'var(--text-primary)' }}>BMKG</strong> &{' '}
            <strong style={{ color: 'var(--text-primary)' }}>USGS</strong>, sensor IoT{' '}
            <strong style={{ color: 'var(--text-primary)' }}>ESP32</strong>, dan AI prediktif menjadi satu platform
            Command Center terlengkap. Dapatkan <strong style={{ color: '#dc2626' }}>notifikasi kilat</strong> sebelum bahaya datang.
          </p>
        </AnimatedSection>

        {/* CTA Buttons */}
        <AnimatedSection delay={300}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', fontSize: '16px', fontWeight: '700', borderRadius: '50px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(220,38,38,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(220,38,38,0.4)' }}
            >
              Mulai Monitoring Gratis <ArrowRight size={20} />
            </Link>
            <a href="#live-data" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', fontSize: '16px', fontWeight: '600', borderRadius: '50px',
              background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.3)',
              color: 'var(--text-primary)', textDecoration: 'none',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.1)')}
            >
              Lihat Data Live <Eye size={20} />
            </a>
          </div>
        </AnimatedSection>

        {/* Trusted by / Social proof bar */}
        <AnimatedSection delay={500}>
          <div style={{
            marginTop: '64px', display: 'flex', justifyContent: 'center',
            gap: '48px', flexWrap: 'wrap', alignItems: 'center',
          }}>
            {[
              { icon: <Satellite size={18} />, label: 'Data BMKG Resmi' },
              { icon: <Globe size={18} />, label: 'USGS Global Feed' },
              { icon: <Radio size={18} />, label: 'IoT ESP32 Ready' },
              { icon: <Layers size={18} />, label: 'AI Predictive' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500',
              }}>
                <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Dashboard Preview Mock */}
        <AnimatedSection delay={600}>
          <div style={{
            marginTop: '64px', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(109,40,217,0.1)',
            background: 'var(--bg-card)',
            maxWidth: '900px', margin: '64px auto 0',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: 'var(--bg-sidebar)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ marginLeft: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                TECTRA PRO — Command Center Dashboard
              </span>
            </div>
            <div style={{
              padding: '40px 32px',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px',
            }}>
              {[
                { val: 'M 5.2', label: 'Gempa Terkini', color: 'var(--warning)' },
                { val: '12 km', label: 'Kedalaman', color: 'var(--safe)' },
                { val: 'Aman', label: 'Status Tsunami', color: 'var(--safe)' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card-alt)', borderRadius: '12px',
                  padding: '20px', textAlign: 'center',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: card.color }}>{card.val}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{card.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              padding: '16px 32px', borderTop: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-sidebar)',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['00:00', '06:00', '12:00', '18:00'].map((t, i) => (
                  <span key={i} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--safe)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─── Stats Counter Section ─── */
function StatsSection() {
  const stats = [
    { value: '15.000+', label: 'Gempa Terdeteksi / Tahun', icon: <Activity size={28} />, color: '#6d28d9' },
    { value: '< 3 detik', label: 'Waktu Notifikasi', icon: <Zap size={28} />, color: '#e88a00' },
    { value: '24/7', label: 'Monitoring Non-Stop', icon: <Clock size={28} />, color: '#0e9f6e' },
    { value: '100%', label: 'Data Resmi BMKG & USGS', icon: <Database size={28} />, color: '#dc2626' },
  ]

  return (
    <section style={{
      padding: '80px 32px', maxWidth: '1200px', margin: '0 auto',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px',
    }}>
      {stats.map((s, i) => (
        <AnimatedSection key={i} delay={i * 100}>
          <div style={{
            textAlign: 'center', padding: '36px 24px',
            background: 'var(--bg-card)', borderRadius: '16px',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = s.color }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
          >
            <div style={{ color: s.color, marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: s.color, marginBottom: '8px' }}>{s.value}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{s.label}</div>
          </div>
        </AnimatedSection>
      ))}
    </section>
  )
}

/* ─── Features Section ─── */
function FeaturesSection() {
  const features = [
    { icon: <Activity size={24} />, color: '#6d28d9', title: 'Real-Time Detection', desc: 'Deteksi gempa secara real-time dari multiple sumber data — BMKG, USGS, dan sensor lokal ESP32. Update setiap detik tanpa delay.' },
    { icon: <Bell size={24} />, color: '#dc2626', title: 'Instant Push Notification', desc: 'Notifikasi push langsung ke HP, email, dan webhook saat gempa terdeteksi. Bisa diatur berdasarkan radius, magnitudo, dan zona.' },
    { icon: <TrendingUp size={24} />, color: '#e88a00', title: 'AI-Powered Analysis', desc: 'Machine learning model yang terus belajar dari histori seismik untuk memberikan estimasi magnitude dan potensi tsunami lebih akurat.' },
    { icon: <Waves size={24} />, color: '#0e9f6e', title: 'Seismograph Live', desc: 'Visualisasi gelombang seismik real-time dari sensor ESP32. Lihat gelombang P, S, dan surface langsung di dashboard.' },
    { icon: <BarChart3 size={24} />, color: '#3b82f6', title: 'Historical Analytics', desc: 'Database lengkap histori gempa — filter berdasarkan waktu, lokasi, magnitudo. Export data CSV/PDF untuk pelaporan.' },
    { icon: <Map size={24} />, color: '#8b5cf6', title: 'Interactive Map', desc: 'Peta interaktif dengan Leaflet.js. Lihat semua titik gempa, depth color coding, dan shake map langsung di peta Indonesia.' },
    { icon: <Smartphone size={24} />, color: '#ec4899', title: 'Multi-Platform PWA', desc: 'Progressive Web App — bisa diinstall di Android & iOS. Akses tanpa koneksi internet, notifikasi native, dan UI responsif.' },
    { icon: <Database size={24} />, color: '#14b8a6', title: 'REST API Access', desc: 'API endpoint lengkap untuk developer. Integrasikan data gempa ke aplikasi Anda sendiri. Dokumentasi Swagger tersedia.' },
    { icon: <Users size={24} />, color: '#f59e0b', title: 'Community Reports', desc: 'Laporan warga terstruktur — setiap user bisa melaporkan kondisi terkini (kerusakan, evakuasi, titik aman) pasca gempa.' },
    { icon: <Cpu size={24} />, color: '#22c55e', title: 'IoT ESP32 Integration', desc: 'Hubungkan sensor accelerometer MPU6050 + modul WiFi ESP32 Anda. Deteksi getaran lokal tanpa bergantung pada data internet.' },
    { icon: <Shield size={24} />, color: '#ef4444', title: 'Early Warning System', desc: 'Sistem peringatan dini otomatis. Alert suara + notifikasi saat magnitudo melebihi threshold yang Anda tentukan.' },
    { icon: <Globe size={24} />, color: '#06b6d4', title: 'Global Coverage', desc: 'Tidak hanya Indonesia — monitor gempa seluruh dunia melalui feed USGS. Sempurna untuk NGO, riset, dan persiapan bencana.' },
  ]

  return (
    <section id="fitur" style={{ padding: '100px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
            background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.3)',
            color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
          }}>FITUR LENGKAP</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Semua yang Anda Butuhkan untuk<br /><span style={{ color: 'var(--accent)' }}>Mitigasi Bencana Gempa</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Platform all-in-one yang menggabungkan teknologi IoT, AI, dan data resmi pemerintah untuk menjaga keselamatan tim Anda.
          </p>
        </div>
      </AnimatedSection>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {features.map((f, i) => (
          <AnimatedSection key={i} delay={i * 60}>
            <div style={{
              padding: '28px', background: 'var(--bg-card)', borderRadius: '16px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.3s ease', height: '100%',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = f.color; e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}20` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: `${f.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px', color: f.color,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorksSection() {
  const steps = [
    { num: '01', icon: <Radio size={32} />, color: '#6d28d9', title: 'Data Terkumpul', desc: 'Sensor ESP32, feed BMKG, dan USGS mengirimkan data getaran bumi ke server TECTRA PRO dalam hitungan detik.' },
    { num: '02', icon: <Cpu size={32} />, color: '#dc2626', title: 'AI Menganalisis', desc: 'Machine learning model mengolah data seismik — membedakan gempa signifikan dari noise, menghitung magnitudo, dan memproyeksikan dampak.' },
    { num: '03', icon: <Map size={32} />, color: '#e88a00', title: 'Visualisasi Real-Time', desc: 'Semua informasi ditampilkan di dashboard interaktif — peta, seismograf, statistik, dan status ancaman tsunami.' },
    { num: '04', icon: <Bell size={32} />, color: '#0e9f6e', title: 'Notifikasi & Aksi', desc: 'Alert dikirim ke semua perangkat terhubung. Evakuasi lebih cepat. Nyawa lebih banyak terselamatkan.' },
  ]

  return (
    <section id="cara-kerja" style={{
      padding: '100px 32px',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(109,40,217,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <AnimatedSection>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
              color: 'var(--danger)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
            }}>KERJA CEPAT</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Dari Getaran Sampai Notifikasi<br /><span style={{ color: 'var(--danger)' }}>Hanya Dalam 4 Langkah</span>
            </h2>
          </div>
        </AnimatedSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((s, i) => (
            <AnimatedSection key={i} delay={i * 150}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '24px',
                padding: '32px', background: 'var(--bg-card)', borderRadius: '16px',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateX(8px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = '' }}
              >
                <div style={{
                  minWidth: '72px', height: '72px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${s.color}30, ${s.color}10)`,
                  border: `1px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color, fontSize: '28px', fontWeight: '900',
                }}>{s.num.slice(-2)}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>{s.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', maxWidth: '600px' }}>{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '60px', margin: '0' }}>
                  <div style={{ width: '2px', height: '32px', background: `linear-gradient(to bottom, ${s.color}, transparent)` }} />
                </div>
              )}
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Live Data Section ─── */
function LiveDataSection() {
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
    const interval = setInterval(fetchBMKG, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="live-data" style={{ padding: '100px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
            background: 'rgba(14,159,110,0.1)', border: '1px solid rgba(14,159,110,0.3)',
            color: 'var(--safe)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
          }}>DATA REAL-TIME</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Pantau Gempa <span style={{ color: 'var(--safe)' }}>Terkini</span> Langsung di Sini
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Data langsung dari BMKG — ter-update setiap menit. Tanpa perlu login.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '20px 28px', background: 'var(--bg-sidebar)',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <span style={{
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: loading ? 'var(--warning)' : latestQuake ? 'var(--safe)' : 'var(--danger)',
              boxShadow: `0 0 10px ${loading ? 'var(--warning)' : latestQuake ? 'var(--safe)' : 'var(--danger)'}`,
              animation: 'pulse 2s infinite',
            }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {loading ? 'Menghubungi BMKG...' : latestQuake ? 'Data Gempa Terkini' : 'Gagal memuat data'}
            </h3>
            {!loading && latestQuake && (
              <span style={{
                marginLeft: 'auto', fontSize: '13px', color: 'var(--background)',
                padding: '4px 12px', borderRadius: '50px',
                backgroundColor: 'var(--safe)', fontWeight: '600',
              }}>LIVE</span>
            )}
          </div>

          {latestQuake ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Magnitude Hero */}
              <div style={{
                padding: '36px 28px',
                background: parseFloat(latestQuake.Magnitude) >= 5.0
                  ? 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.05))'
                  : 'linear-gradient(135deg, rgba(109,40,217,0.15), rgba(109,40,217,0.05))',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '28px',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  backgroundColor: parseFloat(latestQuake.Magnitude) >= 5.0 ? 'var(--danger)' : 'var(--accent)',
                  color: '#fff', width: '90px', height: '90px', borderRadius: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 24px ${parseFloat(latestQuake.Magnitude) >= 5.0 ? 'rgba(220,38,38,0.3)' : 'rgba(109,40,217,0.3)'}`,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>MAG</span>
                  <span style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{latestQuake.Magnitude}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>{latestQuake.Wilayah}</h3>
                  <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} /> {latestQuake.Tanggal} | {latestQuake.Jam}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Waves size={15} /> Kedalaman: {latestQuake.Kedalaman}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                padding: '24px 28px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px',
                background: 'var(--bg-card)',
              }}>
                {[
                  { label: 'Koordinat', value: latestQuake.Coordinates, icon: <Navigation size={16} color="var(--accent)" /> },
                  { label: 'Potensi Tsunami', value: latestQuake.Potensi, icon: <AlertTriangle size={16} color={latestQuake.Potensi.includes('Tidak') ? 'var(--safe)' : 'var(--danger)'} />, danger: !latestQuake.Potensi.includes('Tidak') },
                  { label: 'Dirasakan (MMI)', value: latestQuake.Dirasakan || 'Tidak ada data', icon: <Eye size={16} color="var(--text-secondary)" /> },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-card-alt)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                    <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: item.danger ? 'var(--danger)' : 'var(--text-primary)', fontSize: '15px' }}>
                      {item.icon} {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--danger)' }}>
                <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
                <p>Gagal memuat data BMKG. Silakan coba lagi nanti.</p>
              </div>
            )
          )}
        </div>
      </AnimatedSection>
    </section>
  )
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: any) => {
    if (plan.name === 'Starter') {
      window.location.href = '/login'
      return
    }
    if (plan.name === 'Enterprise') {
      window.open('https://wa.me/6281234567890?text=Halo%20Sales%20TECTRA%20PRO,%20saya%20tertarik%20dengan%20paket%20Enterprise.', '_blank')
      return
    }

    setLoading(plan.name)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: plan.name,
          price: 99000,
          userEmail: 'customer@example.com',
        })
      })
      const { invoiceUrl } = await res.json()
      if (invoiceUrl) {
        window.location.href = invoiceUrl
      }
    } catch (e) {
      console.error(e)
      alert('Gagal memproses pembayaran. Silakan hubungi kami via WhatsApp.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Starter', price: 'Gratis', period: '/ selamanya', color: '#6d28d9',
      desc: 'Cocok untuk personal monitoring & belajar seismologi.',
      features: [
        'Data BMKG real-time',
        'Notifikasi email dasar',
        'Dashboard standar',
        'Riwayat 30 hari',
        '1 sensor ESP32',
        'Community support',
      ],
      cta: 'Mulai Gratis', ctaStyle: 'outline', popular: false,
    },
    {
      name: 'Professional', price: 'Rp 99K', period: '/ bulan', color: '#dc2626',
      desc: 'Untuk tim SAR, sekolah, kantor, dan komunitas.',
      features: [
        'Semua fitur Starter',
        'ARIA AI Assistant (Chat 24/7)',
        'Notifikasi push + SMS',
        'AI magnitude prediction',
        'Riwayat unlimited',
        'Hingga 10 sensor ESP32',
        'REST API access',
        'Radius alert custom',
      ],
      cta: 'Pilih Pro', ctaStyle: 'primary', popular: true,
    },
    {
      name: 'Enterprise', price: 'Custom', period: '', color: '#e88a00',
      desc: 'Untuk pemerintah, BNPB, NGO, dan korporasi besar.',
      features: [
        'Semua fitur Pro',
        'Unlimited sensors',
        'White-label dashboard',
        'SLA 99.9% uptime',
        'Dedicated server',
        'Custom AI model training',
        'Webhook & integration',
        'On-site training',
        '24/7 phone support',
        'Multi-tenant management',
      ],
      cta: 'Hubungi Sales', ctaStyle: 'outline', popular: false,
    },
  ]

  return (
    <section id="harga" style={{
      padding: '100px 32px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 60%)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <AnimatedSection>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
              background: 'rgba(232,138,0,0.1)', border: '1px solid rgba(232,138,0,0.3)',
              color: 'var(--warning)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
            }}>HARGA TRANSPARAN</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Paket yang Sesuai <span style={{ color: 'var(--warning)' }}>Kebutuhan Anda</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
              Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi.
            </p>
          </div>
        </AnimatedSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {plans.map((plan, i) => (
            <AnimatedSection key={i} delay={i * 150}>
              <div style={{
                position: 'relative', padding: '36px 28px',
                background: 'var(--bg-card)', borderRadius: '20px',
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-color)',
                boxShadow: plan.popular ? `0 16px 48px ${plan.color}20` : 'none',
                transition: 'transform 0.3s',
                height: '100%',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-8px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                    color: '#fff', padding: '6px 20px', borderRadius: '50px',
                    fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px',
                  }}>PALING POPULER</div>
                )}

                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{plan.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{plan.desc}</p>

                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '900', color: plan.color }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{plan.period}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} color={plan.color} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading !== null}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px',
                    border: 'none', cursor: 'pointer',
                    ...(plan.ctaStyle === 'primary'
                      ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: '#fff', boxShadow: `0 4px 16px ${plan.color}40` }
                      : { background: 'transparent', border: `1px solid ${plan.color}`, color: plan.color }
                    ),
                    transition: 'all 0.2s',
                    opacity: loading === plan.name ? 0.7 : 1,
                  }}
                >
                  {loading === plan.name ? 'Memproses...' : plan.cta} <ArrowRight size={16} />
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState({ name: '', text: '', role: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setComments(data)
      } else {
        setComments([
          { name: 'Ahmad Fauzi', role: 'Ketua RT 05, Yogyakarta', text: 'Sejak pakai TECTRA PRO, warga RT kami jadi lebih siap. Notifikasi datang sebelum gempa dirasakan.', rating: 5, avatar: 'AF' },
          { name: 'Dr. Siti Rahayu', role: 'Peneliti Seismologi ITB', text: 'Data historisnya sangat lengkap dan akurat. Saya gunakan untuk riset pola seismik Jawa.', rating: 5, avatar: 'SR' },
          { name: 'Budi Santoso', role: 'Tim SAR Basarnas', text: 'Dashboard real-time membantu kami koordinasi evakuasi. Fitur radius alert sangat berguna.', rating: 5, avatar: 'BS' },
        ])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.name || !newComment.text) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newComment,
          avatar: newComment.name.substring(0, 2).toUpperCase(),
          rating: 5
        })
      })
      if (res.ok) {
        setNewComment({ name: '', text: '', role: '' })
        fetchComments()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="testimoni" style={{ padding: '100px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
            background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.3)',
            color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
          }}>TESTIMONI</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Dipercaya <span style={{ color: 'var(--accent)' }}>Ribuan Pengguna</span> di Indonesia
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            Bagikan pengalaman Anda menggunakan TECTRA PRO untuk membantu sesama.
          </p>
        </div>
      </AnimatedSection>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        {comments.map((t, i) => (
          <AnimatedSection key={i} delay={i * 80}>
            <div style={{
              padding: '28px', background: 'var(--bg-card)', borderRadius: '16px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.3s', height: '100%',
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={16} fill={si < (t.rating || 5) ? '#e88a00' : 'none'} color={si < (t.rating || 5) ? '#e88a00' : 'var(--text-muted)'} />
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
                &quot;{t.text}&quot;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--danger))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '14px',
                }}>{t.avatar || 'U'}</div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t.role}</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div style={{
          maxWidth: '600px', margin: '0 auto', padding: '32px',
          background: 'var(--bg-card-alt)', borderRadius: '24px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>Kirim Testimoni Anda</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={newComment.name}
                onChange={e => setNewComment({ ...newComment, name: e.target.value })}
                required
                style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                placeholder="Pekerjaan / Lokasi"
                value={newComment.role}
                onChange={e => setNewComment({ ...newComment, role: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <textarea
              placeholder="Apa yang Anda rasakan setelah menggunakan TECTRA PRO?"
              value={newComment.text}
              onChange={e => setNewComment({ ...newComment, text: e.target.value })}
              required
              rows={4}
              style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'none' }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '14px', borderRadius: '12px', background: 'var(--accent)', color: '#fff',
                border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s',
              }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Testimoni'}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </section>
  )
}

/* ─── FAQ Section ─── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    { q: 'Apakah TECTRA PRO gratis?', a: 'Ya! Kami menyediakan paket Starter yang gratis selamanya. Anda bisa akses data BMKG real-time, dashboard standar, dan notifikasi email tanpa biaya apapun. Upgrade ke Pro atau Enterprise jika butuh fitur lanjutan.' },
    { q: 'Bagaimana cara kerja deteksi gempanya?', a: 'TECTRA PRO mengumpulkan data dari tiga sumber: (1) BMKG Indonesia via API resmi, (2) USGS global earthquake feed, dan (3) sensor IoT ESP32 yang bisa Anda pasang sendiri. Data diproses oleh AI model untuk membedakan gempa signifikan dari noise.' },
    { q: 'Apakah bisa dipakai tanpa internet?', a: 'Jika menggunakan sensor ESP32 lokal, sistem tetap bisa mendeteksi getaran meski tanpa internet. Namun untuk data BMKG/USGS dan notifikasi push, koneksi internet diperlukan. Kami juga menyediakan PWA yang bisa cache data terakhir.' },
    { q: 'Seberapa akurat datanya?', a: 'Data berasal langsung dari BMKG dan USGS — institusi resmi pemerintah. Akurasi waktu ±1 detik, lokasi ±5 km, dan magnitudo ±0.1 dari data resmi. Sensor ESP32 lokal memiliki akurasi yang bergantung pada kalibrasi hardware.' },
    { q: 'Bisa untuk keperluan komersial?', a: 'Ya! Paket Enterprise mendukung white-label, multi-tenant, dan custom integration. Banyak mall, sekolah, dan kantor yang menggunakan TECTRA PRO untuk sistem keselamatan mereka.' },
    { q: 'Bagaimana cara pasang sensor ESP32?', a: 'Kami menyediakan panduan lengkap di dashboard. Anda cukup membeli ESP32 + MPU6050 (sekitar Rp 50.000), flash firmware kami via USB, dan hubungkan ke WiFi. Data langsung masuk ke dashboard dalam hitungan menit.' },
    { q: 'Apakah ada API untuk developer?', a: 'Ya! Paket Pro dan Enterprise menyediakan REST API lengkap dengan dokumentasi Swagger. Anda bisa akses data gempa, histori, dan statistik dalam format JSON. Rate limit 1000 request/hour untuk Pro.' },
    { q: 'Bagaimana dengan privasi data saya?', a: 'Kami sangat menjaga privasi. Data lokasi hanya digunakan untuk radius alert. Kami tidak menjual data ke pihak ketiga. Semua data dienkripsi via HTTPS dan disimpan di server yang compliant dengan regulasi Indonesia.' },
  ]

  return (
    <section id="faq" style={{ padding: '100px 32px', maxWidth: '800px', margin: '0 auto' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '50px',
            background: 'rgba(14,159,110,0.1)', border: '1px solid rgba(14,159,110,0.3)',
            color: 'var(--safe)', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
          }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Pertanyaan yang <span style={{ color: 'var(--safe)' }}>Sering Ditanyakan</span>
          </h2>
        </div>
      </AnimatedSection>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, i) => (
          <AnimatedSection key={i} delay={i * 50}>
            <div style={{
              background: 'var(--bg-card)', borderRadius: '12px',
              border: openIndex === i ? '1px solid var(--accent)' : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                  color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                {faq.q}
                {openIndex === i ? <ChevronUp size={20} color="var(--accent)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </button>
              {openIndex === i && (
                <div style={{
                  padding: '0 24px 20px', color: 'var(--text-secondary)',
                  fontSize: '15px', lineHeight: '1.7',
                  borderTop: '1px solid var(--border-color)', paddingTop: '16px',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}

/* ─── Final CTA ─── */
function FinalCTASection() {
  return (
    <section style={{ padding: '100px 32px' }}>
      <AnimatedSection>
        <div style={{
          maxWidth: '900px', margin: '0 auto', textAlign: 'center',
          padding: '64px 48px', borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(109,40,217,0.15))',
          border: '1px solid rgba(220,38,38,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 50%)',
            animation: 'seismicWave 8s ease-out infinite',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Siap Melindungi yang Anda Cintai?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '36px', maxWidth: '550px', margin: '0 auto 36px', lineHeight: '1.6' }}>
              Bergabung dengan ribuan pengguna TECTRA PRO. Mulai gratis, tanpa kartu kredit.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '16px 36px', fontSize: '16px', fontWeight: '700', borderRadius: '50px',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#fff', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
              >
                Mulai Sekarang — Gratis <ArrowRight size={20} />
              </Link>
              <a href="https://wa.me/6281234567890?text=Halo%20Admin%20TECTRA%20PRO,%20saya%20tertarik%20dengan%20layanan%20Anda." target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '16px 36px', fontSize: '16px', fontWeight: '600', borderRadius: '50px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', textDecoration: 'none',
              }}>
                <MessageCircle size={20} /> Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  const footerLinks = {
    Produk: ['Fitur', 'Harga', 'API Docs', 'Changelog', 'Status Page'],
    Perusahaan: ['Tentang Kami', 'Blog', 'Karir', 'Press Kit', 'Kontak'],
    'Sumber Data': ['BMKG Indonesia', 'USGS Earthquake', 'EMSC', 'GFZ Potsdam', 'IRIS'],
    Legal: ['Kebijakan Privasi', 'Syarat & Ketentuan', 'SLA', 'GDPR', 'Keamanan'],
  }

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-sidebar)',
      padding: '64px 32px 32px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px', marginBottom: '48px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Image src="/logo-v2.png" alt="TECTRA PRO" width={32} height={32} style={{ borderRadius: '8px' }} />
              <div>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: 'var(--text-primary)' }}>TECTRA</span>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: '#dc2626' }}> PRO</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Sistem monitoring gempa bumi real-time terpercaya di Indonesia. Data resmi BMKG & USGS, sensor IoT, dan AI prediktif dalam satu platform.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Share2, Code, MessageCircle].map((Icon, i) => (
                <a key={i} href={i === 2 ? "https://wa.me/6281234567890" : "#"} target={i === 2 ? "_blank" : "_self"} style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
                ><Icon size={16} /></a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(link => (
                  <a key={link} href="#" style={{
                    color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)', paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} TECTRA PRO. Hak Cipta Dilindungi. Dibuat dengan ❤️ di Indonesia.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Data: BMKG • USGS • EMSC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Main Export ─── */
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LiveDataSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
