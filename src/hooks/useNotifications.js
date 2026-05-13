"use client"
/**
 * useNotifications — Real-time earthquake & sensor notification system
 * Sources: BMKG (primary), USGS (secondary), ESP32 (local sensor)
 * Features: Browser Push Notifications + Web Audio Siren
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const BMKG_URL   = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
const USGS_URL   = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson';
const PROXY_BMKG = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
const PROXY_USGS = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson');

const BMKG_INTERVAL_MS  = 30_000;
const USGS_INTERVAL_MS  = 60_000;
const MAX_NOTIFICATIONS = 50;

const MAG_LEVEL = (m) => {
  if (m >= 7) return { label: 'Major',    color: '#dc2626', bg: 'rgba(220,38,38,0.12)',  icon: '🔴' };
  if (m >= 6) return { label: 'Strong',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: '🟠' };
  if (m >= 5) return { label: 'Moderate', color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: '🟡' };
  if (m >= 4) return { label: 'Light',    color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', icon: '🔵' };
  return              { label: 'Minor',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: '🟢' };
};

const makeId = (source, key) => `${source}::${key}`;

async function fetchJSON(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(tid);
  }
}

// ══════════════════════════════════════════════════════
// WEB AUDIO SIREN — menggunakan Web Audio API
// Bunyi sirine naik-turun selama durasi tertentu
// ══════════════════════════════════════════════════════
function playSiren({ durationMs = 4000, level = 1 } = {}) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Volume berdasarkan level bahaya
    const volume = level >= 4 ? 0.5 : level >= 2 ? 0.35 : 0.2;
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    // Fade out di akhir
    gain.gain.setValueAtTime(volume, ctx.currentTime + durationMs / 1000 - 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);

    osc.type = 'sawtooth';

    // Sweep sirine: naik dari 440Hz ke 880Hz dan turun, berulang
    const now    = ctx.currentTime;
    const sweepHz = level >= 4 ? 0.35 : 0.5; // detik per sweep
    const sweepCount = Math.ceil(durationMs / 1000 / sweepHz);

    for (let i = 0; i < sweepCount; i++) {
      const t = now + i * sweepHz;
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + sweepHz * 0.5);
      osc.frequency.linearRampToValueAtTime(440, t + sweepHz);
    }

    osc.start(now);
    osc.stop(now + durationMs / 1000);

    // Cleanup
    osc.onended = () => {
      try { gain.disconnect(); osc.disconnect(); ctx.close(); } catch { /* ignore */ }
    };
  } catch (err) {
    console.warn('[Siren] Web Audio gagal:', err);
  }
}

// Sirine pendek untuk notifikasi ringan
function playBeep() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx  = new AudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => { try { ctx.close(); } catch { /* ignore */ } };
  } catch { /* ignore */ }
}

