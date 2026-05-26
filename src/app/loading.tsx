import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.15)] relative z-10 border border-white/5 overflow-hidden">
            <Image 
              src="/logo-v2.png" 
              alt="Logo TECTRA PRO" 
              width={64} 
              height={64} 
              className="animate-pulse object-contain"
              priority
            />
          </div>
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-indigo-600 rounded-3xl animate-ping opacity-10 blur-2xl"></div>
          <div className="absolute -inset-4 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Text Container */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-white font-black tracking-[0.3em] text-lg uppercase ml-[0.3em]">
              TECTRA<span className="text-red-600"> PRO</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-indigo-400/80 text-[10px] font-bold uppercase tracking-[0.4em] ml-[0.4em]">
              Sistem Deteksi Gempa Terpadu
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
            <span className="text-slate-500 text-[10px] font-medium uppercase tracking-[0.2em] animate-pulse">
              Memuat Platform...
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-8 text-slate-600 text-[9px] uppercase tracking-widest font-semibold">
        © 2026 TECTRA PRO INDONESIA
      </div>
    </div>
  )
}
