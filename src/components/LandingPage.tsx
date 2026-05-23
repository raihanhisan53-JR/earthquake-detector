'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, ShieldAlert, Cpu, Sparkles, Map, ChevronRight, Zap } from 'lucide-react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-container">
          <div className="landing-logo">
            <div className="logo-icon"><Activity size={24} color="#fff" /></div>
            <span className="logo-text">Tectra Pro</span>
          </div>
          
          <div className="landing-nav-links hidden-mobile">
            <a href="#fitur">Fitur Utama</a>
            <a href="#teknologi">Teknologi</a>
            <a href="#aria">Aria AI</a>
          </div>

          <div className="landing-nav-actions">
            <Link href="/login" className="btn-login">Masuk</Link>
            <Link href="/login" className="btn-signup">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>Kini hadir dengan Aria AI 2.0</span>
          </div>
          
          <h1 className="hero-title">
            Platform Cerdas untuk<br/>
            <span className="text-gradient">Pemantauan Gempa</span>
          </h1>
          
          <p className="hero-subtitle">
            Tectra Pro mendeteksi anomali seismik secara real-time. Lindungi aset dan keselamatan Anda dengan peringatan dini secepat kilat.
          </p>
          
          <div className="hero-cta-group">
            <Link href="/login" className="btn-primary-large">
              Mulai Eksplorasi <ChevronRight size={18} />
            </Link>
            <a href="#fitur" className="btn-secondary-large">
              Pelajari Lebih Lanjut
            </a>
          </div>
          
          {/* Mockup / Dashboard Preview Illustration */}
          <div className="hero-mockup-wrapper">
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots"><span></span><span></span><span></span></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar"></div>
                <div className="mockup-content">
                  <div className="mockup-card" style={{ width: '100%', height: '120px', marginBottom: '16px' }}></div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="mockup-card" style={{ width: '60%', height: '200px' }}></div>
                    <div className="mockup-card" style={{ width: '40%', height: '200px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Box */}
      <section id="fitur" className="features-section">
        <div className="features-container">
          <h2 className="section-title">Semua yang Anda butuhkan dalam satu dashboard.</h2>
          
          <div className="bento-grid">
            {/* Feature 1 */}
            <div className="bento-card card-large gradient-purple">
              <div className="bento-content">
                <h3 className="bento-title"><Activity size={24} /> Real-time Seismograf</h3>
                <p>Pantau getaran bumi dengan latensi sangat rendah langsung dari browser Anda.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bento-card">
              <div className="bento-content">
                <h3 className="bento-title"><ShieldAlert size={24} color="#ef4444" /> Peringatan Dini</h3>
                <p>Notifikasi kilat saat gempa terjadi. Jangan sampai terlambat mengambil tindakan.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bento-card">
              <div className="bento-content">
                <h3 className="bento-title"><Cpu size={24} color="#059669" /> Integrasi IoT ESP32</h3>
                <p>Hubungkan sensor fisik Anda langsung ke cloud Tectra Pro.</p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bento-card card-wide gradient-blue">
              <div className="bento-content">
                <h3 className="bento-title"><Map size={24} /> Peta Gempa Interaktif BMKG</h3>
                <p>Visualisasi lokasi titik gempa akurat yang bersumber dari data terpercaya BMKG dan USGS secara live.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-wrapper {
          min-height: 100vh;
          background-color: var(--bg-main, #0f172a);
          color: var(--text-primary, #f8fafc);
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* Navbar Styles */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.3s ease;
        }

        .landing-nav.scrolled {
          padding: 12px 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .landing-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          background: linear-gradient(135deg, #6d28d9, #3b82f6);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-nav-links {
          display: flex;
          gap: 32px;
        }

        .landing-nav-links a {
          color: var(--text-secondary, #94a3b8);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .landing-nav-links a:hover {
          color: #fff;
        }

        .landing-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-login {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
        }

        .btn-signup {
          background: #fff;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-signup:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.2);
        }

        /* Hero Styles */
        .hero-section {
          position: relative;
          padding: 160px 24px 80px;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 0;
          overflow: hidden;
        }

        .gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.5;
        }

        .sphere-1 {
          width: 600px; height: 600px;
          background: rgba(109, 40, 217, 0.4);
          top: -200px; right: -100px;
        }

        .sphere-2 {
          width: 500px; height: 500px;
          background: rgba(59, 130, 246, 0.3);
          bottom: 100px; left: -150px;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(109, 40, 217, 0.15);
          border: 1px solid rgba(109, 40, 217, 0.3);
          padding: 6px 16px;
          border-radius: 99px;
          color: #c4b5fd;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .text-gradient {
          background: linear-gradient(to right, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary, #94a3b8);
          max-width: 600px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 80px;
        }

        .btn-primary-large {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #6d28d9;
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary-large:hover {
          background: #5b21b6;
          box-shadow: 0 8px 24px rgba(109, 40, 217, 0.3);
          transform: translateY(-2px);
        }

        .btn-secondary-large {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-secondary-large:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Mockup */
        .hero-mockup-wrapper {
          width: 100%;
          perspective: 1000px;
        }

        .hero-mockup {
          background: #0f1e2e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          transform: rotateX(5deg) translateY(0);
          transition: transform 0.5s ease;
        }

        .hero-mockup:hover {
          transform: rotateX(0deg) translateY(-10px);
        }

        .mockup-header {
          height: 32px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          padding: 0 16px;
        }

        .mockup-dots {
          display: flex;
          gap: 6px;
        }

        .mockup-dots span {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
        }

        .mockup-body {
          display: flex;
          height: 400px;
        }

        .mockup-sidebar {
          width: 200px;
          border-right: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.1);
        }

        .mockup-content {
          flex: 1;
          padding: 24px;
        }

        .mockup-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
        }

        /* Features Section */
        .features-section {
          padding: 100px 24px;
          background: #0b1120;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 36px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 60px;
          color: #fff;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .bento-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 32px;
          transition: transform 0.3s, background 0.3s;
          position: relative;
          overflow: hidden;
        }

        .bento-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.04);
        }

        .card-large {
          grid-column: span 2;
          grid-row: span 2;
        }

        .card-wide {
          grid-column: span 2;
        }

        .bento-content {
          position: relative;
          z-index: 1;
        }

        .bento-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
        }

        .bento-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        .gradient-purple::before, .gradient-blue::before {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          opacity: 0.1;
          z-index: 0;
        }

        .gradient-purple::before {
          background: linear-gradient(135deg, #6d28d9, transparent);
        }

        .gradient-blue::before {
          background: linear-gradient(135deg, #3b82f6, transparent);
        }

        @media (max-width: 768px) {
          .hidden-mobile { display: none; }
          .hero-cta-group { flex-direction: column; width: 100%; }
          .bento-grid { grid-template-columns: 1fr; }
          .card-large, .card-wide { grid-column: span 1; grid-row: span 1; }
          .mockup-body { flex-direction: column; }
          .mockup-sidebar { display: none; }
        }
      `}</style>
    </div>
  )
}