export function useNotifications({
  esp32AlertLevel = 0,
  esp32Connected  = false,
  notificationsEnabled = true,
  sirenEnabled = true,
} = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [panelOpen, setPanelOpen]         = useState(false);

  const seenRef       = useRef(new Set());
  const prevEsp32Ref  = useRef(0);
  const bmkgTimerRef  = useRef(null);
  const usgsTimerRef  = useRef(null);
  // Track siren state untuk mencegah spam
  const sirenActiveRef = useRef(false);

  const addNotification = useCallback((notif) => {
    const id = notif.id || makeId(notif.source, Date.now());
    if (seenRef.current.has(id)) return;
    seenRef.current.add(id);

    const full = { ...notif, id, timestamp: Date.now(), read: false };
    setNotifications((prev) => [full, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount((n) => n + 1);

    // ── Browser Push Notification ke laptop/desktop ──
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(notif.title, {
            body: notif.body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: id,
            requireInteraction: (notif.magnitude ?? 0) >= 6 || notif.source === 'ESP32',
          });
        } catch { /* ignore */ }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try { new Notification(notif.title, { body: notif.body, icon: '/logo.png', tag: id }); }
            catch { /* ignore */ }
          }
        });
      }
    }

    // ── Web Audio Siren ──
    if (sirenEnabled && !sirenActiveRef.current) {
      const mag   = notif.magnitude ?? 0;
      const level = notif.level?.label;

      if (notif.source === 'ESP32') {
        // Sensor lokal: sirine penuh
        sirenActiveRef.current = true;
        playSiren({ durationMs: 5000, level: esp32AlertLevel });
        setTimeout(() => { sirenActiveRef.current = false; }, 6000);
      } else if (mag >= 7 || level === 'Major') {
        // Gempa besar: sirine panjang
        sirenActiveRef.current = true;
        playSiren({ durationMs: 6000, level: 4 });
        setTimeout(() => { sirenActiveRef.current = false; }, 7000);
      } else if (mag >= 5) {
        // Gempa sedang: sirine pendek
        sirenActiveRef.current = true;
        playSiren({ durationMs: 3000, level: 2 });
        setTimeout(() => { sirenActiveRef.current = false; }, 4000);
      } else if (mag >= 4) {
        // Gempa ringan: beep saja
        playBeep();
      }
    }
  }, [notificationsEnabled, sirenEnabled, esp32AlertLevel]);

  // ── BMKG polling ──
  const fetchBMKG = useCallback(async () => {
    try {
      let data;
      try { data = await fetchJSON(BMKG_URL, 5000); }
      catch { data = await fetchJSON(PROXY_BMKG, 8000); }

      const g = data?.Infogempa?.gempa;
      if (!g) return;

      const mag   = parseFloat(g.Magnitude) || 0;
      const id    = makeId('bmkg', `${g.Tanggal}-${g.Jam}-${g.Magnitude}`);
      const level = MAG_LEVEL(mag);

      if (mag >= 4.0) {
        addNotification({
          id,
          source:      'BMKG',
          sourceColor: '#f59e0b',
          title:       `${level.icon} Gempa M${mag.toFixed(1)} — BMKG`,
          body:        `${g.Wilayah} · ${g.Jam} · ${g.Kedalaman}`,
          magnitude:   mag,
          location:    g.Wilayah,
          depth:       g.Kedalaman,
          time:        g.Jam,
          date:        g.Tanggal,
          potensi:     g.Potensi,
          level,
          type:        'earthquake',
        });
      }
    } catch { /* silent fail */ }
  }, [addNotification]);

  // ── USGS polling — filter wilayah Indonesia ──
  const fetchUSGS = useCallback(async () => {
    try {
      let data;
      try { data = await fetchJSON(USGS_URL, 8000); }
      catch { data = await fetchJSON(PROXY_USGS, 10000); }

      const features = data?.features || [];

      // Filter: Indonesia lat -11 to 6, lon 95 to 141
      const indonesia = features.filter((f) => {
        const [lon, lat] = f.geometry?.coordinates || [];
        return lat >= -11 && lat <= 6 && lon >= 95 && lon <= 141;
      });

      indonesia.forEach((f) => {
        const p   = f.properties;
        const mag = p.mag || 0;
        if (mag < 4.0) return;

        const id    = makeId('usgs', f.id);
        const level = MAG_LEVEL(mag);
        const time  = new Date(p.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        addNotification({
          id,
          source:      'USGS',
          sourceColor: '#3b82f6',
          title:       `${level.icon} Gempa M${mag.toFixed(1)} — USGS`,
          body:        `${p.place} · ${time}`,
          magnitude:   mag,
          location:    p.place,
          depth:       `${Math.round(f.geometry?.coordinates?.[2] || 0)} km`,
          time,
          date:        new Date(p.time).toLocaleDateString('id-ID'),
          potensi:     mag >= 7 ? 'Berpotensi tsunami' : 'Tidak berpotensi tsunami',
          level,
          type:        'earthquake',
          url:         p.url,
        });
      });
    } catch { /* silent fail */ }
  }, [addNotification]);

  // ── ESP32 sensor alert ──
  useEffect(() => {
    const prev = prevEsp32Ref.current;

    if (esp32AlertLevel > 0 && prev === 0 && esp32Connected) {
      const lv = esp32AlertLevel;
      const levelLabel = lv >= 4 ? 'BAHAYA' : lv >= 2 ? 'WASPADA' : 'MINOR';

      addNotification({
        id:          makeId('esp32', Date.now()),
        source:      'ESP32',
        sourceColor: '#a855f7',
        title:       `⚡ Getaran Terdeteksi — Sensor Lokal`,
        body:        `Level ${lv} · Status: ${levelLabel} · Sensor MPU6500`,
        magnitude:   null,
        level: {
          label: levelLabel,
          color: lv >= 4 ? '#ef4444' : '#f97316',
          bg:    'rgba(168,85,247,0.1)',
          icon:  '⚡',
        },
        type: 'sensor',
      });
    }

    prevEsp32Ref.current = esp32AlertLevel;
  }, [esp32AlertLevel, esp32Connected, addNotification]);

  // ── Minta izin notifikasi saat pertama mount ──
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Start polling BMKG & USGS ──
  useEffect(() => {
    fetchBMKG();
    fetchUSGS();
    bmkgTimerRef.current = setInterval(fetchBMKG, BMKG_INTERVAL_MS);
    usgsTimerRef.current = setInterval(fetchUSGS, USGS_INTERVAL_MS);
    return () => {
      clearInterval(bmkgTimerRef.current);
      clearInterval(usgsTimerRef.current);
    };
  }, [fetchBMKG, fetchUSGS]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    seenRef.current.clear();
  }, []);

  const openPanel  = useCallback(() => { setPanelOpen(true); markAllRead(); }, [markAllRead]);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return {
    notifications,
    unreadCount,
    panelOpen,
    openPanel,
    closePanel,
    markAllRead,
    clearAll,
    addNotification,
  };
}
