"use client"
import { useState } from 'react';
import { Info, Send, AlertTriangle, Home, Ghost, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface IntensityReporterProps {
  earthquakeId: string | number;
  earthquakeTitle: string;
  onClose: () => void;
}

export default function IntensityReporter({ earthquakeId, earthquakeTitle, onClose }: IntensityReporterProps) {
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [impact, setImpact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const levels = [
    { level: 2, label: 'II MMI', icon: <Ghost size={24} />, desc: 'Hampir tidak terasa, hanya oleh orang diam.' },
    { level: 3, label: 'III MMI', icon: <Info size={24} />, desc: 'Terasa di dalam rumah, seperti truk lewat.' },
    { level: 4, label: 'IV MMI', icon: <Home size={24} />, desc: 'Benda tergantung bergoyang, jendela berderit.' },
    { level: 5, label: 'V MMI', icon: <ShieldAlert size={24} />, desc: 'Banyak orang terbangun, barang pecah jatuh.' },
    { level: 6, label: 'VI MMI', icon: <AlertTriangle size={24} />, desc: 'Kerusakan ringan, orang lari keluar.' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          earthquakeId,
          intensity,
          impact
        })
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <CheckCircle2 size={48} className="text-safe" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Laporan Diterima!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Terima kasih. Laporan Anda sangat membantu sistem AI kami dalam memetakan dampak gempa secara real-time.
        </p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Selesai</button>
      </div>
    );
  }

  return (
    <div className="intensity-reporter" style={{ padding: '4px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Laporkan Dampak</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{earthquakeTitle}</p>
      </div>

      {step === 1 ? (
        <>
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '12px' }}>Apa yang Anda rasakan?</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {levels.map((l) => (
              <button
                key={l.level}
                onClick={() => setIntensity(l.level)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: intensity === l.level ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: intensity === l.level ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card-alt)',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ color: intensity === l.level ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '6px' }}>{l.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{l.label}</div>
              </button>
            ))}
          </div>
          
          {intensity && (
            <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {levels.find(l => l.level === intensity)?.desc}
            </div>
          )}

          <button 
            disabled={!intensity}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => setStep(2)}
          >
            Lanjut
          </button>
        </>
      ) : (
        <>
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '12px' }}>Tambahan informasi (opsional)</label>
          <textarea 
            placeholder="Misal: Tembok retak, barang di rak jatuh, dll..."
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'inherit', fontSize: '13px', marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>Kembali</button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 2, gap: '8px' }} 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Mengirim...' : <><Send size={16} /> Kirim Laporan</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
