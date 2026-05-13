"use client"
﻿import { CloudRain, CloudSun, Droplets, ThermometerSun, Wind } from 'lucide-react';

export default function WeatherCard({ type, fullView }) {
  const isAQI = type === 'aqi';

  if (isAQI) {
    return (
      <section className={`card aqi-card ${fullView ? 'full-view' : ''}`}>
        <div className="card-header">
          <h2><Wind size={20} /> Monitoring Kualitas Udara (AQI)</h2>
        </div>
        <div className="card-body">
          <div className="aqi-main">
            <div className="aqi-score-box">
              <span className="aqi-value">72</span>
              <span className="aqi-label">MODERAT</span>
            </div>
            <div className="aqi-desc">
              <p>Kualitas udara dapat diterima; namun, bagi beberapa polutan mungkin ada kekhawatiran kesehatan yang moderat bagi sejumlah kecil orang yang sangat peka terhadap pencemaran udara.</p>
            </div>
          </div>

          <div className="pollutant-grid">
            <div className="pollutant-item">
              <span className="p-name">PM2.5</span>
              <span className="p-value">22.4 ug/m3</span>
              <div className="p-bar"><div className="p-fill" style={{ width: '40%', backgroundColor: '#facc15' }}></div></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">PM10</span>
              <span className="p-value">38.1 ug/m3</span>
              <div className="p-bar"><div className="p-fill" style={{ width: '30%', backgroundColor: '#4ade80' }}></div></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">CO</span>
              <span className="p-value">410 ug/m3</span>
              <div className="p-bar"><div className="p-fill" style={{ width: '15%', backgroundColor: '#4ade80' }}></div></div>
            </div>
            <div className="pollutant-item">
              <span className="p-name">NO2</span>
              <span className="p-value">12.5 ug/m3</span>
              <div className="p-bar"><div className="p-fill" style={{ width: '20%', backgroundColor: '#4ade80' }}></div></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`card weather-card ${fullView ? 'full-view' : ''}`}>
      <div className="card-header">
        <h2><CloudSun size={18} /> Cuaca & Iklim Terkini</h2>
      </div>
      <div className="card-body weather-grid">
        <div className="weather-item">
          <ThermometerSun className="weather-icon" />
          <div className="weather-data">
            <span className="w-label">Suhu</span>
            <span className="w-value">31 C</span>
          </div>
        </div>
        <div className="weather-item">
          <Droplets className="weather-icon" style={{ color: '#38bdf8' }} />
          <div className="weather-data">
            <span className="w-label">Kelembapan</span>
            <span className="w-value">72%</span>
          </div>
        </div>
        <div className="weather-item">
          <Wind className="weather-icon" style={{ color: '#94a3b8' }} />
          <div className="weather-data">
            <span className="w-label">Kecepatan Angin</span>
            <span className="w-value">12 km/jam</span>
          </div>
        </div>
        <div className="weather-item">
          <CloudRain className="weather-icon" style={{ color: '#818cf8' }} />
          <div className="weather-data">
            <span className="w-label">Prakiraan</span>
            <span className="w-value">Cerah Berawan</span>
          </div>
        </div>
      </div>
    </section>
  );
}
