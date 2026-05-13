// @ts-nocheck
"use client"
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Activity, AlertTriangle, BarChart2, Clock,
  RefreshCw, TrendingUp, Zap, Globe, Wifi,
  ArrowUp, ArrowDown, Minus,
} from 'lucide-react';

const BMKG_LIST   = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
const BMKG_LATEST = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
const AUTO_REFRESH_MS = 30_000;

const parseF = (v, fb = 0) => { const n = parseFloat(String(v)); return isFinite(n) ? n : fb; };

const getMagColor = (m) => {
  if (m >= 7) return '#dc2626';
  if (m >= 6) return '#ef4444';
  if (m >= 5) return '#f97316';
  if (m >= 4) return '#3b82f6';
  return '#22c55e';
};
const getMagBg = (m) => {
  if (m >= 7) return 'rgba(220,38,38,0.15)';
  if (m >= 6) return 'rgba(239,68,68,0.12)';
  if (m >= 5) return 'rgba(249,115,22,0.12)';
  if (m >= 4) return 'rgba(59,130,246,0.12)';
  return 'rgba(34,197,94,0.12)';
};
const getMagLabel = (m) => {
  if (m >= 7) return 'Major';
  if (m >= 6) return 'Strong';
  if (m >= 5) return 'Moderate';
  if (m >= 4) return 'Light';
  return 'Minor';
};

