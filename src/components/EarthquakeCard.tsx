'use client'
import { useState } from 'react'
import { ArrowRight, ZoomIn, ZoomOut, Activity, Layers, MapPin } from 'lucide-react'
import { useBMKG } from '@/hooks/useBMKG'

export default function EarthquakeCard({ fullView = false }: { fullView?: boolean }) {
  const { gempa, loading, error } = useBMKG()
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [scale, setScale] = useState(1)

  const coordinates = (gempa?.Coordinates ?? '0,0').split(',')
  const latitude = parseFloat(coordinates[0] ?? '0')
  const longitude = parseFloat(coordinates[1] ?? '0')
  const latitudeLabel = isFinite(latitude) ? Math.abs(latitude).toFixed(2) : '-'
  const longitudeLabel = isFinite(longitude) ? Math.abs(longitude).toFixed(2) : '-'
  const areaText = gempa?.Wilayah ? gempa.Wilayah.replace(/^pusat gempa berada /i, '') : '-'
  const feltQuake = (gempa?.Potensi ?? '').toLowerCase().includes('dirasakan')
  const shakeMapUrl = gempa
    ? `https://api.codetabs.com/v1/proxy?quest=https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`
    : ''

  return (
    <>
      <section className={`card bmkg-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-body">
          {loading ? (
            <div className="gempa-loading">
              <Activity className="spin" size={24} />
              <p>Memuat data dari BMKG...</p>
            </div>
          ) : gempa ? (
            <div className="gempa-content">
              <div className="shakemap-container" onClick={() => { setIsImageOpen(true); setScale(1) }}
                style={{ cursor: 'zoom-in' }} title="Klik untuk memperbesar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shakeMapUrl} alt="BMKG ShakeMap" />
                <div className="zoom-overlay"><ZoomIn size={32} color="white" /><span>Perbesar Peta</span></div>
              </div>
              <div className="gempa-info-exact">
                <h2 className="gempa-title">Gempa Bumi Terkini</h2>
                <p className="gempa-time">{gempa.Tanggal} • {gempa.Jam}</p>
                {feltQuake && <span className="badge badge-dirasakan">Gempa Dirasakan</span>}
                <h3 className="gempa-pusat">Pusat gempa berada {areaText}</h3>
                <div className="gempa-stats-row">
                  <div className="gempa-stat-box">
                    <span className="gempa-stat-label">Magnitudo:</span>
                    <div className="gempa-stat-value-row">
                      <Activity size={16} className="gempa-stat-icon mag-icon" />
                      <span className="gempa-stat-val mag">{gempa.Magnitude.replace('.', ',')}</span>
                    </div>
                  </div>
                  <div className="gempa-stat-box">
                    <span className="gempa-stat-label">Kedalaman:</span>
                    <div className="gempa-stat-value-row">
                      <Layers size={16} className="gempa-stat-icon depth-icon" />
                      <span className="gempa-stat-val">{gempa.Kedalaman}</span>
                    </div>
                  </div>
                  <div className="gempa-stat-box wide">
                    <span className="gempa-stat-label">Koordinat:</span>
                    <div className="gempa-stat-value-row">
                      <MapPin size={16} className="gempa-stat-icon coord-icon" />
                      <span className="gempa-stat-val">
                        {latitudeLabel} {latitude < 0 ? 'LS' : 'LU'} – {longitudeLabel} {longitude < 0 ? 'BB' : 'BT'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="gempa-saran"><strong>Saran BMKG:</strong> {gempa.Potensi}</p>
                {error && <p className="gempa-fallback-notice">Data cadangan ditampilkan.</p>}
                <div className="bmkg-video-wrap">
                  <p className="bmkg-video-label">📺 Video Resmi BMKG</p>
                  <div className="bmkg-video-frame">
                    <iframe src="https://www.youtube.com/embed/TzFyRdX20xM" title="Video BMKG"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen loading="lazy" />
                  </div>
                </div>
                <a href="https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg" target="_blank" rel="noreferrer" className="lihat-semua">
                  Lihat Semuanya <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {isImageOpen && gempa && (
        <div className="image-modal-overlay" onClick={() => setIsImageOpen(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={() => setScale(s => Math.max(s - 0.5, 1))}><ZoomOut size={16} /> Zoom Out</button>
              <button type="button" className="btn btn-primary" onClick={() => setScale(s => Math.min(s + 0.5, 3))}><ZoomIn size={16} /> Zoom In</button>
              <button type="button" className="close-modal-btn" onClick={() => setIsImageOpen(false)}>Tutup</button>
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
