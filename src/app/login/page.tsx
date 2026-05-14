'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            // Coba resend confirmation atau langsung login ulang
            setError('Email belum dikonfirmasi. Cek inbox atau gunakan Google login.')
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Email atau password salah.')
          } else {
            setError(error.message)
          }
        }
        // Jika berhasil, Supabase akan update session dan page.tsx akan redirect otomatis
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Email sudah terdaftar. Silakan masuk.')
            setMode('login')
          } else {
            setError(error.message)
          }
          return
        }
        // Jika email confirmation disabled, user langsung ter-login
        if (data.session) {
          // Session sudah ada, redirect akan terjadi otomatis
          window.location.href = '/'
        } else {
          // Email confirmation masih aktif
          setError('✅ Akun dibuat! Cek email untuk konfirmasi, atau gunakan Google login.')
          setMode('login')
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0533 0%, #0a0a0f 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif", padding: '16px',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Card */}
        <div style={{
          background: 'rgba(13, 17, 28, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '20px',
          padding: '40px 36px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo"
              style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px', objectFit: 'cover' }} />
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
              Earthquake Detector
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0 0', fontWeight: '400' }}>
              Sistem monitoring gempa bumi real-time
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{
              fontSize: '13px',
              color: error.startsWith('✅') ? '#86efac' : '#fca5a5',
              background: error.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${error.startsWith('✅') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              padding: '10px 14px', borderRadius: '10px', marginBottom: '20px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google Button */}
              <button onClick={handleGoogleLogin} disabled={loading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', padding: '13px 20px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                marginBottom: '12px',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
              >
                <svg viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>atau</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email Button */}
              <button onClick={() => setShowEmailForm(true)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', padding: '13px 20px',
                background: 'transparent',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '12px', color: '#a78bfa', fontSize: '15px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Lanjutkan dengan Email
              </button>

              {/* Footer */}
              <p style={{ marginTop: '28px', fontSize: '11px', color: '#374151', textAlign: 'center', lineHeight: '1.6' }}>
                Dengan masuk, kamu menyetujui{' '}
                <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Syarat Layanan</a>
                {' '}dan{' '}
                <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Kebijakan Privasi</a>
              </p>
            </>
          ) : (
            <>
              {/* Back */}
              <button onClick={() => { setShowEmailForm(false); setError('') }} style={{
                background: 'none', border: 'none', color: '#6b7280',
                fontSize: '13px', cursor: 'pointer', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Kembali
              </button>

              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '24px', textAlign: 'center' }}>
                {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
              </h2>

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="nama@domain.com" required
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter" required minLength={6}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }} />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px',
                  background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px', transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(139,92,246,0.3)',
                }}>
                  {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
                </button>
              </form>

              <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }} style={{
                marginTop: '20px', background: 'none', border: 'none',
                color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                width: '100%', textAlign: 'center',
              }}>
                {mode === 'login'
                  ? <span>Belum punya akun? <span style={{ color: '#a78bfa', fontWeight: '500' }}>Daftar gratis</span></span>
                  : <span>Sudah punya akun? <span style={{ color: '#a78bfa', fontWeight: '500' }}>Masuk</span></span>
                }
              </button>
            </>
          )}
        </div>

        {/* Bottom text */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#374151' }}>
          🛡️ Data kamu aman dengan enkripsi Supabase
        </p>
      </div>
    </div>
  )
}
