"use client"
import { useEffect, useState } from 'react'
import { CloudRain, CloudSun, Droplets, ThermometerSun, Wind, AlertTriangle, RefreshCw } from 'lucide-react'

export default function WeatherCard({ type = 'weather', fullView = false }) {
  const isAQI = type === 'aqi'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cuaca')
      if (!res.ok) throw new Error('Gagal memuat data cuaca')
      const json = await res.json()
      setData(json)
      setError('')
    } catch (e) {
      setError(e.message || 'Gagal memuat data cuaca')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather()
    }, 0)
    const id = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(id)
    }
  }, [])

  if (loading && !data) {
    return (
      <section className={`card weather-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-header">
          <h2><CloudSun size={18} /> Cuaca & Iklim Terkini</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '8px' }}>
          <div className="page-loading__spinner" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Memuat data cuaca...</span>
        </div>
      </section>
    )
  }

  if (error && !data) {
    return (
      <section className={`card weather-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-header">
          <h2><CloudSun size={18} /> Cuaca & Iklim Terkini</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-secondary)' }}>
          <AlertTriangle size={20} style={{ color: '#f97316' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>{error}</p>
          <button onClick={fetchWeather} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Coba Lagi
          </button>
        </div>
      </section>
    )
  }

  if (isAQI) {
    const aqi = data?.aqi
    if (!aqi) return null
    return (
      <section className={`card aqi-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-header">
          <h2><Wind size={20} /> Monitoring Kualitas Udara (AQI)</h2>
        </div>
        <div className="card-body">
          <div className="aqi-main">
            <div className="aqi-score-box">
              <span className="aqi-value">{aqi.value}</span>
              <span className="aqi-label" style={{ color: aqi.color }}>{aqi.label}</span>
            </div>
            <div className="aqi-desc">
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {aqi.label === 'BAIK' && 'Kualitas udara baik, cocok untuk aktivitas luar ruangan.'}
                {aqi.label === 'SEDANG' && 'Kualitas udara dapat diterima; namun, bagi beberapa polutan mungkin ada kekhawatiran kesehatan yang moderat bagi sejumlah kecil orang yang sangat peka terhadap pencemaran udara.'}
                {aqi.label === 'TIDAK SEHAT' && 'Kualitas udara tidak sehat untuk kelompok sensitif. Kurangi aktivitas luar ruangan.'}
                {aqi.label === 'BERBAHAYA' && 'Kualitas udara berbahaya bagi semua orang. Hindari aktivitas luar ruangan.'}
                {!['BAIK', 'SEDANG', 'TIDAK SEHAT', 'BERBAHAYA'].includes(aqi.label) && 'Data kualitas udara tidak tersedia.'}
              </p>
            </div>
          </div>
          <div className="pollutant-grid">
            <div className="pollutant-item">
              <span className="p-name">PM2.5</span>
              <span className="p-value">{aqi.pm25 ? `${aqi.pm25} ug/m3` : '-'}</span>
              <div className="p-bar"><div className="p-fill" style={{ width: aqi.pm25 ? `${Math.min((aqi.pm25 / 50) * 100, 100)}%` : '0%', backgroundColor: aqi.color }} /></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">PM10</span>
              <span className="p-value">{aqi.pm10 ? `${aqi.pm10} ug/m3` : '-'}</span>
              <div className="p-bar"><div className="p-fill" style={{ width: aqi.pm10 ? `${Math.min((aqi.pm10 / 100) * 100, 100)}%` : '0%', backgroundColor: aqi.color }} /></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">CO</span>
              <span className="p-value">{aqi.co ? `${aqi.co} ug/m3` : '-'}</span>
              <div className="p-bar"><div className="p-fill" style={{ width: aqi.co ? `${Math.min((aqi.co / 1000) * 100, 100)}%` : '0%', backgroundColor: '#4ade80' }} /></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">NO2</span>
              <span className="p-value">{aqi.no2 ? `${aqi.no2} ug/m3` : '-'}</span>
              <div className="p-bar"><div className="p-fill" style={{ width: aqi.no2 ? `${Math.min((aqi.no2 / 50) * 100, 100)}%` : '0%', backgroundColor: '#4ade80' }} /></div>
            </div>
          </div>
          <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>
            Sumber: {data?.source === 'fallback' ? 'Estimasi (Open-Meteo tidak tersedia)' : 'Open-Meteo'}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`card weather-card ${fullView ? 'full-view' : ''}`}>
      <div className="card-header">
        <h2><CloudSun size={18} /> Cuaca & Iklim Terkini</h2>
        {data?.source === 'fallback' && (
          <span style={{ fontSize: '10px', color: '#f97316', marginLeft: '8px' }}>(estimasi)</span>
        )}
      </div>
      <div className="card-body weather-grid">
        <div className="weather-item">
          <ThermometerSun className="weather-icon" />
          <div className="weather-data">
            <span className="w-label">Suhu</span>
            <span className="w-value">{data?.temperature ?? '-'}&deg;C</span>
          </div>
        </div>
        <div className="weather-item">
          <Droplets className="weather-icon" style={{ color: '#38bdf8' }} />
          <div className="weather-data">
            <span className="w-label">Kelembapan</span>
            <span className="w-value">{data?.humidity ?? '-'}%</span>
          </div>
        </div>
        <div className="weather-item">
          <Wind className="weather-icon" style={{ color: '#94a3b8' }} />
          <div className="weather-data">
            <span className="w-label">Kecepatan Angin</span>
            <span className="w-value">{data?.windSpeed ?? '-'} km/jam</span>
          </div>
        </div>
        <div className="weather-item">
          <CloudRain className="weather-icon" style={{ color: '#818cf8' }} />
          <div className="weather-data">
            <span className="w-label">Prakiraan</span>
            <span className="w-value">{data?.weatherDesc ?? '-'}</span>
          </div>
        </div>
      </div>
      {data?.source !== 'fallback' && (
        <div style={{ padding: '4px 16px 8px', textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.5 }}>
          Sumber: Open-Meteo
        </div>
      )}
    </section>
  )
}
