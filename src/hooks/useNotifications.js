'use client'
import { useCallback, useEffect, useRef, useState } from 'react';

// ══════════════════════════════════════════════════════
// SINGLETON AUDIO — satu objek audio global, tidak ghost
// ══════════════════════════════════════════════════════
let sirenAudio = null;
let beepAudio  = null;
let sirenTimer = null;

function stopAllAudio() {
  if (sirenTimer) { clearTimeout(sirenTimer); sirenTimer = null; }
  if (sirenAudio) {
    try { sirenAudio.pause(); sirenAudio.currentTime = 0; } catch {}
    sirenAudio = null;
  }
  if (beepAudio) {
    try { beepAudio.pause(); beepAudio.currentTime = 0; } catch {}
    beepAudio = null;
  }
}

function playSiren({ durationMs = 8000, level = 1 } = {}) {
  if (typeof window === 'undefined') return;
  stopAllAudio();
  try {
    sirenAudio = new Audio('/tornado-siren.mp3');
    sirenAudio.volume = level >= 4 ? 1.0 : level >= 2 ? 0.75 : 0.4;
    sirenAudio.loop   = false;
    sirenAudio.play().catch(err => console.warn('[Siren] Autoplay gagal:', err));
    sirenTimer = setTimeout(() => {
      if (sirenAudio) {
        try { sirenAudio.pause(); sirenAudio.currentTime = 0; } catch {}
        sirenAudio = null;
      }
    }, durationMs);
  } catch (err) {
    console.warn('[Siren] Audio gagal:', err);
  }
}

function playBeep() {
  if (typeof window === 'undefined') return;
  if (beepAudio) {
    try { beepAudio.pause(); beepAudio.currentTime = 0; } catch {}
  }
  try {
    beepAudio = new Audio('/alert.m4a');
    beepAudio.volume = 0.5;
    beepAudio.play().catch(err => console.warn('[Beep] Autoplay gagal:', err));
  } catch { /* ignore */ }
}

const LS_THRESHOLD_KEY = 'eq-notif-threshold';

function loadThreshold() {
  if (typeof window === 'undefined') return 4.0;
  const v = parseFloat(localStorage.getItem(LS_THRESHOLD_KEY) ?? '');
  return Number.isFinite(v) && v >= 0 && v <= 10 ? v : 4.0;
}

// ══════════════════════════════════════════════════════
export function useNotifications({
  esp32AlertLevel = 0,
  esp32Connected  = false,
  notificationsEnabled = true,
  sirenEnabled = true,
} = {}) {
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [panelOpen, setPanelOpen]           = useState(false);
  // Magnitude threshold — hanya notifikasi gempa di atas nilai ini
  const [notifThreshold, setNotifThresholdState] = useState(loadThreshold);

  const esp32PrevLevelRef = useRef(0);
  const sirenActiveRef    = useRef(false);

  // Persist threshold
  const setNotifThreshold = useCallback((v) => {
    const clamped = Math.min(10, Math.max(0, parseFloat(v) || 0));
    setNotifThresholdState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_THRESHOLD_KEY, String(clamped));
    }
  }, []);

  // ── Uji Alarm ──────────────────────────────────────
  const triggerTestAlarm = useCallback(() => {
    if (!sirenEnabled) return;
    stopAllAudio();
    sirenActiveRef.current = true;
    playSiren({ durationMs: 8000, level: 3 });
    // eslint-disable-next-line no-use-before-define
    addNotificationInternal({
      type: 'warning',
      title: 'Uji Alarm',
      message: 'Sirine tornado aktif — ini hanya tes.',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sirenEnabled]);

  // ── Stop Alarm ─────────────────────────────────────
  const stopAlarm = useCallback(() => {
    stopAllAudio();
    sirenActiveRef.current = false;
  }, []);

  // ── Helper internal: tambah notifikasi (tanpa filter threshold) ──
  const addNotificationInternal = useCallback((n) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [
      { ...n, id, timestamp: n.timestamp ?? Date.now(), time: new Date().toLocaleTimeString('id-ID') },
      ...prev,
    ].slice(0, 30));
    setUnreadCount(c => c + 1);
  }, []);

  // ── Public addNotification: respects magnitude threshold ──────
  const addNotification = useCallback((n) => {
    // Kalau ada magnitude di notifikasi, cek threshold
    const mag = n.magnitude ?? n.mag ?? null;
    if (mag !== null && Number.isFinite(mag) && mag < notifThreshold) return;
    addNotificationInternal(n);
  }, [notifThreshold, addNotificationInternal]);

  // ── Notifikasi ESP32 ────────────────────────────────
  useEffect(() => {
    if (!esp32Connected || !notificationsEnabled) return;
    const prev = esp32PrevLevelRef.current;
    if (esp32AlertLevel <= prev) {
      esp32PrevLevelRef.current = esp32AlertLevel;
      return;
    }
    esp32PrevLevelRef.current = esp32AlertLevel;

    // ESP32 alerts bypass magnitude threshold (sensor lokal selalu penting)
    if (esp32AlertLevel >= 3) {
      if (sirenEnabled) { sirenActiveRef.current = true; playSiren({ level: esp32AlertLevel }); }
      addNotificationInternal({ type: 'error', title: '🚨 Gempa Terdeteksi Sensor!', message: `Level bahaya ESP32: ${esp32AlertLevel}` });
    } else if (esp32AlertLevel >= 1) {
      playBeep();
      addNotificationInternal({ type: 'warning', title: '⚠️ Getaran Terdeteksi', message: `Sensor level: ${esp32AlertLevel}` });
    }
  }, [esp32AlertLevel, esp32Connected, notificationsEnabled, sirenEnabled, addNotificationInternal]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    panelOpen,
    setPanelOpen,
    openPanel:  () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    addNotification,
    dismissNotification,
    markAllRead,
    clearAll,
    triggerTestAlarm,
    stopAlarm,
    playSiren,
    playBeep,
    notifThreshold,
    setNotifThreshold,
  };
}
