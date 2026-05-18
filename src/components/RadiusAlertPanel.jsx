"use client"
import { Crosshair, MapPin, Navigation, Radio, ToggleLeft, ToggleRight } from 'lucide-react';
import { RADIUS_OPTIONS } from '@/hooks/useRadiusAlert';

const STATUS_LABEL = {
  idle:        { text: 'Belum aktif',       color: '#94a3b8' },
  requesting:  { text: 'Meminta izin…',     color: '#f59e0b' },
  granted:     { text: 'Lokasi ditemukan',  color: '#10b981' },
  denied:      { text: 'Akses ditolak',     color: '#ef4444' },
  unsupported: { text: 'Tidak didukung',    color: '#ef4444' },
};

/**
 * RadiusAlertPanel
 *
 * Props:
 *  - userLocation: { lat, lon } | null
 *  - locationStatus: string
 *  - radiusKm: number
 *  - radiusEnabled: boolean
 *  - requestLocation(): void
 *  - setRadiusKm(km): void
 *  - toggleRadius(): void
 *  - nearbyCount: number — jumlah gempa dalam radius
 *  - compact: boolean — tampilan ringkas untuk sidebar
 */
export default function RadiusAlertPanel({
  userLocation,
  locationStatus,
  radiusKm,
  radiusEnabled,
  requestLocation,
  setRadiusKm,
  toggleRadius,
  nearbyCount = 0,
  compact = false,
}) {
  const status = STATUS_LABEL[locationStatus] ?? STATUS_LABEL.idle;
  const isActive = radiusEnabled && radiusKm > 0 && locationStatus === 'granted';

  if (compact) {
    // ── Versi ringkas untuk sidebar / topbar ──────────────────────────────
    return (
      <div className="radius-compact" title={isActive ? `Radius ${radiusKm} km aktif — ${nearbyCount} gempa` : 'Radius alert nonaktif'}>
        <button
          type="button"
          className={`radius-compact__btn ${isActive ? 'active' : ''}`}
          onClick={toggleRadius}
          aria-label="Toggle radius alert"
        >
          <Radio size={15} />
          {isActive && nearbyCount > 0 && (
            <span className="radius-compact__badge">{nearbyCount}</span>
          )}
        </button>
      </div>
    );
  }

  // ── Versi penuh untuk panel peta ─────────────────────────────────────────
  return (
    <div className={`radius-panel ${isActive ? 'radius-panel--active' : ''}`}>
      {/* Header */}
      <div className="radius-panel__header">
        <div className="radius-panel__title">
          <Navigation size={14} />
          <span>Radius Alert</span>
          {isActive && nearbyCount > 0 && (
            <span className="radius-panel__badge">{nearbyCount} gempa</span>
          )}
        </div>
        <button
          type="button"
          className="radius-panel__toggle"
          onClick={toggleRadius}
          title={radiusEnabled ? 'Nonaktifkan radius alert' : 'Aktifkan radius alert'}
        >
          {radiusEnabled
            ? <ToggleRight size={22} style={{ color: '#10b981' }} />
            : <ToggleLeft  size={22} style={{ color: '#64748b' }} />}
        </button>
      </div>

      {/* Status lokasi */}
      <div className="radius-panel__location">
        <span className="radius-panel__loc-dot" style={{ background: status.color }} />
        <span className="radius-panel__loc-text" style={{ color: status.color }}>{status.text}</span>
        {locationStatus !== 'granted' && locationStatus !== 'requesting' && (
          <button
            type="button"
            className="radius-panel__loc-btn"
            onClick={requestLocation}
            disabled={locationStatus === 'unsupported'}
          >
            <Crosshair size={12} /> Izinkan
          </button>
        )}
        {locationStatus === 'granted' && userLocation && (
          <span className="radius-panel__coords">
            {userLocation.lat.toFixed(3)}, {userLocation.lon.toFixed(3)}
          </span>
        )}
      </div>

      {/* Radius selector */}
      <div className="radius-panel__options">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`radius-opt-btn ${radiusKm === opt.value ? 'active' : ''}`}
            onClick={() => setRadiusKm(opt.value)}
            disabled={opt.value > 0 && locationStatus !== 'granted'}
            title={opt.value === 0 ? 'Tampilkan semua gempa' : `Hanya gempa dalam ${opt.label}`}
          >
            {opt.value === 0 ? <MapPin size={11} /> : <Radio size={11} />}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Info aktif */}
      {isActive && (
        <div className="radius-panel__info">
          {nearbyCount === 0
            ? `Tidak ada gempa dalam radius ${radiusKm} km dari lokasi Anda`
            : `${nearbyCount} gempa terdeteksi dalam radius ${radiusKm} km`}
        </div>
      )}

      {locationStatus === 'denied' && (
        <div className="radius-panel__warn">
          ⚠️ Izin lokasi ditolak. Buka pengaturan browser → izinkan akses lokasi untuk situs ini.
        </div>
      )}
    </div>
  );
}
