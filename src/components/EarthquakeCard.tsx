'use client'
import { useState, useEffect } from 'react'
import { Activity, ArrowRight, ExternalLink, Layers, MapPin, ZoomIn, ZoomOut, Compass, Loader2 } from 'lucide-react'
import { useBMKG } from '@/hooks/useBMKG'

export default function EarthquakeCard({ fullView = false }: { fullView?: boolean }) {
  const { gempa, loading, error } = useBMKG()
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [mapTab, setMapTab] = useState<'bmkg' | 'location'>('bmkg')

  // --- NEW FEATURE: Jarak Lokasi ---
  const [userLoc, setUserLoc] = useState<{lat: number, lon: number} | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  const checkDistance = () => {
    setLocLoading(true)
    setLocError('')
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude
          const uLon = position.coords.longitude
          setUserLoc({ lat: uLat, lon: uLon })
          
          const coords = (gempa?.Coordinates ?? '0,0').split(',')
          const eqLat = parseFloat(coords[0] ?? '0')
          const eqLon = parseFloat(coords[1] ?? '0')

          if (eqLat !== 0 && eqLon !== 0) {
            // Haversine formula
            const R = 6371 // Radius bumi dalam km
            const dLat = (eqLat - uLat) * Math.PI / 180
            const dLon = (eqLon - uLon) * Math.PI / 180
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(uLat * Math.PI / 180) * Math.cos(eqLat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            setDistance(R * c)
          }
          setLocLoading(false)
        },
        (error) => {
          setLocError('Akses lokasi ditolak atau gagal. Pastikan GPS aktif.')
          setLocLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocError('Browser Anda tidak mendukung fitur lokasi.')
      setLocLoading(false)
    }
  }

  const coordinates = (gempa?.Coordinates ?? '0,0').split(',')
  const latitude  = parseFloat(coordinates[0] ?? '0')
  const longitude = parseFloat(coordinates[1] ?? '0')
  const latLabel  = isFinite(latitude)  ? Math.abs(latitude).toFixed(3)  : '-'
  const lonLabel  = isFinite(longitude) ? Math.abs(longitude).toFixed(3) : '-'
  const areaText  = gempa?.Wilayah ? gempa.Wilayah.replace(/^pusat gempa berada /i, '') : '-'
  const feltQuake = (gempa?.Potensi ?? '').toLowerCase().includes('dirasakan')
  const shakeMapUrl = gempa
    ? `https://api.codetabs.com/v1/proxy?quest=https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`
    : ''

  // Google Maps embed — Gedung BMKG Pusat Jakarta (tanpa API key)
  const bmkgBuildingEmbed = `https://maps.google.com/maps?q=Badan+Meteorologi+Klimatologi+dan+Geofisika+Jakarta&z=17&output=embed`

  // Magnitude color
  const mag = parseFloat(gempa?.Magnitude ?? '0')
  const magColor = mag >= 6 ? '#ef4444' : mag >= 5 ? '#f97316' : mag >= 4 ? '#f59e0b' : '#22c55e'
  const magLabel = mag >= 6 ? 'Major' : mag >= 5 ? 'Moderate' : mag >= 4 ? 'Light' : 'Minor'

  return (
    <>
      <section className={`card bmkg-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="gempa-loading">
              <Activity className="spin" size={24} />
              <p>Memuat data dari BMKG...</p>
            </div>
          ) : gempa ? (
            <div className="eq-card-layout">

              {/* ── LEFT: ShakeMap + mini info ── */}
              <div className="eq-card-left">
                {/* ShakeMap */}
                <div
                  className="eq-shakemap-wrap"
                  onClick={() => { setIsImageOpen(true); setScale(1) }}
                  title="Klik untuk perbesar"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shakeMapUrl} alt="BMKG ShakeMap" className="eq-shakemap-img" />
                  <div className="eq-shakemap-overlay">
                    <ZoomIn size={24} color="white" />
                    <span>Perbesar</span>
                  </div>
                </div>

                {/* Magnitude badge */}
                <div className="eq-mag-badge" style={{ background: `${magColor}18`, borderColor: `${magColor}44` }}>
                  <span className="eq-mag-num" style={{ color: magColor }}>{gempa.Magnitude}</span>
                  <div>
                    <div className="eq-mag-label" style={{ color: magColor }}>SR · {magLabel}</div>
                    <div className="eq-mag-sub">Magnitudo</div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="eq-stats-grid">
                  <div className="eq-stat">
                    <Layers size={14} style={{ color: '#60a5fa' }} />
                    <div>
                      <div className="eq-stat-label">Kedalaman</div>
                      <div className="eq-stat-value">{gempa.Kedalaman}</div>
                    </div>
                  </div>
                  <div className="eq-stat">
                    <MapPin size={14} style={{ color: '#34d399' }} />
                    <div>
                      <div className="eq-stat-label">Koordinat</div>
                      <div className="eq-stat-value">
                        {latLabel}{latitude < 0 ? '°LS' : '°LU'}, {lonLabel}{longitude < 0 ? '°BB' : '°BT'}
                      </div>
                    </div>
                  </div>
                  <div className="eq-stat">
                    <Activity size={14} style={{ color: '#f59e0b' }} />
                    <div>
                      <div className="eq-stat-label">Waktu</div>
                      <div className="eq-stat-value">{gempa.Jam} WIB</div>
                    </div>
                  </div>
                  <div className="eq-stat">
                    <Activity size={14} style={{ color: '#a78bfa' }} />
                    <div>
                      <div className="eq-stat-label">Tanggal</div>
                      <div className="eq-stat-value">{gempa.Tanggal}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Info + Maps ── */}
              <div className="eq-card-right">
                {/* Header */}
                <div className="eq-card-header">
                  <div className="eq-card-title-row">
                    <div>
                      <h2 className="eq-title">Gempa Bumi Terkini</h2>
                      <p className="eq-subtitle">Data resmi BMKG · Diperbarui otomatis</p>
                    </div>
                    {feltQuake && (
                      <span className="eq-badge-felt">Gempa Dirasakan</span>
                    )}
                  </div>
                  <p className="eq-location">{areaText}</p>

                  {/* FEATURE: Jarak Lokasi ke Pusat Gempa */}
                  <div className="eq-distance-box" style={{ marginTop: '12px', marginBottom: '12px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Compass size={18} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Jarak ke Pusat Gempa</span>
                      </div>
                      {!distance && !locLoading && (
                        <button onClick={checkDistance} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}>
                          Cek Jarak Saya
                        </button>
                      )}
                    </div>
                    
                    {locLoading && (
                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={14} className="spin" /> Mengambil lokasi GPS presisi...
                      </div>
                    )}
                    
                    {locError && (
                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#ef4444' }}>
                        ⚠ {locError}
                      </div>
                    )}
                    
                    {distance !== null && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: distance < 100 ? '#ef4444' : distance < 300 ? '#f59e0b' : '#22c55e', lineHeight: 1 }}>
                          {distance.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KM</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {distance < 100 ? (
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>Sangat Dekat (Waspada!)</span>
                          ) : distance < 300 ? (
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Jarak Sedang</span>
                          ) : (
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Cukup Jauh (Aman)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {error && <p className="eq-fallback-notice">⚠ Data cadangan ditampilkan.</p>}
                  {gempa.Potensi && (
                    <div className="eq-potensi">
                      <span className="eq-potensi-label">Saran BMKG:</span>
                      <span>{gempa.Potensi}</span>
                    </div>
                  )}
                </div>

                {/* ── Maps Tab: Lokasi Gempa vs Gedung BMKG ── */}
                <div className="eq-map-section">
                  <div className="eq-map-tabs">
                    <button
                      className={`eq-map-tab ${mapTab === 'bmkg' ? 'active' : ''}`}
                      onClick={() => setMapTab('bmkg')}
                    >
                      🏛️ Gedung BMKG
                    </button>
                    <button
                      className={`eq-map-tab ${mapTab === 'location' ? 'active' : ''}`}
                      onClick={() => setMapTab('location')}
                    >
                      📍 Lokasi Gempa
                    </button>
                  </div>

                  <div className="eq-map-frame">
                    {mapTab === 'bmkg' ? (
                      <>
                        <iframe
                          src={bmkgBuildingEmbed}
                          title="Gedung BMKG Jakarta"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                        <a
                          href="https://maps.google.com/maps?q=Badan+Meteorologi+Klimatologi+dan+Geofisika+Jakarta"
                          target="_blank"
                          rel="noreferrer"
                          className="eq-map-open-link"
                        >
                          <ExternalLink size={12} /> Buka di Google Maps
                        </a>
                      </>
                    ) : (
                      <>
                        <iframe
                          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=9&output=embed`}
                          title="Lokasi Gempa"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                        <a
                          href={`https://maps.google.com/maps?q=${latitude},${longitude}&z=9`}
                          target="_blank"
                          rel="noreferrer"
                          className="eq-map-open-link"
                        >
                          <ExternalLink size={12} /> Buka di Google Maps
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer links */}
                <div className="eq-footer-links">
                  <a href="https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg"
                    target="_blank" rel="noreferrer" className="eq-footer-link">
                    BMKG Resmi <ArrowRight size={13} />
                  </a>
                  <a href="https://goo.gl/maps/BMKG" target="_blank" rel="noreferrer"
                    className="eq-footer-link eq-footer-link--maps">
                    <ExternalLink size={13} /> Google Maps BMKG
                  </a>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </section>

      {/* ── ShakeMap Modal ── */}
      {isImageOpen && gempa && (
        <div className="image-modal-overlay" onClick={() => setIsImageOpen(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary"
                onClick={() => setScale(s => Math.max(s - 0.5, 1))}>
                <ZoomOut size={16} /> Zoom Out
              </button>
              <button type="button" className="btn btn-primary"
                onClick={() => setScale(s => Math.min(s + 0.5, 3))}>
                <ZoomIn size={16} /> Zoom In
              </button>
              <button type="button" className="close-modal-btn"
                onClick={() => setIsImageOpen(false)}>Tutup</button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '80vh', display: 'flex', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shakeMapUrl} alt="ShakeMap BMKG"
                style={{ transform: `scale(${scale})`, transition: 'transform 0.2s', transformOrigin: 'top center' }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
