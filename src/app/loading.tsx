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
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(99,102,241,0.4); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bar-loading {
          0% { width: 0%; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0%; left: 100%; }
        }
        .logo-container {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .orbit {
          position: absolute;
          border: 1px solid rgba(99,102,241,0.1);
          border-radius: 50%;
          animation: rotate-slow 10s linear infinite;
        }
      `}</style>

      <div style={{ position: 'relative', marginBottom: '40px' }}>
        {/* Orbit Backgrounds */}
        <div className="orbit" style={{ width: '180px', height: '180px', top: '-42px', left: '-42px' }} />
        <div className="orbit" style={{ width: '240px', height: '240px', top: '-72px', left: '-72px', animationDirection: 'reverse', animationDuration: '15s' }} />
        
        <div className="logo-container" style={{
          width: '96px',
          height: '96px',
          borderRadius: '24px',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            priority
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <h1 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '900',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          margin: '0 0 8px 0.4em',
          background: 'linear-gradient(to right, #fff, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          TECTRA<span style={{ color: '#dc2626', WebkitTextFillColor: '#dc2626' }}> PRO</span>
        </h1>
        
        <p style={{
          color: 'rgba(148,163,184,0.8)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          margin: '0 0 40px 0.5em'
        }}>
          Earthquake Monitoring System
        </p>

        <div style={{ 
          width: '200px', 
          height: '2px', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: '2px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            position: 'absolute',
            height: '100%',
            backgroundColor: '#6366f1',
            boxShadow: '0 0 10px #6366f1',
            animation: 'bar-loading 2s ease-in-out infinite'
          }} />
        </div>
        
        <span style={{
          color: '#64748b',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          Menghubungkan ke Pusat Data...
        </span>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        color: '#334155',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        © 2026 TECTRA PRO · INDONESIA COMMAND CENTER
      </div>
    </div>
  )
}
