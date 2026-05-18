"use client"
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, Crosshair, GitBranch, List, MapPin, RefreshCcw, Globe, Play, Pause, FastForward, Search } from 'lucide-react';
import { CircleMarker, Circle, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useBMKGMap } from '@/hooks/useBMKGMap';
import { useRadiusAlert } from '@/hooks/useRadiusAlert';
import { useI18n } from '@/hooks/useI18n';
import RadiusAlertPanel from './RadiusAlertPanel';
import EarthquakeGlobe3D from './EarthquakeGlobe3D';

const getMagnitudeMarkerColor = (magnitude) => {
  if (magnitude >= 5) {
    return '#ef4444';
  }
  if (magnitude >= 4) {
    return '#f59e0b';
  }
  return '#22c55e';
};

/** Gaya radar: dangkal / menengah / dalam (km) */
const getDepthMarkerColor = (depthKm) => {
  if (!Number.isFinite(depthKm)) {
    return '#94a3b8';
  }
  if (depthKm < 70) {
    return '#ef4444';
  }
  if (depthKm <= 300) {
    return '#f59e0b';
  }
  return '#3b82f6';
};

const getDisplayMarkerColor = (point, colorMode) =>
  colorMode === 'depth' ? getDepthMarkerColor(point.depthKm) : getMagnitudeMarkerColor(point.magnitude);

const passesTimeWindow = (point, windowMs, nowMs) => {
  if (!windowMs) {
    return true;
  }
  if (!Number.isFinite(point.epochMs)) {
    return false;
  }
  return nowMs - point.epochMs <= windowMs;
};

const getMarkerRadius = (magnitude) => {
  return Math.min(18, Math.max(6, magnitude * 2.3));
};

const getAlertLevel = (magnitude) => {
  if (magnitude > 5) {
    return 'danger';
  }
  if (magnitude >= 3) {
    return 'warning';
  }
  return 'safe';
};

const normalizeBaseLayerKey = (raw) => {
  if (raw === 'default') return 'street';
  if (raw === 'topo') return 'terrain';
  if (['street', 'dark', 'terrain', 'satellite'].includes(raw)) return raw;
  return 'dark';
};

const getStoredMapPreferences = () => {
  if (typeof window === 'undefined') {
    return {
      followLatest: true,
      timeRange: '24h',
      notifyThreshold: 4,
      notifyRegion: 'Semua',
      baseLayer: 'dark',
      showPlateBoundaries: false,
      listLimit: 25,
      sortBy: 'time',
      markerColorMode: 'magnitude',
    };
  }

  try {
    const raw = JSON.parse(localStorage.getItem('quakeguard-map-preferences') || '{}');
    const rawLimit = Number(raw.listLimit);
    const listLimit = [10, 25, 50, 100].includes(rawLimit) ? rawLimit : 25;
    const sortBy = raw.sortBy === 'magnitude' ? 'magnitude' : 'time';
    const markerColorMode = raw.markerColorMode === 'depth' ? 'depth' : 'magnitude';
    return {
      followLatest: typeof raw.followLatest === 'boolean' ? raw.followLatest : true,
      timeRange: typeof raw.timeRange === 'string' ? raw.timeRange : '24h',
      notifyThreshold: Number.isFinite(raw.notifyThreshold) ? raw.notifyThreshold : 4,
      notifyRegion: typeof raw.notifyRegion === 'string' ? raw.notifyRegion : 'Semua',
      baseLayer: normalizeBaseLayerKey(typeof raw.baseLayer === 'string' ? raw.baseLayer : 'dark'),
      showPlateBoundaries: typeof raw.showPlateBoundaries === 'boolean' ? raw.showPlateBoundaries : false,
      listLimit,
      sortBy,
      markerColorMode,
    };
  } catch {
    return {
      followLatest: true,
      timeRange: '24h',
      notifyThreshold: 4,
      notifyRegion: 'Semua',
      baseLayer: 'dark',
      showPlateBoundaries: false,
      listLimit: 25,
      sortBy: 'time',
      markerColorMode: 'magnitude',
    };
  }
};

const resolveTimeWindowMs = (timeRange) => {
  if (timeRange === '1h') return 60 * 60 * 1000;
  if (timeRange === '6h') return 6 * 60 * 60 * 1000;
  if (timeRange === '24h') return 24 * 60 * 60 * 1000;
  if (timeRange === '7d') return 7 * 24 * 60 * 60 * 1000;
  return null;
};

const baseLayers = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    label: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, SRTM | OpenTopoMap',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
};

const BASE_LAYER_ORDER = ['street', 'dark', 'terrain', 'satellite'];

const PLATE_BOUNDARIES_GEOJSON =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

