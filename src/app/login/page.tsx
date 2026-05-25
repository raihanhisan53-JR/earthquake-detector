'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Activity, Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
            setError('Email belum dikonfirmasi. Cek inbox atau gunakan Google login.')
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Email atau password salah.')
          } else {
            setError(error.message)
          }
        }
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
        if (data.session) {
          window.location.href = '/'
        } else {
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
      backgroundColor: 'var(--bg-main)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img 
            src="/logo-v2.png" 
            alt="Earthquake Detector" 
            style={{ 
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '16px',
              objectFit: 'contain'
            }} 
          />
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            {showEmailForm ? (mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru') : 'Earthquake Detector'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {showEmailForm ? 'Masukkan kredensial Anda di bawah ini' : 'Sistem Monitoring Gempa Real-Time'}
          </p>
        </div>

        {error && (
          <div className={`app-notice ${error.startsWith('✅') ? 'app-notice--info' : 'app-notice--error'}`} style={{ position: 'relative', top: 'auto', right: 'auto', width: '100%', padding: '16px', marginBottom: '0' }}>
            <div style={{ marginTop: '2px' }}>
              {error.startsWith('✅') ? <Activity size={16} color="var(--accent)" /> : <ShieldAlert size={16} color="var(--danger)" />}
            </div>
            <div className="app-notice__copy">
              <strong style={{ color: 'var(--text-primary)' }}>{error.startsWith('✅') ? 'Berhasil' : 'Autentikasi Gagal'}</strong>
              <span>{error.replace('✅ ', '')}</span>
            </div>
          </div>
        )}

        {!showEmailForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="btn"
              style={{ 
                backgroundColor: '#fff', 
                color: '#000', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                padding: '14px',
                fontSize: '15px'
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <span style={{ margin: '0 16px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>Atau</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <button 
              onClick={() => setShowEmailForm(true)}
              className="btn btn-outline"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                padding: '14px',
                fontSize: '15px'
              }}
            >
              <Mail size={18} />
              Lanjutkan dengan Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@tectra.com" 
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter" 
                  required 
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 44px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '15px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: '15px', marginTop: '8px' }}
            >
              {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun Baru')}
            </button>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0 0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <button 
                type="button"
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}
              >
                {mode === 'login' 
                  ? <span>Belum punya akun? <strong style={{ color: 'var(--accent)' }}>Daftar sekarang</strong></span>
                  : <span>Sudah punya akun? <strong style={{ color: 'var(--accent)' }}>Masuk di sini</strong></span>
                }
              </button>

              <button 
                type="button"
                onClick={() => { setShowEmailForm(false); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
              >
                Kembali ke Pilihan Login
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div style={{ position: 'absolute', bottom: '32px', textAlign: 'center', width: '100%' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
