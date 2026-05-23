'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, ShieldAlert, Cpu, Map, ChevronRight, Zap, Globe, BarChart3, BellRing } from 'lucide-react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TECTRA PRO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Platform</a>
            <a href="#technology" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Technology</a>
            <a href="#integration" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Integrations</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white hover:text-indigo-400 transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/login" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Enterprise-Grade Seismic Monitoring
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Anticipate the Earth.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
              Protect What Matters.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tectra Pro delivers real-time seismic analytics, low-latency BMKG integration, and hardware ESP32 sensor connectivity in one unified command center.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 group">
              Access Dashboard
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              Explore Capabilities
            </a>
          </div>
        </div>

        {/* Hero Visual Showcase - Replaces the ugly empty mockup */}
        <div className="max-w-6xl mx-auto mt-24 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 h-full"></div>
          <div className="rounded-2xl md:rounded-[32px] border border-white/10 bg-[#0A0A0A] p-2 md:p-4 shadow-2xl relative overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-4 px-2 pt-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            {/* Fake Dashboard UI constructed with pure CSS for a premium look */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Chart Area */}
              <div className="md:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6 h-[300px] flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <div>
                    <h3 className="text-white font-medium">Seismic Activity</h3>
                    <p className="text-xs text-slate-500">Live data stream (BMKG)</p>
                  </div>
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live
                  </div>
                </div>
                
                {/* SVG Seismograph Waveform */}
                <div className="absolute inset-x-0 bottom-0 h-48 opacity-60">
                  <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
                    <path 
                      d="M0,100 L50,100 L60,80 L70,120 L80,90 L90,110 L100,100 L200,100 L210,50 L220,150 L230,20 L240,180 L250,70 L260,130 L270,100 L400,100 L410,95 L420,105 L430,100 L600,100 L610,60 L620,140 L630,40 L640,160 L650,80 L660,120 L670,100 L800,100 L810,90 L820,110 L830,100 L1000,100" 
                      fill="none" 
                      stroke="url(#waveform-gradient)" 
                      strokeWidth="2" 
                      vectorEffect="non-scaling-stroke"
                    />
                    <defs>
                      <linearGradient id="waveform-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                        <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Side Panels */}
              <div className="flex flex-col gap-4">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 h-[142px]">
                  <h3 className="text-white font-medium text-sm mb-4">Recent Alerts</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <ShieldAlert size={14} className="text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">M 5.4 - Java Sea</div>
                        <div className="text-xs text-slate-500">2 mins ago</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 h-[142px]">
                   <h3 className="text-white font-medium text-sm mb-4">Hardware Status</h3>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-400">ESP32 Node 1</span>
                     <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Online</span>
                   </div>
                   <div className="mt-4 w-full bg-white/5 rounded-full h-1.5">
                     <div className="bg-indigo-500 h-1.5 rounded-full w-3/4"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Bento Grid */}
      <section id="features" className="relative z-10 py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for precision.<br/><span className="text-slate-500">Designed for action.</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl">A comprehensive suite of tools specifically engineered for real-time seismic monitoring, threat analysis, and hardware integration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Bento 1: Map Integration */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Map className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Interactive BMKG Mapping</h3>
                  <p className="text-slate-400 max-w-md">Live rendering of seismic events across the Indonesian archipelago. Features shakemap overlays, fault lines, and dynamic tectonic visualization.</p>
                </div>
              </div>
            </div>

            {/* Bento 2: Speed */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors flex flex-col justify-between group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ultra-Low Latency</h3>
                <p className="text-slate-400 text-sm">Powered by Next.js edge architecture, delivering real-time alerts milliseconds after detection.</p>
              </div>
            </div>

            {/* Bento 3: ESP32 */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors flex flex-col justify-between group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">IoT Integration</h3>
                <p className="text-slate-400 text-sm">Direct seamless connection with ESP32 hardware sensors for localized, physical ground-truth data.</p>
              </div>
            </div>

            {/* Bento 4: Analytics */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors relative overflow-hidden group">
               <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                 <BarChart3 size={200} strokeWidth={0.5} className="text-slate-300 translate-x-1/4 translate-y-1/4" />
               </div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Historical Data Analytics</h3>
                  <p className="text-slate-400 max-w-md">Comprehensive event logging and deep analytics. Track patterns, review past incidents, and generate professional seismic reports.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative border-t border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Globe className="w-16 h-16 text-indigo-500 mx-auto mb-8 opacity-80" strokeWidth={1} />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to secure your perimeter?</h2>
          <p className="text-xl text-slate-400 mb-10">Join professionals and institutions relying on Tectra Pro for critical seismic monitoring.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95">
            Launch Platform
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Activity className="text-indigo-400" size={20} />
            <span className="text-white font-bold tracking-wider">TECTRA PRO</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tectra Pro Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
