"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MAX_POINTS = 50;
const POLL_INTERVAL_MS = 1000;
const MODE_LABELS = [
  'Dashboard',
  'Live Map',
  'Analytics',
  'History',
  'Chart',
  'Heatmap',
  'Sensor',
  'System',
  'Settings',
];

const sanitizeIp = (value) =>
  String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');

const toBaseUrl = (ip) => {
  const sanitized = sanitizeIp(ip);
  if (!sanitized) return '';
  // Jika sudah ada protokol, gunakan apa adanya
  if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) return sanitized;
  return `http://${sanitized}`;
};

const parseNumeric = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const getConnectionIssueMessage = (baseUrl, error) => {
  if (
    typeof window !== 'undefined'
    && window.location.protocol === 'https:'
    && baseUrl.startsWith('http://')
  ) {
    return 'Browser memblokir koneksi ke ESP32 lokal karena dashboard ini berjalan di HTTPS, sedangkan ESP32 masih HTTP.';
  }

  return error instanceof Error ? error.message : 'Koneksi ke ESP32 gagal.';
};

export const useESP32 = () => {
  const [status, setStatus] = useState('AMAN');
  const [connected, setConnected] = useState(false);
  const [sensorReady, setSensorReady] = useState(false);
  const [dataPoints, setDataPoints] = useState({ x: [], y: [], z: [] });
  const [threshold, setThreshold] = useState(1.5);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [alertLevel, setAlertLevel] = useState(0);
  const [esp32Ip, setEsp32Ip] = useState(() => localStorage.getItem('esp32Ip') || '');
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [connectionIssue, setConnectionIssue] = useState('');
  const [pgaCms2, setPgaCms2] = useState(0);
  const [pgaPeakCms2, setPgaPeakCms2] = useState(0);

  const pollTimerRef = useRef(null);
  const thresholdTimerRef = useRef(null);
  const requestLockRef = useRef(false);
  const baseUrlRef = useRef(toBaseUrl(localStorage.getItem('esp32Ip') || ''));

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const clearThresholdTimer = useCallback(() => {
    if (thresholdTimerRef.current) {
      window.clearTimeout(thresholdTimerRef.current);
      thresholdTimerRef.current = null;
    }
  }, []);

  const applyStatusPayload = useCallback((payload) => {
    const x = parseNumeric(payload?.x);
    const y = parseNumeric(payload?.y);
    const z = parseNumeric(payload?.z);

    setConnected(true);
    setSensorReady(Boolean(payload?.sensorReady ?? payload?.sensor));

    // Support both ESP32_BMKG format (status) and OBSIDIAN format (status/alert)
    const rawStatus = typeof payload?.status === 'string' ? payload.status : 'AMAN';
    // OBSIDIAN uses: AMAN, LEMAH, SEDANG, KUAT, EKSTREM → map to AMAN/WASPADA/BAHAYA
    let mappedStatus = rawStatus;
    if (['LEMAH'].includes(rawStatus)) mappedStatus = 'WASPADA';
    if (['SEDANG', 'KUAT', 'EKSTREM'].includes(rawStatus)) mappedStatus = 'BAHAYA';
    setStatus(mappedStatus);

    setThreshold(parseNumeric(payload?.threshold, 1.5));
    // Support alertLevel from both formats
    const lvl = parseNumeric(payload?.alertLevel ?? payload?.alert_level, 0);
    setAlertLevel(lvl > 0 ? lvl : (payload?.alert ? 1 : 0));
    setCurrentModeIndex(parseNumeric(payload?.mode, 0));
    // PGA data dari firmware baru
    setPgaCms2(parseNumeric(payload?.pga_cms2, 0));
    setPgaPeakCms2(parseNumeric(payload?.pga_peak_cms2, 0));

    setDataPoints((previous) => ({
      x: [...previous.x, x].slice(-MAX_POINTS),
      y: [...previous.y, y].slice(-MAX_POINTS),
      z: [...previous.z, z].slice(-MAX_POINTS),
    }));
  }, []);

  const fetchStatus = useCallback(async ({ silent = false } = {}) => {
    const baseUrl = baseUrlRef.current;
    if (!baseUrl || requestLockRef.current) {
      return null;
    }

    requestLockRef.current = true;

    try {
      // Coba /api/status dulu (format lama), fallback ke /api (OBSIDIAN format)
      let response = await fetch(`${baseUrl}/api/status`, { cache: 'no-store' }).catch(() => null);
      if (!response || !response.ok) {
        response = await fetch(`${baseUrl}/api`, { cache: 'no-store' });
      }
      if (!response.ok) {
        throw new Error(`ESP32 status error ${response.status}`);
      }

      const payload = await response.json();
      applyStatusPayload(payload);
      setConnectionIssue('');
      return payload;
    } catch (error) {
      setConnected(false);
      setSensorReady(false);
      setConnectionIssue(getConnectionIssueMessage(baseUrl, error));
      if (!silent) {
        // Jangan spam console untuk Mixed Content (HTTPS→HTTP) — sudah ditampilkan di UI
        const isMixedContent =
          typeof window !== 'undefined' &&
          window.location.protocol === 'https:' &&
          baseUrl.startsWith('http://');
        if (!isMixedContent) {
          console.warn('[ESP32] Gagal mengambil status', error);
        }
      }
      return null;
    } finally {
      requestLockRef.current = false;
    }
  }, [applyStatusPayload]);

  const sendCommand = useCallback(async (command) => {
    const baseUrl = baseUrlRef.current;
    if (!baseUrl) {
      return { ok: false, message: 'ESP32 belum dipilih.' };
    }

    // Map command names: OBSIDIAN uses short codes via GET /cmd?c=
    const obsidianMap = {
      'RESET_ALERT': 'RESET',
      'CALIBRATE':   'CALIB',
      'SIMULATE':    'BUZZ',
      'CHANGE_MODE': 'MODE',
    };

    try {
      let response;
      const obsCmd = obsidianMap[command];

      if (obsCmd) {
        // Coba OBSIDIAN format dulu (GET /cmd?c=)
        response = await fetch(`${baseUrl}/cmd?c=${encodeURIComponent(obsCmd)}`, {
          cache: 'no-store',
        }).catch(() => null);
      }

      // Fallback ke format lama (POST /api/command)
      if (!response || !response.ok) {
        response = await fetch(`${baseUrl}/api/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: `cmd=${encodeURIComponent(command)}`,
        });
      }

      const payload = await response.json().catch(() => ({ ok: response.ok }));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message || `ESP32 command error ${response.status}`);
      }

      setConnected(true);
      setConnectionIssue('');
      await fetchStatus({ silent: true });
      return payload;
    } catch (error) {
      // Mixed Content (HTTPS→HTTP) tidak disconnect — hanya catat sebagai warning
      const isMixedContent =
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        baseUrl.startsWith('http://');

      if (!isMixedContent) {
        setConnected(false);
      }
      setConnectionIssue(getConnectionIssueMessage(baseUrl, error));
      // Hanya log sekali, bukan setiap polling
      if (!isMixedContent) {
        console.warn('[ESP32] Gagal mengirim command', command, error);
      }
      return { ok: false, message: error instanceof Error ? error.message : 'Command gagal.' };
    }
  }, [fetchStatus]);

  const connectToESP32 = useCallback((ip) => {
    const sanitized = sanitizeIp(ip);
    clearPolling();
    clearThresholdTimer();

    if (!sanitized) {
      baseUrlRef.current = '';
      setEsp32Ip('');
      setConnected(false);
      setSensorReady(false);
      localStorage.removeItem('esp32Ip');
      return;
    }

    const baseUrl = toBaseUrl(sanitized);
    baseUrlRef.current = baseUrl;
    setEsp32Ip(sanitized);
    setConnectionIssue('');
    localStorage.setItem('esp32Ip', sanitized);

    void fetchStatus();
    pollTimerRef.current = window.setInterval(() => {
      void fetchStatus({ silent: true });
    }, POLL_INTERVAL_MS);
  }, [clearPolling, clearThresholdTimer, fetchStatus]);

  const disconnectESP32 = useCallback(() => {
    clearPolling();
    clearThresholdTimer();
    baseUrlRef.current = '';
    setEsp32Ip('');
    setConnected(false);
    setSensorReady(false);
    setAlertLevel(0);
    setConnectionIssue('');
    localStorage.removeItem('esp32Ip');
  }, [clearPolling, clearThresholdTimer]);

  const calibrateSensor = useCallback(async () => {
    if (!connected || !sensorReady) {
      return {
        ok: false,
        message: !connected ? 'ESP32 belum terhubung.' : 'Sensor belum siap untuk kalibrasi.',
      };
    }

    setIsCalibrating(true);
    try {
      const result = await sendCommand('CALIBRATE');
      window.setTimeout(() => {
        void fetchStatus({ silent: true });
      }, 600);
      return result;
    } finally {
      window.setTimeout(() => setIsCalibrating(false), 1200);
    }
  }, [connected, fetchStatus, sendCommand, sensorReady]);

  const changeMode = useCallback(async () => {
    if (!connected) {
      return { ok: false, message: 'ESP32 belum terhubung.' };
    }

    setIsChangingMode(true);
    try {
      return await sendCommand('CHANGE_MODE');
    } finally {
      window.setTimeout(() => setIsChangingMode(false), 500);
    }
  }, [connected, sendCommand]);

  const triggerSimulation = useCallback(async () => {
    if (!connected) {
      return { ok: false, message: 'ESP32 belum terhubung.' };
    }
    return await sendCommand('SIMULATE');
  }, [connected, sendCommand]);

  const resetAlert = useCallback(async () => {
    if (!connected) {
      return { ok: false, message: 'ESP32 belum terhubung.' };
    }
    return await sendCommand('RESET_ALERT');
  }, [connected, sendCommand]);

  const updateThreshold = useCallback((value) => {
    const nextValue = Math.max(0.5, Math.min(4, Number(value) || 1.5));
    setThreshold(nextValue);

    if (!connected) {
      return;
    }

    clearThresholdTimer();
    thresholdTimerRef.current = window.setTimeout(() => {
      void sendCommand(`SET_THRESHOLD:${nextValue.toFixed(1)}`);
    }, 180);
  }, [clearThresholdTimer, connected, sendCommand]);

  useEffect(() => {
    if (esp32Ip) {
      connectToESP32(esp32Ip);
    }

    return () => {
      clearPolling();
      clearThresholdTimer();
    };
  }, [clearPolling, clearThresholdTimer, connectToESP32, esp32Ip]);

  const currentModeLabel = useMemo(
    () => MODE_LABELS[currentModeIndex] || `Mode ${currentModeIndex}`,
    [currentModeIndex],
  );

  return {
    status,
    connected,
    sensorReady,
    dataPoints,
    threshold,
    updateThreshold,
    calibrateSensor,
    isCalibrating,
    triggerSimulation,
    resetAlert,
    alertLevel,
    esp32Ip,
    connectToESP32,
    disconnectESP32,
    currentModeIndex,
    currentModeLabel,
    changeMode,
    isChangingMode,
    connectionIssue,
    pgaCms2,
    pgaPeakCms2,
  };
};
