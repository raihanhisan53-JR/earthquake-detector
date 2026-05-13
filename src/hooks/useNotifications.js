"use client"
/**
 * useNotifications — Real-time earthquake & sensor notification system
 * Sources: BMKG (primary), USGS (secondary), ESP32 (local sensor)
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const BMKG_URL  = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
const USGS_URL  = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson';
const PROXY_BMKG = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
const PROXY_USGS = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson');

const BMKG_INTERVAL_MS  = 30_000;  // 30 detik
const USGS_INTERVAL_MS  = 60_000;  // 1 menit
const MAX_NOTIFICATIONS = 50;

const MAG_LEVEL = (m) => {
  if (m >= 7) return { label: 'Major',    color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   icon: '🔴' };
  if (m >= 6) return { label: 'Strong',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   icon: '🟠' };
  if (m >= 5) return { label: 'Moderate', color: '#f97316', bg: 'rgba(249,115,22,0.10)',  icon: '🟡' };
  if (m >= 4) return { label: 'Light',    color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  icon: '🔵' };
  return               { label: 'Minor',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   icon: '🟢' };
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

export function useNotifications({ esp32AlertLevel = 0, esp32Connected = false, notificationsEnabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [panelOpen, setPanelOpen]         = useState(false);

  // Track seen IDs to avoid duplicates
  const seenRef        = useRef(new Set());
  const prevEsp32Ref   = useRef(0);
  const bmkgTimerRef   = useRef(null);
  const usgsTimerRef   = useRef(null);

  const addNotification = useCallback((notif) => {
    const id = notif.id || makeId(notif.source, Date.now());
    if (seenRef.current.has(id)) return;
    seenRef.current.add(id);

    const full = { ...notif, id, timestamp: Date.now(), read: false };

    setNotifications((prev) => [full, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount((n) => n + 1);

    // Browser push notification ke laptop/desktop
    if (
      notificationsEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window
    ) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(notif.title, {
            body: notif.body,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: id,
            requireInteraction: notif.magnitude >= 6, // gempa besar tetap tampil sampai diklik
          });
        } catch { /* ignore */ }
      } else if (Notification.permission === 'default') {
        // Minta izin otomatis saat ada gempa pertama
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              new Notification(notif.title, {
                body: notif.body,
                icon: '/logo.svg',
                tag: id,
              });
            } catch { /* ignore */ }
          }
        });
      }
    }
  }, [notificationsEnabled]);

  // ── BMKG polling ──
  const fetchBMKG = useCallback(async () => {
    try {
      let data;
      // Try direct first (works if CORS allowed), then proxy
      try {
        data = await fetchJSON(BMKG_URL, 5000);
      } catch {
        data = await fetchJSON(PROXY_BMKG, 8000);
      }

      const g = data?.Infogempa?.gempa;
      if (!g) return;

      const mag   = parseFloat(g.Magnitude) || 0;
      const id    = makeId('bmkg', `${g.Tanggal}-${g.Jam}-${g.Magnitude}`);
      const level = MAG_LEVEL(mag);

      if (mag >= 4.0) {
        addNotification({
          id,
          source: 'BMKG',
          sourceColor: '#f59e0b',
          title: `${level.icon} Gempa M${mag.toFixed(1)} — BMKG`,
          body: `${g.Wilayah} · ${g.Jam} · ${g.Kedalaman}`,
          magnitude: mag,
          location: g.Wilayah,
          depth: g.Kedalaman,
          time: g.Jam,
          date: g.Tanggal,
          potensi: g.Potensi,
          level,
          type: 'earthquake',
        });
      }
    } catch { /* silent fail */ }
  }, [addNotification]);

  // ── USGS polling ──
  const fetchUSGS = useCallback(async () => {
    try {
      let data;
      try {
        data = await fetchJSON(USGS_URL, 8000);
      } catch {
        data = await fetchJSON(PROXY_USGS, 10000);
      }

      const features = data?.features || [];

      // Filter Indonesia region: lat -11 to 6, lon 95 to 141
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
          source: 'USGS',
          sourceColor: '#3b82f6',
          title: `${level.icon} Gempa M${mag.toFixed(1)} — USGS`,
          body: `${p.place} · ${time}`,
          magnitude: mag,
          location: p.place,
          depth: `${Math.round(f.geometry?.coordinates?.[2] || 0)} km`,
          time,
          date: new Date(p.time).toLocaleDateString('id-ID'),
          potensi: mag >= 7 ? 'Berpotensi tsunami' : 'Tidak berpotensi tsunami',
          level,
          type: 'earthquake',
          url: p.url,
        });
      });
    } catch { /* silent fail */ }
  }, [addNotification]);

  // ── ESP32 sensor alert ──
  useEffect(() => {
    const prev = prevEsp32Ref.current;
    if (esp32AlertLevel > 0 && prev === 0 && esp32Connected) {
      const level = esp32AlertLevel >= 4 ? 'BAHAYA' : esp32AlertLevel >= 2 ? 'WASPADA' : 'MINOR';
      addNotification({
        id: makeId('esp32', Date.now()),
        source: 'ESP32',
        sourceColor: '#a855f7',
        title: `⚡ Getaran Terdeteksi — Sensor Lokal`,
        body: `Level ${esp32AlertLevel} · Status: ${level}`,
        magnitude: null,
        level: { label: level, color: esp32AlertLevel >= 4 ? '#ef4444' : '#f97316', bg: 'rgba(168,85,247,0.1)', icon: '⚡' },
        type: 'sensor',
      });
    }
    prevEsp32Ref.current = esp32AlertLevel;
  }, [esp32AlertLevel, esp32Connected, addNotification]);

  // ── Request permission on mount ──
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      // Minta izin notifikasi saat pertama kali load
      Notification.requestPermission();
    }
  }, []);

  // ── Start polling ──
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

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    markAllRead();
  }, [markAllRead]);

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