/* ── Sparkline SVG ── */
function Sparkline({ values, maxVal = 9 }) {
  if (!values || values.length < 2) return null;
  const W = 300, H = 60;
  const pad = 4;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v / maxVal) * (H - pad * 2));
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPath = `M${pts[0][0]},${H} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${pts[pts.length - 1][0]},${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad} y1={H - pad - t * (H - pad * 2)}
          x2={W - pad} y2={H - pad - t * (H - pad * 2)}
          stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4,4"
        />
      ))}
      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      {/* Dots for high magnitude */}
      {pts.map(([x, y], i) => {
        const v = values[i];
        if (v < 5) return null;
        return <circle key={i} cx={x} cy={y} r={3} fill={getMagColor(v)} stroke="var(--bg-card)" strokeWidth={1.5} />;
      })}
      {/* Latest dot */}
      <circle cx={last[0]} cy={last[1]} r={5} fill="#3b82f6" stroke="var(--bg-card)" strokeWidth={2} />
      <circle cx={last[0]} cy={last[1]} r={9} fill="#3b82f6" fillOpacity="0.2" />
    </svg>
  );
}

/* ── Magnitude bar ── */
function MagBar({ mag, max = 9 }) {
  const pct = Math.min((mag / max) * 100, 100);
  return (
    <div className="analitik-magbar">
      <div className="analitik-magbar__fill" style={{ width: `${pct}%`, background: getMagColor(mag) }} />
    </div>
  );
}

/* ── Distribution mini bars ── */
function DistBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="analitik-dist-row">
      <span className="analitik-dist-label" style={{ color }}>{label}</span>
      <div className="analitik-dist-track">
        <div className="analitik-dist-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="analitik-dist-count">{count}</span>
    </div>
  );
}

/* ── AI Feedback Generator ── */
function generateAIFeedback(stats, latest) {
  if (!stats || !latest) return { text: "Menunggu aliran data seismik...", riskLevel: "Loading", color: "#64748b" };
  
  let riskLevel = 'Normal';
  let color = '#22c55e'; // Green
  let text = `Kondisi seismik saat ini cenderung stabil. Rata-rata magnitudo dalam rentang waktu terakhir adalah M${stats.avgMag}. `;
  
  if (stats.above5 > 0) {
    riskLevel = 'Waspada';
    color = '#f97316'; // Orange
    text = `Peningkatan aktivitas tektonik terdeteksi. Terdapat ${stats.above5} gempa menengah (M5+) yang tercatat. `;
  }
  
  if (stats.above6 > 0 || stats.tsunami > 0) {
    riskLevel = 'KRITIS';
    color = '#ef4444'; // Red
    text = `PERINGATAN TINGGI. Terdeteksi gempa mayor (M6+) berpotensi merusak. `;
  }
  
  text += `Titik episentrum terbaru berada di ${latest.Wilayah} (M${parseFloat(latest.Magnitude).toFixed(1)}). ${
    latest.Potensi?.toLowerCase().includes('tsunami') 
      ? 'POTENSI TSUNAMI TERDETEKSI. SEGERA JAUHI PESISIR.' 
      : 'Tidak ada anomali signifikan lanjutan. Tetap pantau informasi.'
  }`;

  return { text, riskLevel, color };
}

export default function AnalitikCard() {
  const [events, setEvents]         = useState([]);
  const [latest, setLatest]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [countdown, setCountdown]   = useState(AUTO_REFRESH_MS / 1000);
  const [error, setError]           = useState('');
  const [pulse, setPulse]           = useState(false);
  const timerRef   = useRef(null);
  const cdTimerRef = useRef(null);
  const cdRef      = useRef(AUTO_REFRESH_MS / 1000);
  const [feltCount, setFeltCount]   = useState(1204);
  const [hasFelt, setHasFelt]       = useState(false);

  // Generate random base count on new latest to simulate active users
  useEffect(() => {
    if (latest) {
      setFeltCount(Math.floor(Math.random() * 5000) + 100);
      setHasFelt(false);
    }
  }, [latest]);

  const handleFeltIt = () => {
    if (!hasFelt) {
      setFeltCount(c => c + 1);
      setHasFelt(true);
    }
  };

  const handleShareWA = () => {
    if (!latest) return;
    const text = `🚨 *PERINGATAN GEMPA M${parseFloat(latest.Magnitude).toFixed(1)}* 🚨\nLokasi: ${latest.Wilayah}\nWaktu: ${latest.Tanggal} ${latest.Jam}\nPotensi: ${latest.Potensi}\n\nPantau live di Dashboard Kebencanaan!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(BMKG_LIST,   { cache: 'no-store' }),
        fetch(BMKG_LATEST, { cache: 'no-store' }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const raw = d1?.Infogempa?.gempa || [];
      if (Array.isArray(raw) && raw.length > 0) {
        setEvents(raw.map((g, i) => ({
          id: i,
          magnitude: parseF(g.Magnitude),
          wilayah:   g.Wilayah   || '-',
          kedalaman: g.Kedalaman || '-',
          potensi:   g.Potensi   || '-',
          jam:       g.Jam       || '-',
          tanggal:   g.Tanggal   || '-',
        })));
      }
      const gempa = d2?.Infogempa?.gempa;
      if (gempa) setLatest(gempa);
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      setError('');
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    } catch {
      setError('Gagal memuat data BMKG. Periksa koneksi internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      cdRef.current = AUTO_REFRESH_MS / 1000;
      setCountdown(AUTO_REFRESH_MS / 1000);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current   = window.setInterval(() => fetchData(), AUTO_REFRESH_MS);
    cdTimerRef.current = window.setInterval(() => {
      cdRef.current -= 1;
      if (cdRef.current < 0) cdRef.current = AUTO_REFRESH_MS / 1000;
      setCountdown(cdRef.current);
    }, 1000);
    return () => {
      window.clearInterval(timerRef.current);
      window.clearInterval(cdTimerRef.current);
    };
  }, [fetchData]);

  const stats = useMemo(() => {
    if (!events.length) return null;
    const mags   = events.map(e => e.magnitude);
    const maxMag = Math.max(...mags);
    const avgMag = mags.reduce((a, b) => a + b, 0) / mags.length;
    const above7 = events.filter(e => e.magnitude >= 7).length;
    const above6 = events.filter(e => e.magnitude >= 6 && e.magnitude < 7).length;
    const above5 = events.filter(e => e.magnitude >= 5 && e.magnitude < 6).length;
    const above4 = events.filter(e => e.magnitude >= 4 && e.magnitude < 5).length;
    const below4 = events.filter(e => e.magnitude < 4).length;
    const tsunami = events.filter(e => e.potensi?.toLowerCase().includes('tsunami')).length;
    return { total: events.length, maxMag: maxMag.toFixed(1), avgMag: avgMag.toFixed(2), above7, above6, above5, above4, below4, tsunami };
  }, [events]);

  const sparkData = useMemo(
    () => events.slice(0, 20).reverse().map(e => e.magnitude),
    [events],
  );

  const ringPct = (countdown / (AUTO_REFRESH_MS / 1000)) * 100;
  const RING_R = 9, RING_C = 2 * Math.PI * RING_R;

  const latestMag = latest ? parseF(latest.Magnitude) : 0;
  
  const aiAnalysis = useMemo(() => generateAIFeedback(stats, latest), [stats, latest]);

  return (
    <section className="analitik-wrap">
      {/* ── HEADER ── */}
      <div className="analitik-header">
        <div className="analitik-header__left">
          <div className="analitik-header__icon">
            <BarChart2 size={18} />
          </div>
          <div>
            <h2 className="analitik-header__title">Analitik &amp; Tren Gempa</h2>
            <p className="analitik-header__sub">Data real-time BMKG · Diperbarui otomatis</p>
          </div>
        </div>
        <div className="analitik-header__right">
          {lastUpdate && (
            <span className="analitik-header__time">
              <Clock size={11} /> {lastUpdate}
            </span>
          )}
          {/* Countdown ring */}
          <div className="analitik-countdown" title={`Refresh dalam ${countdown}s`}>
            <svg width={24} height={24} viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={12} cy={12} r={RING_R} fill="none" stroke="var(--border-color)" strokeWidth={2.5} />
              <circle
                cx={12} cy={12} r={RING_R} fill="none"
                stroke="#3b82f6" strokeWidth={2.5}
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - ringPct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <span>{countdown}s</span>
          </div>
          <button
            type="button"
            className="analitik-refresh-btn"
            disabled={loading || refreshing}
            onClick={() => fetchData(true)}
          >
            <RefreshCw size={13} className={refreshing ? 'refresh-spin' : ''} />
            {refreshing ? 'Memuat…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="analitik-error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="analitik-loading">
          <div className="page-loading__spinner" />
          <span>Memuat data BMKG…</span>
        </div>
      ) : (
        <div className={`analitik-body ${pulse ? 'analitik-body--pulse' : ''}`}>

          {/* ── STAT CARDS ── */}
          <div className="analitik-stats">
            {[
              {
                icon: <Globe size={20} />,
                label: 'Total Gempa',
                value: stats?.total ?? '–',
                sub: 'dalam 15 data terakhir',
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.08)',
              },
              {
                icon: <Zap size={20} />,
                label: 'Magnitudo Tertinggi',
                value: `M ${stats?.maxMag ?? '–'}`,
                sub: getMagLabel(parseF(stats?.maxMag)),
                color: getMagColor(parseF(stats?.maxMag)),
                bg: getMagBg(parseF(stats?.maxMag)),
              },
              {
                icon: <TrendingUp size={20} />,
                label: 'Rata-rata Magnitudo',
                value: `M ${stats?.avgMag ?? '–'}`,
                sub: 'rata-rata 15 gempa',
                color: '#f97316',
                bg: 'rgba(249,115,22,0.08)',
              },
              {
                icon: <AlertTriangle size={20} />,
                label: 'Potensi Tsunami',
                value: stats?.tsunami ?? '–',
                sub: stats?.tsunami > 0 ? 'perlu diwaspadai' : 'tidak terdeteksi',
                color: stats?.tsunami > 0 ? '#ef4444' : '#22c55e',
                bg: stats?.tsunami > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              },
            ].map((s, i) => (
              <div key={i} className="analitik-stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
                <div className="analitik-stat-card__icon">{s.icon}</div>
                <div className="analitik-stat-card__value">{s.value}</div>
                <div className="analitik-stat-card__label">{s.label}</div>
                <div className="analitik-stat-card__sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── AI SEISMIC ANALYST (PREMIUM FEATURE) ── */}
          <div className="ai-analyst-panel" style={{ 
            background: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(12px)',
            border: `1px solid ${aiAnalysis.color}40`,
            borderLeft: `4px solid ${aiAnalysis.color}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: `0 8px 32px 0 ${aiAnalysis.color}15`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: aiAnalysis.color, fontWeight: 'bold', fontSize: '0.95rem' }}>
                <Zap size={18} className="pulse-icon" /> AI Seismic Analyst
              </div>
              <span style={{ background: `${aiAnalysis.color}20`, color: aiAnalysis.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Status: {aiAnalysis.riskLevel}
              </span>
            </div>
            <p style={{ color: 'var(--text-color)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              {aiAnalysis.text}
            </p>
          </div>

          {/* ── MAIN CONTENT GRID ── */}
          <div className="analitik-grid">

            {/* Left: Sparkline only */}
            <div className="analitik-grid__left">
              {/* Sparkline */}
              <div className="analitik-panel" style={{ flex: 1 }}>
                <div className="analitik-panel__header">
                  <Activity size={14} />
                  <span>Tren Magnitudo</span>
                  <span className="analitik-panel__tag">20 gempa terakhir</span>
                  {refreshing && <span className="analitik-panel__live">● live</span>}
                </div>
                <div className="analitik-sparkline-wrap">
                  <Sparkline values={sparkData} maxVal={9} />
                </div>
                <div className="analitik-sparkline-axis">
                  <span>← Lebih lama</span>
                  <span>Terbaru →</span>
                </div>
              </div>

              {/* Distribution — di bawah sparkline mengisi ruang kosong */}
              <div className="analitik-panel" style={{ flex: 1 }}>
                <div className="analitik-panel__header">
                  <BarChart2 size={14} />
                  <span>Distribusi Magnitudo</span>
                </div>
                <div className="analitik-dist">
                  <DistBar label="M ≥ 7 (Major)"    count={stats?.above7 ?? 0} total={stats?.total ?? 1} color="#dc2626" />
                  <DistBar label="M 6–7 (Strong)"   count={stats?.above6 ?? 0} total={stats?.total ?? 1} color="#ef4444" />
                  <DistBar label="M 5–6 (Moderate)" count={stats?.above5 ?? 0} total={stats?.total ?? 1} color="#f97316" />
                  <DistBar label="M 4–5 (Light)"    count={stats?.above4 ?? 0} total={stats?.total ?? 1} color="#3b82f6" />
                  <DistBar label="M &lt; 4 (Minor)"    count={stats?.below4 ?? 0} total={stats?.total ?? 1} color="#22c55e" />
                </div>
              </div>
            </div>

            {/* Right: Latest + List */}
            <div className="analitik-grid__right">
              {/* Latest earthquake highlight */}
              {latest && (
                <div className="analitik-latest" style={{ '--latest-color': getMagColor(latestMag), '--latest-bg': getMagBg(latestMag) }}>
                  <div className="analitik-latest__badge">
                    <Wifi size={10} /> LIVE
                  </div>
                  <div className="analitik-latest__mag">
                    M{latestMag.toFixed(1)}
                  </div>
                  <div className="analitik-latest__info">
                    <div className="analitik-latest__label">{getMagLabel(latestMag)}</div>
                    <div className="analitik-latest__wilayah">{latest.Wilayah}</div>
                    <div className="analitik-latest__meta">
                      <Clock size={11} /> {latest.Tanggal} · {latest.Jam}
                    </div>
                    <div className="analitik-latest__meta">
                      Kedalaman {latest.Kedalaman}
                    </div>
                    <div className="analitik-latest__potensi">
                      {latest.Potensi?.toLowerCase().includes('tsunami')
                        ? <><AlertTriangle size={11} /> {latest.Potensi}</>
                        : latest.Potensi}
                    </div>
                    
                    {/* Community & Share Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={handleFeltIt}
                        style={{ 
                          flex: 1, 
                          padding: '8px', 
                          borderRadius: '8px', 
                          border: hasFelt ? `1px solid ${getMagColor(latestMag)}` : '1px solid var(--border-color)',
                          background: hasFelt ? `${getMagColor(latestMag)}20` : 'rgba(0,0,0,0.2)',
                          color: 'var(--text-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: hasFelt ? 'bold' : 'normal',
                          transition: 'all 0.2s'
                        }}
                      >
                        ✋ {hasFelt ? 'Anda merasakannya' : 'Saya Merasakan Gempa!'} 
                        <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({feltCount.toLocaleString()})</span>
                      </button>
                      <button 
                        onClick={handleShareWA}
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: 'none',
                          background: '#25D366',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                      >
                        Share WA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Earthquake list */}
              <div className="analitik-panel analitik-panel--list">
                <div className="analitik-panel__header">
                  <Globe size={14} />
                  <span>15 Gempa Terbaru</span>
                  <span className="analitik-panel__tag">diperbarui tiap 30 detik</span>
                </div>
                <div className="analitik-list">
                  {events.slice(0, 15).map((ev) => (
                    <div key={ev.id} className="analitik-list-item">
                      <div
                        className="analitik-list-item__mag"
                        style={{ color: getMagColor(ev.magnitude), background: getMagBg(ev.magnitude) }}
                      >
                        {ev.magnitude.toFixed(1)}
                      </div>
                      <div className="analitik-list-item__info">
                        <span className="analitik-list-item__wilayah">{ev.wilayah}</span>
                        <span className="analitik-list-item__meta">{ev.kedalaman} · {ev.jam}</span>
                      </div>
                      <MagBar mag={ev.magnitude} />
                      <span
                        className="analitik-list-item__label"
                        style={{ color: getMagColor(ev.magnitude), background: getMagBg(ev.magnitude) }}
                      >
                        {getMagLabel(ev.magnitude)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
