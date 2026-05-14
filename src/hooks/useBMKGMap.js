"use client"
import { useCallback, useEffect, useRef, useState } from 'react';
import { appendIncident } from '@/utils/incidentLog';

const parseDepthKm = (raw) => {
  const m = String(raw ?? '').match(/(\d+(?:[.,]\d+)?)\s*km/i);
  if (!m) return null;
  const v = Number.parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};

const FALLBACK_POINTS = [
  { id: 'fallback-1', lat: -6.2, lon: 106.8, magnitude: 3.5, wilayah: 'Jakarta dan sekitarnya', waktu: 'Data cadangan', kedalaman: '35 km', depthKm: 35, region: 'Jawa', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
  { id: 'fallback-2', lat: -8.65, lon: 115.22, magnitude: 4.1, wilayah: 'Bali', waktu: 'Data cadangan', kedalaman: '12 km', depthKm: 12, region: 'Bali-Nusa Tenggara', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
];

const BMKG_URL = '/api/bmkg-dirasakan';
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

const buildCodetabsBmkgUrl = (cacheBust) => {
  return cacheBust ? `${BMKG_URL}?ts=${Date.now()}` : BMKG_URL;
};

const fetchWithTimeout = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const tid = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(tid);
  }
};

const parseMagnitude = (raw) => {
  const v = Number.parseFloat(String(raw ?? '').replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};

const parseCoordinates = (raw) => {
  if (!raw) return null;
  const plain = String(raw).match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (plain) {
    const lat = Number.parseFloat(plain[1]);
    const lon = Number.parseFloat(plain[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  }
  const indo = String(raw).match(/(\d+(?:\.\d+)?)\s*(LS|LU)\s*[-,]?\s*(\d+(?:\.\d+)?)\s*(BT|BB)/i);
  if (!indo) return null;
  const latBase = Number.parseFloat(indo[1]);
  const lonBase = Number.parseFloat(indo[3]);
  if (!Number.isFinite(latBase) || !Number.isFinite(lonBase)) return null;
  return {
    lat: indo[2].toUpperCase() === 'LS' ? -latBase : latBase,
    lon: indo[4].toUpperCase() === 'BB' ? -lonBase : lonBase,
  };
};

const sortByEpochDesc = (list) =>
  [...list].sort((a, b) => {
    const ta = Number.isFinite(a.epochMs) ? a.epochMs : Number.NEGATIVE_INFINITY;
    const tb = Number.isFinite(b.epochMs) ? b.epochMs : Number.NEGATIVE_INFINITY;
    return tb - ta;
  });

const inferRegion = (wilayah = '') => {
  const a = wilayah.toLowerCase();
  if (a.includes('sumatera') || a.includes('aceh') || a.includes('nias') || a.includes('mentawai')) return 'Sumatera';
  if (a.includes('jawa') || a.includes('banten') || a.includes('jakarta') || a.includes('yogyakarta')) return 'Jawa';
  if (a.includes('kalimantan') || a.includes('pontianak') || a.includes('banjarmasin')) return 'Kalimantan';
  if (a.includes('sulawesi') || a.includes('manado') || a.includes('palu')) return 'Sulawesi';
  if (a.includes('papua') || a.includes('jayapura') || a.includes('manokwari')) return 'Papua';
  if (a.includes('bali') || a.includes('lombok') || a.includes('ntb') || a.includes('ntt') || a.includes('flores') || a.includes('sumba')) return 'Bali-Nusa Tenggara';
  if (a.includes('maluku') || a.includes('ambon') || a.includes('ternate')) return 'Maluku';
  return 'Lainnya';
};

const parseBMKGPoints = (gempaList) =>
  gempaList
    .map((item, index) => {
      const coords = parseCoordinates(item?.Coordinates);
      if (!coords) return null;
      const kedalaman = item?.Kedalaman ?? '-';
      return {
        id: `bmkg-${item?.DateTime ?? 'gempa'}-${index}`,
        lat: coords.lat,
        lon: coords.lon,
        magnitude: parseMagnitude(item?.Magnitude),
        wilayah: item?.Wilayah ?? 'Wilayah tidak diketahui',
        waktu: item?.Tanggal && item?.Jam ? `${item.Tanggal} ${item.Jam}` : (item?.DateTime ?? '-'),
        kedalaman,
        depthKm: parseDepthKm(kedalaman),
        dirasakan: item?.Dirasakan ?? '-',
        potensi: item?.Potensi ?? 'Tidak berpotensi tsunami',
        region: inferRegion(item?.Wilayah ?? ''),
        dateTime: item?.DateTime ?? '',
        epochMs: Number.isFinite(Date.parse(item?.DateTime ?? '')) ? Date.parse(item?.DateTime ?? '') : null,
        source: 'BMKG',
      };
    })
    .filter(Boolean)
    .slice(0, 50);

const parseUSGSPoints = (features) =>
  features
    .map((feature) => {
      const coords = feature?.geometry?.coordinates;
      const lon = Number.parseFloat(coords?.[0]);
      const lat = Number.parseFloat(coords?.[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      const rawMag = Number.parseFloat(feature?.properties?.mag);
      const magnitude = Number.isFinite(rawMag) ? rawMag : 0;
      const eventTime = feature?.properties?.time
        ? new Date(feature.properties.time).toLocaleString('id-ID') : '-';
      const location = feature?.properties?.place ?? 'Wilayah tidak diketahui';
      const depthVal = Number.parseFloat(coords?.[2]);
      const kedalaman = Number.isFinite(depthVal) ? `${Math.abs(depthVal).toFixed(1)} km` : '-';
      return {
        id: feature?.id ?? `usgs-${Date.now()}-${Math.random()}`,
        lat, lon, magnitude,
        wilayah: location,
        waktu: eventTime,
        kedalaman,
        depthKm: Number.isFinite(depthVal) ? Math.abs(depthVal) : null,
        dirasakan: '-',
        potensi: 'Data global, cek BMKG untuk peringatan lokal',
        region: inferRegion(location),
        dateTime: eventTime,
        epochMs: Number.isFinite(feature?.properties?.time) ? feature.properties.time : null,
        source: 'USGS',
      };
    })
    .filter(Boolean)
    .slice(0, 100);

export function useBMKGMap() {
  // points berisi BMKG + USGS digabung
  const [bmkgPoints, setBmkgPoints] = useState([]);
  const [usgsPoints, setUsgsPoints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [bmkgOk, setBmkgOk]        = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [latencyMs, setLatencyMs]   = useState(null);
  const loggedIdsRef  = useRef(new Set());
  const refreshSeqRef = useRef(0);

  const publishIncidents = useCallback((pts) => {
    pts.slice(0, 20).forEach((point) => {
      const incidentId = `${point.source}-${point.id}`;
      if (loggedIdsRef.current.has(incidentId)) return;
      loggedIdsRef.current.add(incidentId);
      appendIncident({
        id: incidentId,
        timestamp: point.waktu,
        level: point.magnitude >= 5 ? 'BAHAYA' : point.magnitude >= 3 ? 'WASPADA' : 'AMAN',
        magnitude: point.magnitude.toFixed(1),
        location: point.wilayah,
        source: point.source,
        status: 'NEW',
        detail: `Kedalaman ${point.kedalaman} | Potensi: ${point.potensi}`,
      });
    });
  }, []);

  const refresh = useCallback(async ({ cacheBust = false } = {}) => {
    const seq = ++refreshSeqRef.current;
    setLoading(true);
    const t0 = performance.now();
    setLastUpdatedAt(new Date().toLocaleString('id-ID'));

    // Fetch BMKG dan USGS secara paralel
    const [bmkgResult, usgsResult] = await Promise.allSettled([
      fetchWithTimeout(buildCodetabsBmkgUrl(cacheBust)),
      fetchWithTimeout(USGS_URL),
    ]);

    if (seq !== refreshSeqRef.current) return;

    let nextBmkg = [];
    let nextUsgs = [];
    let anyError = null;

    // ── BMKG ──
    if (bmkgResult.status === 'fulfilled' && bmkgResult.value.ok) {
      try {
        const payload = await bmkgResult.value.json();
        const list = payload?.Infogempa?.gempa;
        if (Array.isArray(list) && list.length > 0) {
          nextBmkg = sortByEpochDesc(parseBMKGPoints(list));
          setBmkgOk(true);
        }
      } catch (e) { anyError = e; }
    } else {
      anyError = bmkgResult.reason ?? new Error('BMKG gagal');
      setBmkgOk(false);
    }

    // ── USGS ──
    if (usgsResult.status === 'fulfilled' && usgsResult.value.ok) {
      try {
        const payload = await usgsResult.value.json();
        const features = payload?.features ?? [];
        nextUsgs = sortByEpochDesc(parseUSGSPoints(features));
      } catch (e) { anyError = anyError ?? e; }
    } else {
      anyError = anyError ?? usgsResult.reason;
    }

    // Gunakan fallback kalau keduanya kosong
    if (nextBmkg.length === 0 && nextUsgs.length === 0) {
      nextBmkg = FALLBACK_POINTS;
    }

    setBmkgPoints(nextBmkg);
    setUsgsPoints(nextUsgs);
    setLatencyMs(Math.round(performance.now() - t0));
    setError(anyError);
    setLoading(false);

    // Log incidents (gabungan, masing-masing dengan source berbeda)
    publishIncidents([...nextBmkg, ...nextUsgs]);
  }, [publishIncidents]);

  useEffect(() => {
    const tid = window.setTimeout(() => void refresh(), 0);
    const iid = window.setInterval(() => void refresh(), 5 * 60 * 1000);
    return () => { window.clearTimeout(tid); window.clearInterval(iid); };
  }, [refresh]);

  // Gabungkan semua poin untuk backward-compat; komponen bisa akses bmkgPoints/usgsPoints langsung
  const points = sortByEpochDesc([...bmkgPoints, ...usgsPoints]);

  return {
    points,
    bmkgPoints,
    usgsPoints,
    loading,
    error,
    refresh,
    health: {
      source: bmkgOk ? 'BMKG' : (usgsPoints.length > 0 ? 'USGS' : 'FALLBACK'),
      lastUpdatedAt,
      latencyMs,
    },
  };
}
