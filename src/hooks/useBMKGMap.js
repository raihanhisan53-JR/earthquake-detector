"use client"
import { useCallback, useEffect, useRef, useState } from 'react';
import { appendIncident } from '@/utils/incidentLog';

const parseDepthKm = (raw) => {
  const m = String(raw ?? '').match(/(\d+(?:[.,]\d+)?)\s*km/i);
  if (!m) {
    return null;
  }
  const v = Number.parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};

const FALLBACK_POINTS = [
  { id: 'fallback-1', lat: -6.2, lon: 106.8, magnitude: 3.5, wilayah: 'Jakarta dan sekitarnya', waktu: 'Data cadangan', kedalaman: '35 km', depthKm: 35, region: 'Jawa', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
  { id: 'fallback-2', lat: -8.65, lon: 115.22, magnitude: 4.1, wilayah: 'Bali', waktu: 'Data cadangan', kedalaman: '12 km', depthKm: 12, region: 'Bali-Nusa Tenggara', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
  { id: 'fallback-3', lat: -0.02, lon: 109.34, magnitude: 3.2, wilayah: 'Kalimantan Barat', waktu: 'Data cadangan', kedalaman: '150 km', depthKm: 150, region: 'Kalimantan', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
  { id: 'fallback-4', lat: 1.47, lon: 124.84, magnitude: 4.0, wilayah: 'Sulawesi Utara', waktu: 'Data cadangan', kedalaman: '320 km', depthKm: 320, region: 'Sulawesi', potensi: 'Tidak berpotensi tsunami', source: 'FALLBACK', epochMs: null },
];

const BMKG_GEMPADIRASAKAN_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';

const buildCodetabsBmkgUrl = (cacheBust) => {
  const target = cacheBust ? `${BMKG_GEMPADIRASAKAN_URL}?ts=${Date.now()}` : BMKG_GEMPADIRASAKAN_URL;
  return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 7000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const parseMagnitude = (rawMagnitude) => {
  const parsed = Number.parseFloat(String(rawMagnitude ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseCoordinates = (rawCoordinates) => {
  if (!rawCoordinates) {
    return null;
  }

  const plainPair = String(rawCoordinates).match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (plainPair) {
    const lat = Number.parseFloat(plainPair[1]);
    const lon = Number.parseFloat(plainPair[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
  }

  const indoPattern = String(rawCoordinates).match(
    /(\d+(?:\.\d+)?)\s*(LS|LU)\s*[-,]?\s*(\d+(?:\.\d+)?)\s*(BT|BB)/i,
  );
  if (!indoPattern) {
    return null;
  }

  const latBase = Number.parseFloat(indoPattern[1]);
  const lonBase = Number.parseFloat(indoPattern[3]);
  if (!Number.isFinite(latBase) || !Number.isFinite(lonBase)) {
    return null;
  }

  const latHemisphere = indoPattern[2].toUpperCase();
  const lonHemisphere = indoPattern[4].toUpperCase();

  return {
    lat: latHemisphere === 'LS' ? -latBase : latBase,
    lon: lonHemisphere === 'BB' ? -lonBase : lonBase,
  };
};

const sortPointsByEpochDesc = (list) =>
  [...list].sort((a, b) => {
    const ta = Number.isFinite(a.epochMs) ? a.epochMs : Number.NEGATIVE_INFINITY;
    const tb = Number.isFinite(b.epochMs) ? b.epochMs : Number.NEGATIVE_INFINITY;
    return tb - ta;
  });

const inferRegion = (wilayah = '') => {
  const area = wilayah.toLowerCase();
  if (area.includes('sumatera') || area.includes('aceh') || area.includes('nias') || area.includes('mentawai')) return 'Sumatera';
  if (area.includes('jawa') || area.includes('banten') || area.includes('jakarta') || area.includes('yogyakarta')) return 'Jawa';
  if (area.includes('kalimantan') || area.includes('pontianak') || area.includes('banjarmasin')) return 'Kalimantan';
  if (area.includes('sulawesi') || area.includes('manado') || area.includes('palu')) return 'Sulawesi';
  if (area.includes('papua') || area.includes('jayapura') || area.includes('manokwari')) return 'Papua';
  if (area.includes('bali') || area.includes('lombok') || area.includes('ntb') || area.includes('ntt') || area.includes('flores') || area.includes('sumba')) return 'Bali-Nusa Tenggara';
  if (area.includes('maluku') || area.includes('ambon') || area.includes('ternate')) return 'Maluku';
  return 'Lainnya';
};

export function useBMKGMap() {
  const [points, setPoints] = useState(() => sortPointsByEpochDesc(FALLBACK_POINTS));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('FALLBACK');
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastSuccessAt, setLastSuccessAt] = useState('');
  const loggedIncidentIdsRef = useRef(new Set());
  const refreshSeqRef = useRef(0);

  const parseBMKGPoints = (gempaList) => {
    return gempaList
      .map((item, index) => {
        const coords = parseCoordinates(item?.Coordinates);
        if (!coords) {
          return null;
        }

        const kedalaman = item?.Kedalaman ?? '-';
        return {
          id: `${item?.DateTime ?? 'gempa'}-${index}`,
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
  };

  const parseUSGSPoints = (features) => {
    return features
      .map((feature) => {
        const coordinates = feature?.geometry?.coordinates;
        const lon = Number.parseFloat(coordinates?.[0]);
        const lat = Number.parseFloat(coordinates?.[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          return null;
        }

        const rawMag = Number.parseFloat(feature?.properties?.mag);
        const magnitude = Number.isFinite(rawMag) ? rawMag : 0;
        const eventTime = feature?.properties?.time
          ? new Date(feature.properties.time).toLocaleString('id-ID')
          : '-';
        const location = feature?.properties?.place ?? 'Wilayah tidak diketahui';
        const depthVal = Number.parseFloat(coordinates?.[2]);
        const kedalaman = Number.isFinite(depthVal)
          ? `${Math.abs(depthVal).toFixed(1)} km`
          : '-';

        return {
          id: feature?.id ?? `usgs-${eventTime}`,
          lat,
          lon,
          magnitude,
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
      .slice(0, 50);
  };

  const publishIncidents = (nextPoints) => {
    nextPoints
      .filter((point) => point.magnitude >= 4)
      .slice(0, 15)
      .forEach((point) => {
        const incidentId = `${point.source || 'SRC'}-${point.id}`;
        if (loggedIncidentIdsRef.current.has(incidentId)) {
          return;
        }
        loggedIncidentIdsRef.current.add(incidentId);
        appendIncident({
          id: incidentId,
          timestamp: point.waktu,
          level: point.magnitude >= 5 ? 'BAHAYA' : 'WASPADA',
          magnitude: point.magnitude.toFixed(1),
          location: point.wilayah,
          source: point.source || 'BMKG',
          status: 'NEW',
          detail: `Kedalaman ${point.kedalaman} | Potensi: ${point.potensi}`,
        });
      });
  };

  const refresh = useCallback(async ({ cacheBust = false } = {}) => {
    const seq = ++refreshSeqRef.current;
    setLoading(true);
    const startedAt = performance.now();
    setLastUpdatedAt(new Date().toLocaleString('id-ID'));

    try {
      const response = await fetchWithTimeout(buildCodetabsBmkgUrl(cacheBust));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const gempaList = payload?.Infogempa?.gempa;
      if (!Array.isArray(gempaList) || gempaList.length === 0) {
        throw new Error('Data gempa tidak tersedia');
      }

      const parsedPoints = parseBMKGPoints(gempaList);
      const finalPoints = sortPointsByEpochDesc(parsedPoints.length > 0 ? parsedPoints : FALLBACK_POINTS);

      setPoints(finalPoints);
      setSource('BMKG');
      publishIncidents(finalPoints);
      setLatencyMs(Math.round(performance.now() - startedAt));
      setLastSuccessAt(new Date().toLocaleString('id-ID'));
      setError(null);
    } catch (nextError) {
      try {
        const usgsResponse = await fetchWithTimeout(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        );
        if (!usgsResponse.ok) {
          throw new Error(`USGS HTTP ${usgsResponse.status}`);
        }
        const usgsPayload = await usgsResponse.json();
        const usgsPoints = parseUSGSPoints(usgsPayload?.features ?? []);
        const finalPoints = sortPointsByEpochDesc(usgsPoints.length > 0 ? usgsPoints : FALLBACK_POINTS);

        setPoints(finalPoints);
        setSource(usgsPoints.length > 0 ? 'USGS' : 'FALLBACK');
        publishIncidents(finalPoints);
        setLatencyMs(Math.round(performance.now() - startedAt));
        setLastSuccessAt(new Date().toLocaleString('id-ID'));
        setError(nextError);
      } catch (usgsError) {
        setPoints(sortPointsByEpochDesc(FALLBACK_POINTS));
        setSource('FALLBACK');
        setLatencyMs(Math.round(performance.now() - startedAt));
        setError(usgsError);
      }
    } finally {
      if (seq === refreshSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);
    const intervalId = window.setInterval(() => {
      void refresh();
    }, 5 * 60 * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  return {
    points,
    loading,
    error,
    refresh,
    health: {
      source,
      lastUpdatedAt,
      lastSuccessAt,
      latencyMs,
    },
  };
}
