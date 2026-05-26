import Image from 'next/image'

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      textAlign: 'center'
    }}>
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '24px',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 50px rgba(99,102,241,0.15)',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          zIndex: 10,
          overflow: 'hidden'
        }}>
          <Image 
            src="/logo-v2.png" 
            alt="Logo TECTRA PRO" 
            width={64} 
            height={64} 
            style={{ objectFit: 'contain' }}
            className="animate-pulse"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-indigo-600 rounded-3xl animate-ping opacity-10 blur-2xl"></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: '900',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          margin: '0 0 8px 0.3em'
        }}>
          TECTRA<span style={{ color: '#dc2626' }}> PRO</span>
        </h1>
        
        <p style={{
          color: 'rgba(129,140,248,0.8)',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          margin: '0 0 24px 0.4em'
        }}>
          Sistem Deteksi Gempa Terpadu
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
          <span style={{
            color: '#64748b',
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }} className="animate-pulse">
            Memuat Platform...
          </span>
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '32px',
        color: '#475569',
        fontSize: '9px',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        © 2026 TECTRA PRO INDONESIA
      </div>
    </div>
  )
}
