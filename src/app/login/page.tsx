'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        borderRadius: '24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <img src="/logo.png" alt="Earthquake Detector" style={{ width: '80px', borderRadius: '16px', marginBottom: '24px' }} />
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#fff', letterSpacing: '0.5px' }}>
            EARTHQUAKE DETECTOR
          </div>
        </div>

        <h1 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '32px', color: '#e5e7eb' }}>
          Pilih cara masuk
        </h1>

        {error && (
          <div style={{ fontSize: '13px', color: '#fca5a5', background: 'rgba(220,38,38,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px 24px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>{loading ? 'Memproses...' : 'Google'}</span>
          </div>
          <span style={{ color: '#a78bfa', fontSize: '14px' }}>Masuk →</span>
        </button>

        <p style={{ marginTop: '32px', fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
          Dengan masuk, kamu setuju dengan{' '}
          <a href="#" style={{ color: '#a78bfa', textDecoration: 'none' }}>Syarat Layanan</a>
          {' '}dan{' '}
          <a href="#" style={{ color: '#a78bfa', textDecoration: 'none' }}>Kebijakan Privasi</a>.
        </p>
      </div>
    </div>
  )
}
