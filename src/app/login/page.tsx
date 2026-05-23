'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Activity, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        {/* Glassmorphism Card */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
              <Activity className="text-white" size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {showEmailForm ? (mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Tectra') : 'Masuk ke Tectra Pro'}
            </h1>
            <p className="text-sm text-slate-400">
              {showEmailForm ? 'Masukkan kredensial Anda di bawah ini' : 'Pilih metode masuk untuk melanjutkan'}
            </p>
          </div>

          {/* Error / Success Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border ${
              error.startsWith('✅') 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="mt-0.5">
                {error.startsWith('✅') ? <Activity size={16} /> : <ShieldAlert size={16} className="lucide lucide-shield-alert" />}
              </div>
              <div className="flex-1 leading-snug">{error.replace('✅ ', '')}</div>
            </div>
          )}

          {!showEmailForm ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">Atau</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-[#1A1A1A] text-white border border-white/10 font-medium py-3.5 px-4 rounded-xl transition-all"
              >
                <Mail size={18} className="text-slate-400" />
                Lanjutkan dengan Email
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400 pl-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-500" />
                    </div>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nama@perusahaan.com" 
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400 pl-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-500" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" 
                      required 
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun Baru')}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4">
                <button 
                  onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {mode === 'login' 
                    ? <p>Belum punya akun? <span className="text-indigo-400 font-semibold">Daftar sekarang</span></p>
                    : <p>Sudah punya akun? <span className="text-indigo-400 font-semibold">Masuk di sini</span></p>
                  }
                </button>

                <button 
                  onClick={() => { setShowEmailForm(false); setError('') }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={12} /> Kembali ke Pilihan Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center mt-8 text-xs text-slate-600">
          Dilindungi oleh enkripsi End-to-End Supabase.<br/>
          Melanjutkan berarti Anda menyetujui Syarat & Ketentuan kami.
        </p>
      </div>
    </div>
  )
}
