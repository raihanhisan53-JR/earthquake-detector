"use client"
import { useState } from 'react';
import { ExternalLink, Maximize2, Video, X, Play, Tv2, Wind, AlertCircle } from 'lucide-react';

// ════════════════════════════════════════════════════════
// FEED CONFIG
// YouTube embeds: gunakan video ID langsung (bukan channel live_stream)
// Windy embeds: sudah reliable
// ════════════════════════════════════════════════════════
const CCTV_FEEDS = [
  // ── Premium Link – Volcano & Seismic ──────────────────────────────────────────────
  {
    id: 'yt-merapi',
    title: 'Live CCTV Gunung Merapi',
    location: 'Jawa Tengah · BPPTKG',
    type: 'premium-link',
    image: '/images/cctv_merapi.png',
    directUrl: 'https://www.youtube.com/@bpptkg',
    color: '#ef4444',
    badge: 'LIVE · MERAPI',
    icon: '🌋',
    desc: 'Pantauan CCTV resmi Gunung Merapi oleh BPPTKG (Balai Penyelidikan dan Pengembangan Teknologi Kebencanaan Geologi)',
  },
  {
    id: 'yt-semeru',
    title: 'Live CCTV Gunung Semeru',
    location: 'Jawa Timur · PVMBG',
    type: 'premium-link',
    image: '/images/cctv_semeru.png',
    directUrl: 'https://www.youtube.com/results?search_query=live+cctv+semeru+pvmbg',
    color: '#f59e0b',
    badge: 'LIVE · SEMERU',
    icon: '🌋',
    desc: 'Pantauan visual real-time aktivitas Gunung Semeru, Lumajang — sumber PVMBG/MAGMA Indonesia.',
  },
  {
    id: 'yt-seismik',
    title: 'Live Seismograph Global 24/7',
    location: 'Global · USGS',
    type: 'premium-link',
    image: '/images/cctv_seismic.png',
    directUrl: 'https://www.youtube.com/results?search_query=live+earthquake+seismograph+24+7',
    color: '#8b5cf6',
    badge: 'LIVE · SEISMIK',
    icon: '📡',
    desc: 'Rekaman seismograf bumi secara live 24 jam — memperlihatkan gelombang seismik dari gempa di seluruh dunia.',
  },

  // ── Windy (always-on embeds) ────────────────────────────────────────────
  {
    id: 'windy-pressure',
    title: 'Tekanan Atmosfer & Isobar',
    location: 'Indonesia · Windy',
    type: 'embed',
    embedUrl: 'https://embed.windy.com/embed2.html?lat=-2.5&lon=118&detailLat=-6.2&detailLon=106.8&width=650&height=450&zoom=4&level=surface&overlay=pressure&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1',
    directUrl: 'https://www.windy.com/?pressure,-2.5,118,4',
    color: '#3b82f6',
    badge: 'WINDY · TEKANAN',
    icon: '🌡️',
    desc: 'Peta tekanan atmosfer & isobar real-time kawasan Indonesia dari model ECMWF.',
  },
  {
    id: 'windy-thunder',
    title: 'Petir & Badai Petir',
    location: 'Indonesia · Windy',
    type: 'embed',
    embedUrl: 'https://embed.windy.com/embed2.html?lat=-2.5&lon=118&detailLat=-6.2&detailLon=106.8&width=650&height=450&zoom=4&level=surface&overlay=thunder&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1',
    directUrl: 'https://www.windy.com/?thunder,-2.5,118,4',
    color: '#eab308',
    badge: 'WINDY · PETIR',
    icon: '⚡',
    desc: 'Pemantauan aktivitas petir dan badai petir secara real-time di kepulauan Indonesia.',
  },
  {
    id: 'windy-sst',
    title: 'Suhu Permukaan Laut (SST)',
    location: 'Perairan Indonesia · Windy',
    type: 'embed',
    embedUrl: 'https://embed.windy.com/embed2.html?lat=-2.5&lon=118&detailLat=-6.2&detailLon=106.8&width=650&height=450&zoom=4&level=surface&overlay=sst&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1',
    directUrl: 'https://www.windy.com/?sst,-2.5,118,4',
    color: '#06b6d4',
    badge: 'WINDY · SST',
    icon: '🌊',
    desc: 'Suhu permukaan laut real-time di perairan Indonesia — penting untuk deteksi dini anomali oseanografi.',
  },
];

const GROUPS = [
  { id: 'all',     label: 'Semua' },
  { id: 'volcano', label: '🌋 Gunung Api' },
  { id: 'seismic', label: '📡 Seismik' },
  { id: 'weather', label: '🌤️ Cuaca' },
];

const FEED_GROUP = {
  'yt-merapi':       'volcano',
  'yt-semeru':       'volcano',
  'yt-seismik':      'seismic',
  'windy-pressure':  'weather',
  'windy-thunder':   'weather',
  'windy-sst':       'weather',
};

