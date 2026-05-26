import { Activity } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative z-10">
          <Activity className="text-white animate-pulse" size={32} strokeWidth={2.5} />
        </div>
        <div className="absolute inset-0 bg-indigo-500 rounded-2xl animate-ping opacity-20"></div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className="text-slate-400 font-medium tracking-widest text-sm uppercase">Memuat Platform</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
