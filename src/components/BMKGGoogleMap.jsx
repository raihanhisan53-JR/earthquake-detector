"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import { useBMKGMap } from '@/hooks/useBMKGMap'
import { AlertTriangle, Layers, List, MapPin, RefreshCcw, Search, X } from 'lucide-react'

// ─── Tile Layers (Google Maps + fallback) ────────────────────────────────────
const TILE_LAYERS = {
  dark: {
    label: '🌑 OSM Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20,
  },
  street: {
    label: '🏙️ OSM Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 20,
  },
  googleSat: {
    label: '🛰️ Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  googleHybrid: {
    label: '🗺️ Google Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  terrain: {
    label: '⛰️ OSM Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap &copy; OpenTopoMap',
    maxZoom: 17,
  },
  satellite: {
    label: '🛰️ Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getMagColor = (mag) => {
  if (mag >= 6) return { fill: '#ef4444', stroke: '#dc2626' }
  if (mag >= 5) return { fill: '#f97316', stroke: '#ea580c' }
  if (mag >= 4) return { fill: '#f59e0b', stroke: '#d97706' }
  if (mag >= 3) return { fill: '#22c55e', stroke: '#16a34a' }
  return { fill: '#3b82f6', stroke: '#2563eb' }
}

const getMagLabel = (mag) => {
  if (mag >= 6) return { label: 'Major', color: '#ef4444' }
  if (mag >= 5) return { label: 'Moderate', color: '#f97316' }
  if (mag >= 4) return { label: 'Light', color: '#f59e0b' }
  if (mag >= 3) return { label: 'Minor', color: '#22c55e' }
  return { label: 'Micro', color: '#3b82f6' }
}

const getRadius = (mag) => Math.min(22, Math.max(5, mag * 2.8))

function GoogleMapSearchBox({ onSelectLocation, onClear }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
    }
    setSearching(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    onClear()
  }

  return (
    <div className="google-search-container">
      <form onSubmit={handleSearch} className="google-search-form">
        <button type="submit" className="google-search-btn" disabled={searching}>
          <Search size={18} />
        </button>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari kota atau daerah..."
          className="google-search-input"
        />
        {query && (
          <>
            <button type="button" className="google-search-btn" onClick={handleClear}>
              <X size={18} />
            </button>
            <div className="google-search-divider" />
          </>
        )}
      </form>
      {results.length > 0 && (
        <ul className="google-search-results">
          {results.map((r, i) => (
            <li
              key={i}
              className="google-search-result-item"
              onClick={() => {
                onSelectLocation({
                  lat: parseFloat(r.lat),
                  lon: parseFloat(r.lon),
                  name: r.display_name
                })
                setResults([])
              }}
            >
              <MapPin size={16} style={{ color: '#ef4444' }} />
              <div>
                <strong>{r.display_name.split(',')[0]}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {r.display_name.split(',').slice(1).join(',')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BMKGGoogleMap() {
  const { points, bmkgPoints, loading, error, refresh } = useBMKGMap()
  const [tileKey, setTileKey] = useState('dark')
  const [minMag, setMinMag] = useState(3)
  const [source, setSource] = useState('BMKG')
  const [query, setQuery] = useState('')
  const [showList, setShowList] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [searchMarker, setSearchMarker] = useState(null)
  const mapRef = useRef(null)

  // Filter points
  const activePoints = useMemo(() => {
    const base = source === 'BMKG' ? bmkgPoints : points
    return base.filter(p => {
      const matchMag = p.magnitude >= minMag
      const matchQ = !query.trim() ||
        p.wilayah?.toLowerCase().includes(query.toLowerCase()) ||
        String(p.magnitude).includes(query)
      return matchMag && matchQ
    })
  }, [points, bmkgPoints, source, minMag, query])

  const sortedList = useMemo(() =>
    [...activePoints].sort((a, b) => b.magnitude - a.magnitude).slice(0, 60),
    [activePoints]
  )

  const latestPoint = activePoints[0] ?? null

  const flyTo = (lat, lon, zoom = 8) => {
    const map = mapRef.current
    if (map && lat && lon) {
      map.flyTo([lat, lon], zoom, { duration: 1.2 })
    }
  }

  // Stats
  const stats = useMemo(() => ({
    total: activePoints.length,
    major: activePoints.filter(p => p.magnitude >= 6).length,
    moderate: activePoints.filter(p => p.magnitude >= 5 && p.magnitude < 6).length,
    light: activePoints.filter(p => p.magnitude >= 4 && p.magnitude < 5).length,
  }), [activePoints])

  const tile = TILE_LAYERS[tileKey]

  return (
    <div className="bmkg-map-root">
      {/* ── Header ── */}
      <div className="bmkg-map-header">
        <div className="bmkg-map-header-left">
          <MapPin size={18} style={{ color: '#ef4444' }} />
          <span className="bmkg-map-title">Peta Interaktif — Lokasi Gempa BMKG</span>
          <span className={`bmkg-map-badge ${loading ? 'loading' : ''}`}>
            {loading ? '⏳ Memuat...' : `● ${activePoints.length} titik aktif`}
          </span>
        </div>

        <div className="bmkg-map-header-right">
          {/* Source filter */}
          <select
            className="bmkg-map-select"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            <option value="BMKG">BMKG Only</option>
            <option value="Semua">BMKG + USGS</option>
          </select>

          {/* Magnitude filter */}
          <select
            className="bmkg-map-select"
            value={minMag}
            onChange={e => setMinMag(Number(e.target.value))}
          >
            <option value={2}>≥ M2.0</option>
            <option value={3}>≥ M3.0</option>
            <option value={4}>≥ M4.0</option>
            <option value={5}>≥ M5.0</option>
            <option value={6}>≥ M6.0</option>
          </select>

          {/* Tile Layer */}
          <select
            className="bmkg-map-select"
            value={tileKey}
            onChange={e => setTileKey(e.target.value)}
          >
            {Object.entries(TILE_LAYERS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Refresh */}
          <button
            className="bmkg-map-btn"
            onClick={() => refresh({ cacheBust: true })}
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCcw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          {/* Toggle list */}
          <button
            className={`bmkg-map-btn ${showList ? 'active' : ''}`}
            onClick={() => setShowList(v => !v)}
            title="Toggle daftar"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="bmkg-stats-bar">
        {[
          { label: 'Total', value: stats.total, color: '#60a5fa' },
          { label: '≥M6 Major', value: stats.major, color: '#ef4444' },
          { label: 'M5-6 Moderate', value: stats.moderate, color: '#f97316' },
          { label: 'M4-5 Light', value: stats.light, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="bmkg-stat-item">
            <span className="bmkg-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="bmkg-stat-label">{s.label}</span>
          </div>
        ))}
        {latestPoint && (
          <div className="bmkg-stat-latest">
            <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
            <span>Terbaru: <strong>M{latestPoint.magnitude?.toFixed(1)}</strong> — {latestPoint.wilayah?.slice(0, 40)}</span>
            <button
              className="bmkg-stat-goto"
              onClick={() => flyTo(latestPoint.lat, latestPoint.lon, 9)}
            >Lihat →</button>
          </div>
        )}
      </div>

      {/* ── Body: Map + Sidebar ── */}
      <div className="bmkg-map-body">
        {/* Map */}
        <div className="bmkg-map-canvas">
          <GoogleMapSearchBox
            onSelectLocation={(loc) => {
              setSearchMarker(loc)
              flyTo(loc.lat, loc.lon, 11)
            }}
            onClear={() => {
              setSearchMarker(null)
            }}
          />
          {typeof window !== 'undefined' && (
            <MapContainer
              center={[-2.5, 118]}
              zoom={5}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
              zoomControl={false}
              scrollWheelZoom={true}
            >
              <TileLayer
                key={tileKey}
                url={tile.url}
                attribution={tile.attribution}
                maxZoom={tile.maxZoom}
              />
              <ZoomControl position="bottomright" />

              {/* Search marker */}
              {searchMarker && (
                <CircleMarker
                  center={[searchMarker.lat, searchMarker.lon]}
                  radius={12}
                  pathOptions={{
                    color: '#fff',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.9,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <div className="bmkg-popup-inner" style={{ minWidth: '150px' }}>
                      <div className="bmkg-popup-loc" style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        📍 {searchMarker.name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {searchMarker.name}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {activePoints.map(point => {
                const { fill, stroke } = getMagColor(point.magnitude)
                const r = getRadius(point.magnitude)
                const isSelected = selectedId === point.id
                const isLatest = point === activePoints[0]

                return (
                  <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lon]}
                    radius={isSelected ? r + 4 : r}
                    pathOptions={{
                      color: isSelected ? '#fff' : stroke,
                      fillColor: fill,
                      fillOpacity: isSelected ? 0.95 : 0.72,
                      weight: isSelected ? 3 : isLatest ? 2.5 : 1.5,
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedId(point.id)
                      },
                    }}
                  >
                    <Popup className="bmkg-popup">
                      <div className="bmkg-popup-inner">
                        <div className="bmkg-popup-mag" style={{ color: fill }}>
                          M {point.magnitude?.toFixed(1)}
                          <span className="bmkg-popup-level">{getMagLabel(point.magnitude).label}</span>
                        </div>
                        <div className="bmkg-popup-loc">{point.wilayah}</div>
                        <div className="bmkg-popup-meta">
                          <span>📅 {point.waktu}</span>
                          <span>📍 {point.lat?.toFixed(3)}, {point.lon?.toFixed(3)}</span>
                          {point.kedalaman && <span>⬇️ Kedalaman: {point.kedalaman}</span>}
                          {point.potensi && <span>⚠️ {point.potensi}</span>}
                          {point.source && <span className="bmkg-popup-src">{point.source}</span>}
                        </div>
                        <button
                          className="bmkg-popup-zoom"
                          onClick={() => flyTo(point.lat, point.lon, 10)}
                          style={{ marginBottom: '8px' }}
                        >
                          🔍 Zoom ke lokasi ini
                        </button>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 8px',
                              background: '#2563eb',
                              color: '#fff',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontSize: '11px',
                              fontWeight: '600',
                              textAlign: 'center'
                            }}
                          >
                            🗺️ Google Maps
                          </a>
                          <a
                            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${point.lat},${point.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 8px',
                              background: '#ea580c',
                              color: '#fff',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontSize: '11px',
                              fontWeight: '600',
                              textAlign: 'center'
                            }}
                          >
                            🚗 Street View
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          )}

          {/* Legend overlay */}
          <div className="bmkg-legend">
            <div className="bmkg-legend-title"><Layers size={11} /> Magnitudo</div>
            {[
              { label: '≥ M6', color: '#ef4444' },
              { label: 'M5-6', color: '#f97316' },
              { label: 'M4-5', color: '#f59e0b' },
              { label: 'M3-4', color: '#22c55e' },
              { label: '< M3', color: '#3b82f6' },
            ].map(l => (
              <div key={l.label} className="bmkg-legend-item">
                <span className="bmkg-legend-dot" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Error overlay */}
          {error && !loading && (
            <div className="bmkg-error-overlay">
              <AlertTriangle size={18} />
              <span>Gagal memuat data: {error}</span>
              <button className="bmkg-map-btn" onClick={() => refresh({ cacheBust: true })}>Coba lagi</button>
            </div>
          )}
        </div>

        {/* ── Sidebar List ── */}
        {showList && (
          <div className="bmkg-sidebar">
            <div className="bmkg-sidebar-head">
              <div className="bmkg-search">
                <Search size={13} />
                <input
                  type="search"
                  placeholder="Cari wilayah..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery('')}><X size={12} /></button>
                )}
              </div>
              <span className="bmkg-sidebar-count">{sortedList.length} gempa</span>
            </div>

            <div className="bmkg-sidebar-list">
              {sortedList.length === 0 ? (
                <div className="bmkg-sidebar-empty">
                  <MapPin size={28} />
                  <p>Tidak ada data</p>
                </div>
              ) : sortedList.map(point => {
                const { fill } = getMagColor(point.magnitude)
                const { label } = getMagLabel(point.magnitude)
                const isSelected = selectedId === point.id
                return (
                  <div
                    key={point.id}
                    className={`bmkg-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedId(point.id)
                      flyTo(point.lat, point.lon, 9)
                    }}
                  >
                    <div className="bmkg-list-mag" style={{ background: `${fill}22`, color: fill }}>
                      M{point.magnitude?.toFixed(1)}
                    </div>
                    <div className="bmkg-list-info">
                      <div className="bmkg-list-loc">{point.wilayah?.slice(0, 45) || '-'}</div>
                      <div className="bmkg-list-meta">
                        <span className="bmkg-list-badge" style={{ color: fill }}>{label}</span>
                        {point.kedalaman && <span>{point.kedalaman}</span>}
                        {point.waktu && <span>{point.waktu?.slice(0, 16)}</span>}
                      </div>
                    </div>
                    {point.source && (
                      <span className="bmkg-list-src">{point.source}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
