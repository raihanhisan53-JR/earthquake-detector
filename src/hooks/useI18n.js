'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ══════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════
const translations = {
  id: {
    // App
    appName: 'Earthquake Detector',
    appSubtitle: 'Data BMKG & Sensor ESP32 Lokal',

    // Nav / Sidebar
    overview: 'Ringkasan',
    earthquake: 'Gempa Bumi Terkini',
    map: 'Peta Gempa',
    googleMaps: 'Google Maps',
    analytics: 'Analitik & Tren',
    liveCctv: 'Pantau Live',
    education: 'Edukasi',
    weather: 'Cuaca & Iklim',
    esp32: 'ESP32 Sensor',
    history: 'Riwayat',
    aria: 'ARIA AI',
    profile: 'Profil',

    // Topbar
    alertOn: 'Alert On',
    alertOff: 'Alert Off',
    online: 'Online',
    offline: 'Offline',
    testAlarm: 'Uji Alarm',
    stopAlarm: 'Stop Alarm',

    // Overview
    summary: 'Ringkasan',
    summaryDesc: 'Gempa terbaru dan status sensor lokal.',
    quickAccess: 'Akses cepat',
    quickAccessTag: 'BUKA MODUL LENGKAP TANPA DUPLIKASI',
    totalEarthquakes: 'Total Gempa',
    totalEarthquakesValue: '{count} gempa',
    maxMagnitude: 'Magnitudo Maks',
    maxMagnitudeValue: 'M{mag}',
    dataFreshness: 'Pembaruan Data',
    dataFreshnessValue: '{time}',
    sensorStatus: 'Status Sensor',
    systemHealth: 'Kesehatan Sistem',
    bmkgStatus: 'BMKG',
    usgsStatus: 'USGS',
    dbStatus: 'Database',
    online: 'Online',
    offline: 'Offline',
    recentActivity: 'Aktivitas Terkini',
    recentActivityEmpty: 'Belum ada data gempa',
    viewAll: 'Lihat Semua',
    loading: 'Memuat...',
    lastDay: '24 jam terakhir',
    today: 'Hari ini',
    thisWeek: 'Minggu ini',

    // Notification panel
    notifications: 'Notifikasi Gempa',
    noNotifications: 'Belum ada notifikasi',
    noNotificationsHint: 'Gempa M≥4.0 akan muncul otomatis',
    clearAll: 'Hapus semua',
    enableNotif: 'Aktifkan notifikasi',
    disableNotif: 'Matikan notifikasi',
    desktopNotifAllow: 'Aktifkan notifikasi ke laptop/PC',
    desktopNotifAllow2: 'Izinkan',
    desktopNotifBlocked: '⚠️ Notifikasi diblokir browser. Buka pengaturan situs untuk mengizinkan.',
    desktopNotifActive: '✓ Notifikasi desktop aktif',
    notifFooter: 'BMKG tiap 5m · USGS tiap 5m',
    pushActive: '🔔 Push notif aktif',
    pushInactive: 'Push notif belum aktif',
    minMagnitude: 'Min. Magnitudo',
    minMagnitudeHint: 'Hanya tampilkan notifikasi gempa di atas threshold ini',

    // Map
    mapTitle: 'Peta Gempa Command Center',
    loading: 'Memuat…',
    refresh: 'Refresh',
    live: 'LIVE',
    simulation: 'SIMULASI',
    filterMagnitude: 'Filter Magnitudo',
    filterRegion: 'Filter Wilayah',
    timeRange: 'Rentang Waktu',
    mapLayer: 'Layer Peta',
    notifMagnitude: 'Notifikasi Magnitudo',
    notifRegion: 'Region Notifikasi',
    markerColor: 'Warna titik peta',
    followEarthquake: 'Ikuti Gempa',
    plateBoundaries: 'Batas lempeng',
    enableBrowserNotif: 'Aktifkan Notifikasi Browser',
    all: 'Semua',
    allData: 'Semua data',
    last1h: '1 jam terakhir',
    last6h: '6 jam terakhir',
    last24h: '24 jam terakhir',
    last7d: '7 hari terakhir',
    sortTime: 'Waktu',
    sortMagnitude: 'Magnitudo',
    show: 'Tampilkan',
    sortBy: 'Urutkan',
    recentEarthquakes: 'Gempa terbaru',
    statusHealth: 'Status & kesehatan',
    mode: 'Mode',
    withinTimeRange: 'Dalam rentang waktu',
    pointsOnMap: 'Titik di peta',
    maxMagnitude: 'M magnitudo maks',
    followActive: 'Aktif',
    followInactive: 'Nonaktif',
    alertProfile: 'Profil Alert',
    dataRange: 'Rentang Data',
    apiLatency: 'Latency API',
    lastUpdate: 'Update Terakhir',
    noDataFilter: 'Tidak ada data untuk filter ini.',
    depth: 'Kedalaman',
    magnitude: 'Magnitudo',
    shallow: 'Dangkal',
    medium: 'Menengah',
    deep: 'Dalam',
    noData: 'Tanpa data',
    timeLapse: 'Time-Lapse',
    pause: 'Pause',
    play: 'Play',
    reset: 'Ulang',
    map2d: 'Map 2D',
    globe3d: 'Globe 3D',

    // Radius alert
    radiusAlert: 'Radius Alert',
    radiusOff: 'Nonaktif',
    locationGranted: 'Lokasi ditemukan',
    locationRequesting: 'Meminta izin…',
    locationDenied: 'Akses ditolak',
    locationUnsupported: 'Tidak didukung',
    locationIdle: 'Belum aktif',
    allowLocation: 'Izinkan',
    locationDeniedHint: '⚠️ Izin lokasi ditolak. Buka pengaturan browser → izinkan akses lokasi untuk situs ini.',
    noEarthquakeInRadius: 'Tidak ada gempa dalam radius',
    earthquakesInRadius: 'gempa terdeteksi dalam radius',
    fromYourLocation: 'dari lokasi Anda',

    // ESP32
    esp32Online: 'ESP32 Online',
    esp32Offline: 'ESP32 Offline',

    // Auth
    signOut: 'Sign out',
    manageAccount: 'Manage your Account',
    hi: 'Hi',

    // Footer
    footer: '© 2026 Raihan Hisan · TECTRA PRO Earthquake Detector',
  },

  en: {
    // App
    appName: 'Earthquake Detector',
    appSubtitle: 'BMKG Data & Local ESP32 Sensor',

    // Nav / Sidebar
    overview: 'Overview',
    earthquake: 'Latest Earthquakes',
    map: 'Earthquake Map',
    googleMaps: 'Google Maps',
    analytics: 'Analytics & Trends',
    liveCctv: 'Live Monitor',
    education: 'Education',
    weather: 'Weather & Climate',
    esp32: 'ESP32 Sensor',
    history: 'History',
    aria: 'ARIA AI',
    profile: 'Profile',

    // Topbar
    alertOn: 'Alert On',
    alertOff: 'Alert Off',
    online: 'Online',
    offline: 'Offline',
    testAlarm: 'Test Alarm',
    stopAlarm: 'Stop Alarm',

    // Overview
    summary: 'Overview',
    summaryDesc: 'Latest earthquakes and local sensor status.',
    quickAccess: 'Quick access',
    quickAccessTag: 'OPEN FULL MODULES WITHOUT DUPLICATION',
    totalEarthquakes: 'Total Earthquakes',
    totalEarthquakesValue: '{count} quakes',
    maxMagnitude: 'Max Magnitude',
    maxMagnitudeValue: 'M{mag}',
    dataFreshness: 'Data Freshness',
    dataFreshnessValue: '{time}',
    sensorStatus: 'Sensor Status',
    systemHealth: 'System Health',
    bmkgStatus: 'BMKG',
    usgsStatus: 'USGS',
    dbStatus: 'Database',
    online: 'Online',
    offline: 'Offline',
    recentActivity: 'Recent Activity',
    recentActivityEmpty: 'No earthquake data yet',
    viewAll: 'View All',
    loading: 'Loading...',
    lastDay: 'Last 24 hours',
    today: 'Today',
    thisWeek: 'This week',

    // Notification panel
    notifications: 'Earthquake Notifications',
    noNotifications: 'No notifications yet',
    noNotificationsHint: 'M≥4.0 earthquakes will appear automatically',
    clearAll: 'Clear all',
    enableNotif: 'Enable notifications',
    disableNotif: 'Disable notifications',
    desktopNotifAllow: 'Enable desktop notifications',
    desktopNotifAllow2: 'Allow',
    desktopNotifBlocked: '⚠️ Notifications blocked by browser. Open site settings to allow.',
    desktopNotifActive: '✓ Desktop notifications active',
    notifFooter: 'BMKG every 5m · USGS every 5m',
    pushActive: '🔔 Push notifications active',
    pushInactive: 'Push notifications inactive',
    minMagnitude: 'Min. Magnitude',
    minMagnitudeHint: 'Only show notifications for earthquakes above this threshold',

    // Map
    mapTitle: 'Earthquake Map Command Center',
    loading: 'Loading…',
    refresh: 'Refresh',
    live: 'LIVE',
    simulation: 'SIMULATION',
    filterMagnitude: 'Magnitude Filter',
    filterRegion: 'Region Filter',
    timeRange: 'Time Range',
    mapLayer: 'Map Layer',
    notifMagnitude: 'Notification Magnitude',
    notifRegion: 'Notification Region',
    markerColor: 'Marker color mode',
    followEarthquake: 'Follow Earthquake',
    plateBoundaries: 'Plate boundaries',
    enableBrowserNotif: 'Enable Browser Notifications',
    all: 'All',
    allData: 'All data',
    last1h: 'Last 1 hour',
    last6h: 'Last 6 hours',
    last24h: 'Last 24 hours',
    last7d: 'Last 7 days',
    sortTime: 'Time',
    sortMagnitude: 'Magnitude',
    show: 'Show',
    sortBy: 'Sort by',
    recentEarthquakes: 'Recent earthquakes',
    statusHealth: 'Status & health',
    mode: 'Mode',
    withinTimeRange: 'Within time range',
    pointsOnMap: 'Points on map',
    maxMagnitude: 'Max magnitude',
    followActive: 'Active',
    followInactive: 'Inactive',
    alertProfile: 'Alert Profile',
    dataRange: 'Data Range',
    apiLatency: 'API Latency',
    lastUpdate: 'Last Update',
    noDataFilter: 'No data for this filter.',
    depth: 'Depth',
    magnitude: 'Magnitude',
    shallow: 'Shallow',
    medium: 'Medium',
    deep: 'Deep',
    noData: 'No data',
    timeLapse: 'Time-Lapse',
    pause: 'Pause',
    play: 'Play',
    reset: 'Reset',
    map2d: 'Map 2D',
    globe3d: 'Globe 3D',

    // Radius alert
    radiusAlert: 'Radius Alert',
    radiusOff: 'Off',
    locationGranted: 'Location found',
    locationRequesting: 'Requesting permission…',
    locationDenied: 'Access denied',
    locationUnsupported: 'Not supported',
    locationIdle: 'Not active',
    allowLocation: 'Allow',
    locationDeniedHint: '⚠️ Location permission denied. Open browser settings → allow location access for this site.',
    noEarthquakeInRadius: 'No earthquakes within radius',
    earthquakesInRadius: 'earthquakes detected within radius',
    fromYourLocation: 'from your location',

    // ESP32
    esp32Online: 'ESP32 Online',
    esp32Offline: 'ESP32 Offline',

    // Auth
    signOut: 'Sign out',
    manageAccount: 'Manage your Account',
    hi: 'Hi',

    // Footer
    footer: '© 2026 Raihan Hisan · TECTRA PRO Earthquake Detector',
  },
};

// ══════════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════════
import React from 'react';

const I18nContext = createContext({
  lang: 'id',
  t: (key) => key,
  setLang: () => {},
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('id');

  useEffect(() => {
    const saved = localStorage.getItem('eq-lang');
    if (saved === 'en' || saved === 'id') setLangState(saved);
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem('eq-lang', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations['id']?.[key] ?? key;
  }, [lang]);

  return React.createElement(I18nContext.Provider, { value: { lang, t, setLang } }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
