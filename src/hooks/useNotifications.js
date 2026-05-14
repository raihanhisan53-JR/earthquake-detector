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
  stopAllAudio(); // Stop sebelumnya dulu
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

// ══════════════════════════════════════════════════════
export function useNotifications({
  esp32AlertLevel = 0,
  esp32Connected  = false,
  notificationsEnabled = true,
  sirenEnabled = true,
} = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [panelOpen, setPanelOpen]         = useState(false);

  const esp32PrevLevelRef    = useRef(0);
  const sirenActiveRef       = useRef(false);

  // ── Uji Alarm ──────────────────────────────────────
  const triggerTestAlarm = useCallback(() => {
    if (!sirenEnabled) return;
    stopAllAudio(); // pastikan audio lama berhenti
    sirenActiveRef.current = true;
    playSiren({ durationMs: 8000, level: 3 });
    addNotification({
      type: 'warning',
      title: 'Uji Alarm',
      message: 'Sirine tornado aktif — ini hanya tes.',
    });
  }, [sirenEnabled]);

  // ── Stop Alarm ─────────────────────────────────────
  const stopAlarm = useCallback(() => {
    stopAllAudio();
    sirenActiveRef.current = false;
  }, []);

  // ── Notifikasi ESP32 ────────────────────────────────
  useEffect(() => {
    if (!esp32Connected || !notificationsEnabled) return;
    const prev = esp32PrevLevelRef.current;
    if (esp32AlertLevel <= prev) {
      esp32PrevLevelRef.current = esp32AlertLevel;
      return;
    }
    esp32PrevLevelRef.current = esp32AlertLevel;

    if (esp32AlertLevel >= 3) {
      if (sirenEnabled) { sirenActiveRef.current = true; playSiren({ level: esp32AlertLevel }); }
      addNotification({ type: 'error', title: '🚨 Gempa Terdeteksi Sensor!', message: `Level bahaya ESP32: ${esp32AlertLevel}` });
    } else if (esp32AlertLevel >= 1) {
      playBeep();
      addNotification({ type: 'warning', title: '⚠️ Getaran Terdeteksi', message: `Sensor level: ${esp32AlertLevel}` });
    }
  }, [esp32AlertLevel, esp32Connected, notificationsEnabled, sirenEnabled]);

  // ── Helper: tambah notifikasi ───────────────────────
  const addNotification = useCallback((n) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [{ ...n, id, time: new Date().toLocaleTimeString('id-ID') }, ...prev].slice(0, 20));
    setUnreadCount(c => c + 1);
  }, []);

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
    addNotification,
    dismissNotification,
    markAllRead,
    clearAll,
    triggerTestAlarm,
    stopAlarm,
    playSiren,
    playBeep,
  };
}
