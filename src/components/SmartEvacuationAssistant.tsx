"use client"
import React, { useState } from 'react';
import { Shield, MapPin, Navigation, Info, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

export default function SmartEvacuationAssistant({ userLocation }) {
  const { t, lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState('safe-zones');

  const safeZones = [
    { name: 'Alun-alun Kota', type: 'Titik Kumpul', dist: '1.2 km', status: 'Terbuka' },
    { name: 'Stadion Utama', type: 'Shelter Utama', dist: '2.5 km', status: 'Terbuka' },
    { name: 'RSUD Daerah', type: 'Rumah Sakit', dist: '3.1 km', status: 'Siaga' },
  ];

  const emergencyContacts = [
    { name: 'SAR / BASARNAS', phone: '115' },
    { name: 'Ambulans / Emergency', phone: '118' },
    { name: 'Polisi', phone: '110' },
    { name: 'Pemadam Kebakaran', phone: '113' },
  ];

  const openInMaps = (query) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation?.lat},${userLocation?.lon},15z`;
    window.open(url, '_blank');
  };

  return (
    <div className="card evacuation-assistant">
      <div className="card-header">
        <h2><Shield size={18} className="text-safe" /> {lang === 'en' ? 'Smart Evacuation Assistant' : 'Asisten Evakuasi Pintar'}</h2>
      </div>

      <div className="assistant-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveCategory('safe-zones')}
          style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeCategory === 'safe-zones' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeCategory === 'safe-zones' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          Safe Zones
        </button>
        <button 
          onClick={() => setActiveCategory('contacts')}
          style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeCategory === 'contacts' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeCategory === 'contacts' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          Emergency
        </button>
      </div>

      {activeCategory === 'safe-zones' && (
        <div className="assistant-content">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {userLocation 
              ? `Menampilkan area aman di sekitar lokasi Anda (${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)})`
              : 'Aktifkan lokasi untuk melihat rute evakuasi terdekat.'}
          </p>
          
          <div className="safe-zones-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {safeZones.map((zone, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{zone.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{zone.type} · {zone.dist}</div>
                </div>
                <button 
                  onClick={() => openInMaps(zone.name)}
                  style={{ padding: '8px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <Navigation size={14} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={() => openInMaps('Titik Kumpul Terdekat')}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', gap: '8px' }}
          >
            <MapPin size={16} /> Cari di Google Maps
          </button>
        </div>
      )}

      {activeCategory === 'contacts' && (
        <div className="assistant-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {emergencyContacts.map((contact, i) => (
              <a 
                key={i} 
                href={`tel:${contact.phone}`}
                style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
              >
                <div style={{ color: 'var(--danger)', marginBottom: '4px' }}><Phone size={20} style={{ margin: '0 auto' }} /></div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{contact.name}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent)' }}>{contact.phone}</div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '12px' }}>
            <AlertTriangle size={24} className="text-danger" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>Prosedur Darurat:</strong> Tetap tenang, jauhi bangunan tinggi/kaca, dan cari area terbuka. Ikuti instruksi petugas setempat.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