function QuakeMarkerWithRings({ point, dimmed, isLatest, displayColor, distanceKm }) {
  const r = getMarkerRadius(point.magnitude);
  const c = displayColor;
  const ringOffsets = point.magnitude >= 5 ? [28, 17, 9] : point.magnitude >= 4 ? [16, 8] : [];

  return (
    <>
      {ringOffsets.map((extra, i) => (
        <CircleMarker
          key={`${point.id}-ring-${i}`}
          center={[point.lat, point.lon]}
          radius={r + extra}
          interactive={false}
          bubblingMouseEvents={false}
          pathOptions={{
            color: c,
            fillOpacity: 0,
            weight: isLatest ? 1.85 : 1.25,
            opacity: dimmed ? 0.14 + i * 0.05 : 0.28 + i * 0.07,
          }}
        />
      ))}
      <CircleMarker
        center={[point.lat, point.lon]}
        radius={r}
        className={isLatest && !dimmed ? 'latest-marker-blink' : ''}
        pathOptions={{
          color: c,
          fillColor: c,
          fillOpacity: dimmed ? 0.28 : 0.65,
          weight: isLatest ? 3 : dimmed ? 1.2 : 1.7,
          opacity: dimmed ? 0.75 : 1,
        }}
      >
        <Popup className="quake-map-popup">
          <strong>{point.wilayah}</strong>
          {dimmed ? (
            <>
              <br />
              <em className="quake-popup-note">Di luar rentang waktu filter</em>
            </>
          ) : null}
          <br />
          M {point.magnitude.toFixed(1)} | Kedalaman {point.kedalaman ?? '-'}
          <br />
          {point.waktu}
          <br />
          Potensi: {point.potensi ?? '-'}
          <br />
          Koordinat: {point.lat.toFixed(3)}, {point.lon.toFixed(3)}
          {distanceKm != null && (
            <><br />Jarak dari Anda: <strong>{distanceKm < 1 ? '< 1' : Math.round(distanceKm)} km</strong></>
          )}
        </Popup>
      </CircleMarker>
    </>
  );
}