// ── Premium Dashboard Link card ──────────────────────────────────────────────
function PremiumLinkCard({ feed }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.open(feed.directUrl, '_blank')}
      onKeyDown={(e) => e.key === 'Enter' && window.open(feed.directUrl, '_blank')}
      title="Buka sumber streaming resmi di tab baru"
      style={{
        flex: 1,
        minHeight: '220px',
        backgroundImage: `url(${feed.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f0f0f',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Dark overlay for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)'}
      />

      {/* Button overlay */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: 0.9, transition: 'opacity 0.2s' }} className="premium-link-hover">
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <ExternalLink size={24} color="white" />
        </div>
        <span style={{
          fontSize: '0.75rem', color: '#fff', fontWeight: 600,
          background: 'rgba(0,0,0,0.6)', padding: '6px 14px',
          borderRadius: '20px', backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.15)',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Buka Stream Resmi
        </span>
      </div>

      {/* Live badge */}
      <div style={{
        position: 'absolute', bottom: '8px', left: '8px', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(0,0,0,0.7)', padding: '4px 10px',
        borderRadius: '12px', fontSize: '0.68rem',
        color: feed.color || '#ef4444', fontWeight: 700, letterSpacing: '0.05em',
        border: `1px solid ${feed.color}40`,
        boxShadow: `0 0 10px ${feed.color}20`
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: feed.color || '#ef4444', display: 'inline-block',
          animation: 'blink 1.5s infinite',
        }} />
        LIVE
      </div>
    </div>
  );
}


// ── Windy embed card ────────────────────────────────────────────────────────
function EmbedFeed({ feed }) {
  return (
    <div className="cctv-frame cctv-frame--embed">
      <iframe
        src={feed.embedUrl}
        title={feed.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ width: '100%', height: '100%', minHeight: '220px', border: 'none', display: 'block' }}
      />
    </div>
  );
}

// ── Fullscreen overlay ──────────────────────────────────────────────────────
function FullscreenModal({ feed, onClose }) {
  const [loaded, setLoaded] = useState(feed.type === 'embed');
  const isPremiumLink = feed.type === 'premium-link';
  const embedUrl = feed.type === 'youtube-click'
    ? `https://www.youtube-nocookie.com/embed/${feed.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`
    : feed.embedUrl;

  return (
    <div className="cctv-modal" onClick={onClose}>
      <div className="cctv-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="cctv-modal__header">
          <div className="cctv-modal__title">
            <span className="cctv-badge" style={{ color: feed.color }}>● {feed.badge}</span>
            <span>{feed.title}</span>
            <small>📍 {feed.location}</small>
          </div>
          <div className="cctv-modal__controls">
            <a href={feed.directUrl} target="_blank" rel="noreferrer" className="cctv-action-btn" title="Buka di tab baru">
              <ExternalLink size={15} />
            </a>
            <button type="button" className="cctv-action-btn close-btn" onClick={onClose} title="Tutup">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="cctv-modal__body">
          {isPremiumLink ? (
            <div
              style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', cursor: 'pointer', position: 'relative' }}
              onClick={() => window.open(feed.directUrl, '_blank')}
            >
              <img
                src={feed.image}
                alt={feed.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <ExternalLink size={36} color="white" />
                  </div>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Buka di tab baru</span>
                </div>
              </div>
            </div>
          ) : loaded ? (
            <div className="cctv-frame cctv-frame--embed" style={{ height: '100%' }}>
              <iframe
                src={embedUrl}
                title={feed.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none', display: 'block' }}
              />
            </div>
          ) : (
            <div
              style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#0f0f0f', cursor: 'pointer', position: 'relative' }}
              onClick={() => setLoaded(true)}
            >
              <img
                src={`https://img.youtube.com/vi/${feed.videoId}/mqdefault.jpg`}
                alt={feed.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239,68,68,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(239,68,68,0.5)' }}>
                  <Play size={30} fill="white" color="white" style={{ marginLeft: '4px' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Klik untuk memuat live stream</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LiveCCTVCard() {
  const [fullscreenId, setFullscreenId] = useState(null);
  const [activeGroup, setActiveGroup] = useState('all');

  const filteredFeeds = activeGroup === 'all'
    ? CCTV_FEEDS
    : CCTV_FEEDS.filter((f) => FEED_GROUP[f.id] === activeGroup);

  const fullscreenFeed = CCTV_FEEDS.find((f) => f.id === fullscreenId) || null;

  return (
    <>
      <section className="card full-width cctv-section">
        {/* Header */}
        <div className="card-header">
          <h2><Tv2 size={18} /> Pemantauan Live Streaming</h2>
          <span className="cctv-section__tag">YouTube · Windy · BMKG</span>
        </div>

        {/* Filter tabs */}
        <div className="cctv-filter-tabs">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`cctv-filter-tab ${activeGroup === g.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="cctv-grid cctv-grid--3col">
          {filteredFeeds.map((feed) => (
            <div key={feed.id} className="cctv-card">
              {/* Card header bar */}
              <div className="cctv-card__header">
                <span className="cctv-badge" style={{ color: feed.color }}>● {feed.badge}</span>
                <div className="cctv-card__actions">
                  <a
                    href={feed.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cctv-action-btn"
                    title="Buka di tab baru"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    className="cctv-action-btn"
                    title="Layar penuh"
                    onClick={() => setFullscreenId(feed.id)}
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Content */}
              {feed.type === 'premium-link'
                ? <PremiumLinkCard feed={feed} />
                : feed.type === 'youtube-click'
                ? <YouTubeClickCard feed={feed} />
                : <EmbedFeed feed={feed} />
              }

              {/* Footer */}
              <div className="cctv-card__footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{feed.icon}</span>
                  <span className="cctv-card__title">{feed.title}</span>
                </div>
                <span className="cctv-card__location">📍 {feed.location}</span>
                <p className="cctv-card__desc">{feed.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="cctv-disclaimer">
          ⚡ YouTube: klik thumbnail untuk memuat live stream langsung. Windy: memuat otomatis. Ketersediaan bergantung pada penyedia konten masing-masing.
        </p>
      </section>

      {fullscreenFeed && (
        <FullscreenModal feed={fullscreenFeed} onClose={() => setFullscreenId(null)} />
      )}
    </>
  );
}
