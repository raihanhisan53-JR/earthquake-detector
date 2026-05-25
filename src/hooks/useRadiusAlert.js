'use client'
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Haversine distance (km) ───────────────────────────────────────────────────
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Default radius options (km) ───────────────────────────────────────────────
export const RADIUS_OPTIONS = [
  { label: 'Nonaktif', value: 0 },
  { label: '100 km',   value: 100 },
  { label: '250 km',   value: 250 },
  { label: '500 km',   value: 500 },
  { label: '1000 km',  value: 1000 },
];

const LS_KEY = 'quakeguard-radius-alert';

function loadPersistedState() {
  if (typeof window === 'undefined') return { radiusKm: 0, enabled: false };
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      radiusKm: Number.isFinite(raw.radiusKm) ? raw.radiusKm : 0,
      enabled:  typeof raw.enabled === 'boolean' ? raw.enabled : false,
    };
  } catch {
    return { radiusKm: 0, enabled: false };
  }
}

/**
 * useRadiusAlert
 *
 * Menyediakan:
 *  - userLocation: { lat, lon } | null
 *  - locationStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
 *  - radiusKm: number (0 = nonaktif)
 *  - radiusEnabled: boolean
 *  - requestLocation(): void
 *  - setRadiusKm(km): void
 *  - toggleRadius(): void
 *  - filterByRadius(points): points yang dalam radius
 *  - isWithinRadius(lat, lon): boolean
 *  - distanceTo(lat, lon): number | null (km)
 */
export function useRadiusAlert() {
  const persisted = loadPersistedState();

  const [userLocation, setUserLocation]     = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | granted | denied | unsupported
  const [radiusKm, setRadiusKmState]        = useState(persisted.radiusKm);
  const [radiusEnabled, setRadiusEnabled]   = useState(persisted.enabled);
  const watchIdRef = useRef(null);

  // Persist ke localStorage setiap kali berubah
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS_KEY, JSON.stringify({ radiusKm, enabled: radiusEnabled }));
  }, [radiusKm, radiusEnabled]);

  // Minta lokasi & mulai watch
  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('requesting');

    const onSuccess = (pos) => {
      setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      setLocationStatus('granted');
    };

    const onError = () => {
      setLocationStatus('denied');
    };

    const opts = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };

    // One-shot dulu, lalu watch untuk update
    navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      ...opts,
      maximumAge: 5 * 60 * 1000,
    });
  }, []);

  // Auto-request kalau sebelumnya sudah granted (restore session)
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!navigator.permissions) {
      // Fallback: coba langsung
      if (persisted.enabled && persisted.radiusKm > 0) {
        setTimeout(() => requestLocation(), 0);
      }
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        requestLocation();
      } else if (result.state === 'denied') {
        setLocationStatus('denied');
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const setRadiusKm = useCallback((km) => {
    setRadiusKmState(km);
    if (km > 0 && locationStatus !== 'granted') requestLocation();
  }, [locationStatus, requestLocation]);

  const toggleRadius = useCallback(() => {
    setRadiusEnabled((v) => {
      const next = !v;
      if (next && locationStatus !== 'granted') requestLocation();
      return next;
    });
  }, [locationStatus, requestLocation]);

  const distanceTo = useCallback((lat, lon) => {
    if (!userLocation) return null;
    return haversineKm(userLocation.lat, userLocation.lon, lat, lon);
  }, [userLocation]);

  const isWithinRadius = useCallback((lat, lon) => {
    if (!radiusEnabled || radiusKm === 0 || !userLocation) return true; // nonaktif = semua lolos
    const d = haversineKm(userLocation.lat, userLocation.lon, lat, lon);
    return d <= radiusKm;
  }, [radiusEnabled, radiusKm, userLocation]);

  const filterByRadius = useCallback((points) => {
    if (!radiusEnabled || radiusKm === 0 || !userLocation) return points;
    return points.filter((p) => isWithinRadius(p.lat, p.lon));
  }, [radiusEnabled, radiusKm, userLocation, isWithinRadius]);

  return {
    userLocation,
    locationStatus,
    radiusKm,
    radiusEnabled,
    requestLocation,
    setRadiusKm,
    toggleRadius,
    distanceTo,
    isWithinRadius,
    filterByRadius,
  };
}