function MapAutoFocus({ point, enabled }) {
  const map = useMap();
  const lastFocusKeyRef = useRef('');

  useEffect(() => {
    if (!enabled) {
      lastFocusKeyRef.current = '';
      return;
    }
    if (point == null) {
      return;
    }
    const { lat, lon, id } = point;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const focusKey = `${String(id)}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
    if (focusKey === lastFocusKeyRef.current) {
      return;
    }
    lastFocusKeyRef.current = focusKey;

    let cancelled = false;
    const run = () => {
      if (cancelled) {
        return;
      }
      map.invalidateSize();
      const z = Math.max(map.getZoom(), 6);
      map.flyTo([lat, lon], z, { duration: 0.85 });
    };

    const schedule = () => {
      if (cancelled) {
        return;
      }
      requestAnimationFrame(run);
    };

    if (typeof map.whenReady === 'function') {
      map.whenReady(schedule);
    } else {
      schedule();
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, map, point]);

  return null;
}

function MapSearchController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat != null && target.lon != null) {
      const zoom = target.zoom ?? 10;
      map.flyTo([target.lat, target.lon], zoom, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

function MapSearchBox({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  return (
    <div className="map-search-container" style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'var(--bg-card)', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '280px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Cari Kota/Daerah..." 
          style={{ flex: 1, padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
        />
        <button type="submit" className="btn btn-primary" disabled={searching} style={{ padding: '6px 10px', minWidth: 'unset' }}>
          <Search size={16} />
        </button>
      </form>
      {results.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', maxHeight: '200px', overflowY: 'auto' }}>
          {results.map((r, i) => (
            <li key={i} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }} onClick={() => {
              onSelectLocation({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
              setResults([]);
            }}>
              {r.display_name.length > 50 ? r.display_name.substring(0, 50) + '...' : r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapInteractionController() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    const onResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  return null;
}

export default function EarthquakeMapCard({
  fullView = false,
  notificationsEnabled = true,
  notifyUser = () => {},
}) {
  const { t } = useI18n();
  const { points, bmkgPoints, usgsPoints, loading, error, refresh, health } = useBMKGMap();
  const {
    userLocation,
    locationStatus,
    radiusKm,
    radiusEnabled,
    requestLocation,
    setRadiusKm,
    toggleRadius,
    isWithinRadius,
    distanceTo,
    filterByRadius,
  } = useRadiusAlert();
  const storedPrefs = useMemo(() => getStoredMapPreferences(), []);
  const [minMagnitude, setMinMagnitude] = useState(3);
  const [region, setRegion] = useState('Semua');
  const [timeRange, setTimeRange] = useState(storedPrefs.timeRange);
  const [mode, setMode] = useState('live');
  const [followLatest, setFollowLatest] = useState(storedPrefs.followLatest);
  const [notifyThreshold, setNotifyThreshold] = useState(storedPrefs.notifyThreshold);
  const [notifyRegion, setNotifyRegion] = useState(storedPrefs.notifyRegion);
  const [baseLayer, setBaseLayer] = useState(storedPrefs.baseLayer);
  const [listLimit, setListLimit] = useState(storedPrefs.listLimit);
  const [sortBy, setSortBy] = useState(storedPrefs.sortBy);
  const [markerColorMode, setMarkerColorMode] = useState(storedPrefs.markerColorMode);
  // 'Semua' | 'BMKG' | 'USGS'
  const [dataSourceFilter, setDataSourceFilter] = useState('Semua');
  const [searchTarget, setSearchTarget] = useState(null);
  const [clockTick, setClockTick] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [showPlateBoundaries, setShowPlateBoundaries] = useState(storedPrefs.showPlateBoundaries);
  const [plateGeoJson, setPlateGeoJson] = useState(null);
  const plateFetchDoneRef = useRef(false);
  const [simulatedPoint, setSimulatedPoint] = useState(null);
  const [dismissedAlertId, setDismissedAlertId] = useState('');
  const lastAlertIdRef = useRef('');
  const lastAlertTimestampRef = useRef(0);
  const alertsReadyRef = useRef(false);
  const [viewMode, setViewMode] = useState('2d');
  const [isTimeLapse, setIsTimeLapse] = useState(false);
  const [timeLapseIndex, setTimeLapseIndex] = useState(0);

  // Pilih titik berdasarkan sumber aktif
  const activePoints = useMemo(() => {
    if (dataSourceFilter === 'BMKG') return bmkgPoints;
    if (dataSourceFilter === 'USGS') return usgsPoints;
    return points; // Semua
  }, [dataSourceFilter, bmkgPoints, usgsPoints, points]);

  const regions = useMemo(
    () => ['Semua', ...new Set(activePoints.map((p) => p.region || 'Lainnya'))],
    [activePoints],
  );

  const sourcePoints = useMemo(
    () => (mode === 'simulation' && simulatedPoint ? [simulatedPoint, ...activePoints] : activePoints),
    [mode, simulatedPoint, activePoints],
  );
  const windowMs = resolveTimeWindowMs(timeRange);

  useEffect(() => {
    const id = window.setInterval(() => setClockTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const filteredPoints = useMemo(() => {
    void clockTick;
    // eslint-disable-next-line react-hooks/purity
    const t = Date.now();
    let pts = sourcePoints.filter((point) => {
      const byMagnitude = point.magnitude >= minMagnitude;
      const byRegion = region === 'Semua' || point.region === region;
      const byTime = passesTimeWindow(point, windowMs, t);
      const bySource = dataSourceFilter === 'Semua' || point.source === dataSourceFilter;
      const byRadius = isWithinRadius(point.lat, point.lon);
      return byMagnitude && byRegion && byTime && bySource && byRadius;
    });

    // Sort by oldest first if time lapse is running
    if (isTimeLapse) {
      pts = pts.sort((a, b) => (Number(a.epochMs) || 0) - (Number(b.epochMs) || 0));
      return pts.slice(0, timeLapseIndex + 1);
    }
    
    return pts;
  }, [sourcePoints, minMagnitude, region, windowMs, clockTick, isTimeLapse, timeLapseIndex, isWithinRadius]);

  useEffect(() => {
    if (!isTimeLapse) return;
    const totalPts = sourcePoints.filter((point) => {
      const bySource = dataSourceFilter === 'Semua' || point.source === dataSourceFilter;
      return point.magnitude >= minMagnitude && (region === 'Semua' || point.region === region) && passesTimeWindow(point, windowMs, Date.now()) && bySource;
    }).length;
    
    if (timeLapseIndex >= totalPts - 1) {
      // pause when finished
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTimeLapse(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLapseIndex(prev => prev + 1);
    }, 800); // speed of timelapse

    return () => clearInterval(interval);
  }, [isTimeLapse, timeLapseIndex, sourcePoints, minMagnitude, region, windowMs]);

  const lacksEventTime = useMemo(
    () =>
      Boolean(windowMs) &&
      sourcePoints.length > 0 &&
      sourcePoints.every((p) => !Number.isFinite(p.epochMs)),
    [windowMs, sourcePoints],
  );

  const mapFollowTarget = useMemo(() => {
    if (selectedPointId) {
      const sp = sourcePoints.find(p => p.id === selectedPointId);
      if (sp) return sp;
    }
    const visible = filteredPoints[0];
    if (visible && followLatest) {
      return visible;
    }
    if (!followLatest || mode === 'simulation' || !windowMs) {
      return null;
    }
    const relaxed = sourcePoints
      .filter((p) => {
        const bySource = dataSourceFilter === 'Semua' || p.source === dataSourceFilter;
        return p.magnitude >= minMagnitude && (region === 'Semua' || p.region === region) && bySource;
      })
      .sort((a, b) => {
        const ta = Number.isFinite(a.epochMs) ? a.epochMs : Number.NEGATIVE_INFINITY;
        const tb = Number.isFinite(b.epochMs) ? b.epochMs : Number.NEGATIVE_INFINITY;
        return tb - ta;
      });
    return relaxed[0] ?? null;
  }, [filteredPoints, followLatest, mode, windowMs, sourcePoints, minMagnitude, region, selectedPointId]);

  const mapMarkers = useMemo(() => {
    void clockTick;
    // eslint-disable-next-line react-hooks/purity
    const t = Date.now();
    if (!windowMs || mode === 'simulation') {
      return filteredPoints.map((point) => ({ point, dimmed: false }));
    }

    const relaxed = sourcePoints
      .filter((p) => {
        const bySource = dataSourceFilter === 'Semua' || p.source === dataSourceFilter;
        return p.magnitude >= minMagnitude && (region === 'Semua' || p.region === region) && bySource;
      })
      .sort((a, b) => {
        const ta = Number.isFinite(a.epochMs) ? a.epochMs : Number.NEGATIVE_INFINITY;
        const tb = Number.isFinite(b.epochMs) ? b.epochMs : Number.NEGATIVE_INFINITY;
        return tb - ta;
      })
      .slice(0, 100);

    return relaxed.map((point) => ({
      point,
      dimmed: !passesTimeWindow(point, windowMs, t),
    }));
  }, [filteredPoints, windowMs, mode, sourcePoints, minMagnitude, region, clockTick]);

  const listSource = mapMarkers; 

  const activityPoints = useMemo(
    () => (filteredPoints.length > 0 ? filteredPoints : mapMarkers.filter(m => !m.dimmed).map(m => m.point)),
    [filteredPoints, mapMarkers]
  );

  const activityMaxMag = useMemo(
    () => (activityPoints.length > 0 ? Math.max(...activityPoints.map(p => p.magnitude)) : 0),
    [activityPoints]
  );

  const relaxedFollowActive =
    mode !== 'simulation' &&
    Boolean(windowMs) &&
    filteredPoints.length === 0 &&
    mapMarkers.length > 0;

  const sidebarRows = useMemo(() => {
    const arr = [...listSource];
    if (sortBy === 'magnitude') {
      arr.sort(
        (a, b) =>
          b.point.magnitude - a.point.magnitude ||
          (Number(b.point.epochMs) || 0) - (Number(a.point.epochMs) || 0),
      );
    } else {
      arr.sort(
        (a, b) =>
          (Number(b.point.epochMs) || 0) - (Number(a.point.epochMs) || 0) ||
          b.point.magnitude - a.point.magnitude,
      );
    }
    return arr.slice(0, listLimit);
  }, [listSource, sortBy, listLimit]);

  const latestAlertPoint = filteredPoints.find(
    (point) => point.magnitude >= notifyThreshold && (notifyRegion === 'Semua' || point.region === notifyRegion),
  ) || null;
  const latestLevel = latestAlertPoint ? getAlertLevel(latestAlertPoint.magnitude) : 'safe';
  const isRealtimeSource = health.source === 'BMKG' || health.source === 'USGS';
  const shouldRaiseAlert = mode === 'simulation' || isRealtimeSource;
  const alertItem = latestAlertPoint && shouldRaiseAlert && latestLevel !== 'safe' && dismissedAlertId !== latestAlertPoint.id
    ? { ...latestAlertPoint, level: latestLevel }
    : null;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(
      'quakeguard-map-preferences',
      JSON.stringify({
        followLatest,
        timeRange,
        notifyThreshold,
        notifyRegion,
        baseLayer,
        showPlateBoundaries,
        listLimit,
        sortBy,
        markerColorMode,
      }),
    );

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyRegion, notifyThreshold })
    }).catch(console.error);

  }, [
    baseLayer,
    followLatest,
    listLimit,
    markerColorMode,
    notifyRegion,
    notifyThreshold,
    showPlateBoundaries,
    sortBy,
    timeRange,
  ]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data && data.notifyRegion) setNotifyRegion(data.notifyRegion);
        if (data && data.notifyThreshold) setNotifyThreshold(data.notifyThreshold);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!showPlateBoundaries) {
      return;
    }
    if (plateGeoJson != null || plateFetchDoneRef.current) {
      return;
    }
    plateFetchDoneRef.current = true;
    let cancelled = false;
    void fetch(PLATE_BOUNDARIES_GEOJSON)
      .then((res) => {
        if (!res.ok) {
          throw new Error(String(res.status));
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPlateGeoJson(data);
        }
      })
      .catch(() => {
        plateFetchDoneRef.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [showPlateBoundaries, plateGeoJson]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!latestAlertPoint) {
      return;
    }

    const level = getAlertLevel(latestAlertPoint.magnitude);
    if (level === 'safe') {
      return;
    }

    const eventAgeMs = Number.isFinite(latestAlertPoint.epochMs)
      // eslint-disable-next-line react-hooks/purity
      ? Date.now() - latestAlertPoint.epochMs
      : Number.POSITIVE_INFINITY;
    // Allow alerts for events up to 60 minutes old to account for BMKG processing delay
    const isFreshRealtimeEvent = mode === 'simulation' || eventAgeMs <= 60 * 60 * 1000;

    const notifiedAlerts = JSON.parse(localStorage.getItem('notifiedAlerts') || '[]');
    if (notifiedAlerts.includes(latestAlertPoint.id)) {
      return; // Already notified about this specific earthquake
    }

    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const tooSoonSinceLastAlert = now - lastAlertTimestampRef.current < 15000;

    if (!shouldRaiseAlert || !isFreshRealtimeEvent || !notificationsEnabled) {
      return;
    }

    if (tooSoonSinceLastAlert && mode !== 'simulation') {
      return;
    }

    lastAlertIdRef.current = latestAlertPoint.id;
    lastAlertTimestampRef.current = now;
    
    // Remember that we notified about this event
    notifiedAlerts.push(latestAlertPoint.id);
    // Keep only the last 20 to prevent localStorage bloat
    if (notifiedAlerts.length > 20) notifiedAlerts.shift();
    localStorage.setItem('notifiedAlerts', JSON.stringify(notifiedAlerts));

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Peringatan Dini Gempa', {
        body: `M${latestAlertPoint.magnitude.toFixed(1)} di ${latestAlertPoint.wilayah}. Waktu: ${latestAlertPoint.waktu}`,
        icon: '/vite.svg', // Assuming standard Vite icon or we can omit
        requireInteraction: level === 'danger'
      });
    }

    // Voice Alert / Text-to-Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Create siren effect using AudioContext if we wanted, or just simple speech:
      const utterance = new SpeechSynthesisUtterance(
        `Peringatan Dini! Gempa bumi kekuatan ${latestAlertPoint.magnitude.toFixed(1)} magnitudo. Terjadi di ${latestAlertPoint.wilayah}. ${latestAlertPoint.potensi?.toLowerCase().includes('tsunami') ? 'Awas, potensi tsunami terdeteksi!' : 'Harap waspada.'}`
      );
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }

    notifyUser({
      type: level === 'danger' ? 'error' : 'warning',
      title: `Alert Gempa ${level === 'danger' ? 'Merah' : 'Kuning'}`,
      message: `${latestAlertPoint.wilayah} | M${latestAlertPoint.magnitude.toFixed(1)} | ${latestAlertPoint.waktu}`,
    });
  }, [latestAlertPoint, loading, mode, notificationsEnabled, notifyUser, shouldRaiseAlert]);

  // Hitung jumlah gempa dalam radius (dari semua points, bukan hanya filtered)
  const nearbyCount = useMemo(() => {
    if (!radiusEnabled || radiusKm === 0 || !userLocation) return 0;
    return sourcePoints.filter((p) => isWithinRadius(p.lat, p.lon)).length;
  }, [radiusEnabled, radiusKm, userLocation, sourcePoints, isWithinRadius]);

  const triggerSimulation = () => {    const mockMagnitude = Number((4.5 + Math.random() * 1.8).toFixed(1));
    const depthKm = Math.round(10 + Math.random() * 120);
    const mockPoint = {
      id: `simulation-${Date.now()}`,
      lat: -6 + Math.random() * 8,
      lon: 102 + Math.random() * 28,
      magnitude: mockMagnitude,
      wilayah: 'SIMULASI - Safety Drill',
      waktu: new Date().toLocaleString('id-ID'),
      kedalaman: `${depthKm} km`,
      depthKm,
      dirasakan: 'III-IV MMI',
      potensi: 'Tidak berpotensi tsunami (simulasi)',
      region: 'Simulasi',
      epochMs: Date.now(),
    };
    setMode('simulation');
    setSimulatedPoint(mockPoint);
    notifyUser({
      type: 'info',
      title: t('simulation'),
      message: t('live'),
    });
  };


  return (
    <section className={`card earthquake-map-card ${fullView ? 'full-view map-expanded' : 'map-compact'}`}>
      <div className="card-header">
        <h2>
          <MapPin size={18} />
          {t('mapTitle')}
        </h2>
        <div className="map-header-actions">
          <button type="button" className={`btn btn-outline ${viewMode === '2d' ? 'active' : ''}`} onClick={() => setViewMode('2d')}>
            {t('map2d')}
          </button>
          <button type="button" className={`btn btn-outline ${viewMode === '3d' ? 'active' : ''}`} style={viewMode==='3d' ? {borderColor:'#ef4444', color:'#ef4444'} : {}} onClick={() => setViewMode('3d')}>
            <Globe size={14} /> {t('globe3d')}
          </button>
          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 8px' }}></div>
          <button type="button" className={`btn btn-outline ${mode === 'live' ? 'active' : ''}`} onClick={() => setMode('live')}>
            {t('live')}
          </button>
          <button type="button" className={`btn btn-outline ${mode === 'simulation' ? 'active' : ''}`} onClick={triggerSimulation}>
            {t('simulation')}
          </button>
          <button type="button" className="btn btn-outline" disabled={loading} title={t('refresh')} onClick={() => void refresh({ cacheBust: true })}>
            <RefreshCcw size={14} className={loading ? 'refresh-spin' : ''} />
            {loading ? t('loading') : t('refresh')}
          </button>
        </div>
      </div>

      <div className="map-meta">
        <span>
          {loading ? t('loading') : `${filteredPoints.length} · ${mapMarkers.length}`}
          {windowMs && !lacksEventTime ? (<><br /><span className="map-note">BMKG/USGS ~30s</span></>) : null}
          {lacksEventTime ? (<><br /><span className="map-note map-note--warn">{t('allData')}</span></>) : null}
          {relaxedFollowActive ? (<><br /><span className="map-note">↑ {t('followEarthquake')}</span></>) : null}
        </span>
        <span className="map-note">{health.source === 'BMKG' ? 'BMKG / USGS' : health.source}</span>
      </div>

      {alertItem ? (
        <div className={`quake-alert ${alertItem.level}`}>
          <div className="alert-title">
            <AlertTriangle size={16} />
            {alertItem.level === 'danger' ? '🔴' : '🟡'} M{alertItem.magnitude.toFixed(1)}
          </div>
          <p>{alertItem.wilayah} | M{alertItem.magnitude.toFixed(1)} | {alertItem.waktu}</p>
          <button type="button" className="btn btn-outline" onClick={() => setDismissedAlertId(alertItem.id)}>✕</button>
        </div>
      ) : null}

      <div className="map-control-grid">
        <div className="map-control-item">
          <label htmlFor="minMagnitude">{t('filterMagnitude')}</label>
          <select id="minMagnitude" value={minMagnitude} onChange={(e) => setMinMagnitude(Number(e.target.value))}>
            <option value={0}>{t('all')}</option>
            <option value={3}>M ≥ 3.0</option>
            <option value={4}>M ≥ 4.0</option>
            <option value={5}>M ≥ 5.0</option>
          </select>
        </div>
        <div className="map-control-item">
          <label htmlFor="regionFilter">{t('filterRegion')}</label>
          <select id="regionFilter" value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((item) => (<option key={item} value={item}>{item}</option>))}
          </select>
        </div>
        <div className="map-control-item map-source-toggle-item">
          <label>{t('all')}</label>
          <div className="map-source-toggle">
            {[
              { key: 'Semua', label: t('all'),    color: '#6d28d9' },
              { key: 'BMKG',  label: '🇮🇩 BMKG', color: '#059669', onClick: () => { setFollowLatest(false); setSearchTarget({ lat: -2.5, lon: 118, zoom: 5 }); } },
              { key: 'USGS',  label: '🌐 USGS',  color: '#0891b2', onClick: () => { setFollowLatest(false); setSearchTarget({ lat: 20, lon: 0, zoom: 2 }); } },
            ].map(({ key, label, color, onClick }) => (
              <button key={key} type="button"
                className={`map-source-btn ${dataSourceFilter === key ? 'active' : ''}`}
                style={dataSourceFilter === key ? { borderColor: color, color, background: `${color}18` } : {}}
                onClick={() => { setDataSourceFilter(key); if (onClick) onClick(); }}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="map-control-item">
          <label htmlFor="timeRange">{t('timeRange')}</label>
          <select id="timeRange" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1h">{t('last1h')}</option>
            <option value="6h">{t('last6h')}</option>
            <option value="24h">{t('last24h')}</option>
            <option value="7d">{t('last7d')}</option>
            <option value="all">{t('allData')}</option>
          </select>
        </div>
        <div className="map-control-item">
          <label htmlFor="baseLayer">{t('mapLayer')}</label>
          <select id="baseLayer" value={baseLayer} onChange={(e) => setBaseLayer(e.target.value)}>
            {BASE_LAYER_ORDER.map((key) => (<option key={key} value={key}>{baseLayers[key].label}</option>))}
          </select>
        </div>
        <div className="map-control-item">
          <label htmlFor="notifyThreshold">{t('notifMagnitude')}</label>
          <select id="notifyThreshold" value={notifyThreshold} onChange={(e) => setNotifyThreshold(Number(e.target.value))}>
            <option value={3}>M ≥ 3.0</option>
            <option value={4}>M ≥ 4.0</option>
            <option value={5}>M ≥ 5.0</option>
          </select>
        </div>
        <div className="map-control-item">
          <label htmlFor="notifyRegion">{t('notifRegion')}</label>
          <select id="notifyRegion" value={notifyRegion} onChange={(e) => setNotifyRegion(e.target.value)}>
            <option value="Semua">{t('all')}</option>
            {regions.filter((item) => item !== 'Semua').map((item) => (<option key={item} value={item}>{item}</option>))}
          </select>
        </div>
        <div className="map-control-item map-control-item--span">
          <label htmlFor="markerColorMode">{t('markerColor')}</label>
          <select id="markerColorMode" value={markerColorMode} onChange={(e) => setMarkerColorMode(e.target.value === 'depth' ? 'depth' : 'magnitude')}>
            <option value="magnitude">{t('magnitude')}</option>
            <option value="depth">{t('depth')}</option>
          </select>
        </div>
      </div>

      <div className="map-secondary-actions">
        <button type="button" className={`btn btn-outline ${followLatest ? 'active' : ''}`} onClick={() => setFollowLatest((prev) => !prev)}>
          <Crosshair size={14} /> {t('followEarthquake')}: {followLatest ? 'ON' : 'OFF'}
        </button>
        <button type="button" className={`btn btn-outline ${showPlateBoundaries ? 'active' : ''}`} onClick={() => setShowPlateBoundaries((prev) => !prev)}>
          <GitBranch size={14} /> {t('plateBoundaries')}: {showPlateBoundaries ? 'ON' : 'OFF'}
        </button>
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' ? (
          <button type="button" className="btn btn-outline" onClick={() => void Notification.requestPermission()}>
            <Bell size={14} /> {t('enableBrowserNotif')}
          </button>
        ) : null}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('timeLapse')}:</span>
          <button type="button" className={`btn btn-outline ${isTimeLapse ? 'active' : ''}`}
            onClick={() => { if (!isTimeLapse && timeLapseIndex === sourcePoints.length - 1) setTimeLapseIndex(0); setIsTimeLapse(!isTimeLapse); }}>
            {isTimeLapse ? <Pause size={14} /> : <Play size={14} />}
            {isTimeLapse ? t('pause') : t('play')}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => { setIsTimeLapse(false); setTimeLapseIndex(0); }}>
            <RefreshCcw size={14} /> {t('reset')}
          </button>
        </div>
      </div>

      <div className={`map-layout-grid ${fullView ? 'full-view' : ''}`}>
        <div className="indonesia-map-wrapper">
          {viewMode === '3d' ? (
            <EarthquakeGlobe3D points={mapMarkers.map(m => m.point)} markerColorMode={markerColorMode} />
          ) : (
            <MapContainer center={[-2.5, 118]} zoom={4} minZoom={3} maxZoom={14}
              scrollWheelZoom dragging touchZoom doubleClickZoom boxZoom keyboard className="indonesia-map">
              <TileLayer
                attribution={baseLayers[baseLayer]?.attribution || baseLayers.dark.attribution}
                url={baseLayers[baseLayer]?.url || baseLayers.dark.url}
              />
              {showPlateBoundaries && plateGeoJson ? (
                <GeoJSON data={plateGeoJson} style={() => ({ color: 'rgba(56,189,248,0.7)', weight: 2, opacity: 0.9, dashArray: '5,5' })} />
              ) : null}
              <MapSearchBox onSelectLocation={(loc) => { setSearchTarget(loc); setFollowLatest(false); }} />
              <MapSearchController target={searchTarget} />
              <MapInteractionController />
              <MapAutoFocus point={mapFollowTarget} enabled={followLatest && mode !== 'simulation'} />
              {radiusEnabled && radiusKm > 0 && userLocation && (
                <Circle center={[userLocation.lat, userLocation.lon]} radius={radiusKm * 1000}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.06, weight: 2, dashArray: '6 4', opacity: 0.7 }}>
                  <Popup>
                    <strong>{t('radiusAlert')}</strong><br />
                    {radiusKm} km · {nearbyCount}<br />
                    {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                  </Popup>
                </Circle>
              )}
              {mapMarkers.map(({ point, dimmed }, index) => (
                <QuakeMarkerWithRings key={point.id} point={point} dimmed={dimmed} isLatest={index === 0}
                  displayColor={getDisplayMarkerColor(point, markerColorMode)} distanceKm={distanceTo(point.lat, point.lon)} />
              ))}
            </MapContainer>
          )}
          <div className="quake-map-legend" role="note">
            <div className="quake-map-legend__title">{markerColorMode === 'depth' ? t('depth') : t('magnitude')}</div>
            {markerColorMode === 'depth' ? (
              <ul className="quake-map-legend__list">
                <li><span className="quake-map-legend__swatch" style={{ background: '#ef4444' }} /> {t('shallow')} &lt; 70 km</li>
                <li><span className="quake-map-legend__swatch" style={{ background: '#f59e0b' }} /> 70–300 km</li>
                <li><span className="quake-map-legend__swatch" style={{ background: '#3b82f6' }} /> {t('deep')} &gt; 300 km</li>
                <li><span className="quake-map-legend__swatch" style={{ background: '#94a3b8' }} /> {t('noData')}</li>
              </ul>
            ) : (
              <ul className="quake-map-legend__list">
                <li><span className="quake-map-legend__swatch" style={{ background: '#22c55e' }} /> M &lt; 4</li>
                <li><span className="quake-map-legend__swatch" style={{ background: '#f59e0b' }} /> M 4–5</li>
                <li><span className="quake-map-legend__swatch" style={{ background: '#ef4444' }} /> M ≥ 5</li>
              </ul>
            )}
          </div>
        </div>

        <aside className="quake-side-panel">
          <div className="quake-side-section">
            <RadiusAlertPanel
              userLocation={userLocation} locationStatus={locationStatus}
              radiusKm={radiusKm} radiusEnabled={radiusEnabled}
              requestLocation={requestLocation} setRadiusKm={setRadiusKm}
              toggleRadius={toggleRadius} nearbyCount={nearbyCount}
            />
          </div>

          <div className="quake-side-section">
            <div className="panel-title"><Bell size={16} /> {t('statusHealth')}</div>
            <div className="panel-stat-grid">
              <div className="panel-stat"><span>{t('mode')}</span><strong>{mode === 'live' ? t('live') : t('simulation')}</strong></div>
              <div className="panel-stat"><span>{t('withinTimeRange')}</span><strong>{filteredPoints.length}</strong></div>
              <div className="panel-stat"><span>{t('pointsOnMap')}</span><strong>{mapMarkers.length}</strong></div>
              <div className="panel-stat"><span>{t('maxMagnitude')}</span><strong>{activityMaxMag > 0 ? activityMaxMag.toFixed(1) : '—'}</strong></div>
              <div className="panel-stat"><span>{t('followEarthquake')}</span><strong>{followLatest ? t('followActive') : t('followInactive')}</strong></div>
              <div className="panel-stat"><span>{t('alertProfile')}</span><strong>M≥{notifyThreshold} | {notifyRegion}</strong></div>
              <div className="panel-stat"><span>{t('dataRange')}</span><strong>{timeRange.toUpperCase()}</strong></div>
              <div className="panel-stat"><span>{t('apiLatency')}</span><strong>{health.latencyMs ? `${health.latencyMs} ms` : '-'}</strong></div>
              <div className="panel-stat"><span>{t('lastUpdate')}</span><strong>{health.lastSuccessAt || health.lastUpdatedAt || '-'}</strong></div>
            </div>
          </div>

          <div className="quake-side-section">
            <div className="panel-title panel-title--row">
              <span><List size={16} /> {t('recentEarthquakes')}</span>
              <span className="panel-title-meta">{sidebarRows.length}</span>
            </div>
            <div className="quake-list-toolbar">
              <div className="quake-list-toolbar__group">
                <span className="quake-list-toolbar__label">{t('show')}</span>
                {[10, 25, 50, 100].map((n) => (
                  <button key={n} type="button" className={`quake-pill ${listLimit === n ? 'active' : ''}`} onClick={() => setListLimit(n)}>{n}</button>
                ))}
              </div>
              <div className="quake-list-toolbar__group">
                <span className="quake-list-toolbar__label">{t('sortBy')}</span>
                <button type="button" className={`quake-pill ${sortBy === 'time' ? 'active' : ''}`} onClick={() => setSortBy('time')}>{t('sortTime')}</button>
                <button type="button" className={`quake-pill ${sortBy === 'magnitude' ? 'active' : ''}`} onClick={() => setSortBy('magnitude')}>{t('sortMagnitude')}</button>
              </div>
            </div>
            <div className="quake-activity-strip" aria-hidden="true">
              <span className="quake-activity-strip__max">{t('maxMagnitude')} <strong>{activityMaxMag > 0 ? activityMaxMag.toFixed(1) : '—'}</strong></span>
              <span className="quake-activity-strip__sep">·</span>
              <span>{sortBy === 'magnitude' ? t('sortMagnitude') : t('sortTime')}</span>
            </div>
            <div className="quake-list quake-list--radar">
              {sidebarRows.length === 0 ? (
                <div className="quake-list-empty">{t('noDataFilter')}</div>
              ) : (
                sidebarRows.map(({ point, dimmed }) => {
                  const level = getAlertLevel(point.magnitude);
                  return (
                    <div key={point.id}
                      className={`quake-row quake-row--${level}${dimmed ? ' quake-row--dimmed' : ''}${selectedPointId === point.id ? ' active-row' : ''}`}
                      onClick={() => { setSelectedPointId(point.id); setFollowLatest(false); }}
                    >
                      <div className="quake-row-mag"
                        style={{ backgroundColor: getDisplayMarkerColor(point, markerColorMode) }}
                        title={markerColorMode === 'depth' ? `${t('depth')}: ${point.kedalaman ?? '—'}` : `M${point.magnitude.toFixed(1)}`}
                      >
                        {point.magnitude.toFixed(1)}
                      </div>
                      <div className="quake-row-body">
                        <div className="quake-row-title">{point.wilayah}</div>
                        <div className="quake-row-meta">
                          {point.region && point.region !== 'Lainnya' && (
                            <span className="quake-row-region">{point.region}</span>
                          )}
                          <span className="quake-row-time">{point.waktu}</span>
                          {(() => {
                            const d = distanceTo(point.lat, point.lon);
                            return d != null ? (
                              <span className="quake-row-dist" title={t('fromYourLocation')}>
                                📍 {d < 1 ? '< 1' : Math.round(d)} km
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      {error ? (<p className="map-warning">BMKG {t('offline')}</p>) : null}
      {health.source === 'FALLBACK' ? (<p className="map-warning">FALLBACK</p>) : null}
    </section>
  );
}
