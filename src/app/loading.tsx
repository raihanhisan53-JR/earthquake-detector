import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shadow-2xl shadow-indigo-500/10 relative z-10 border border-white/5">
          <Image 
            src="/logo-v2.png" 
            alt="Logo" 
            width={48} 
            height={48} 
            className="animate-pulse"
          />
        </div>
        <div className="absolute inset-0 bg-indigo-500 rounded-2xl animate-ping opacity-10 blur-xl"></div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-bold tracking-[0.2em] text-xs uppercase">TECTRA PRO</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Memuat Platform...</span>
      </div>
    </div>
  )
}
