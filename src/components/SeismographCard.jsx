"use client"
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, FlaskConical, Sliders, RefreshCw, Settings } from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
const EMPTY_SERIES = [];

/**
 * Convert peak acceleration (g) to approximate MMI scale.
 * Based on Wald et al. (1999) ShakeMap relationship.
 */
function accelToMMI(peakG) {
  if (peakG <= 0) return 1;
  const gal = peakG * 980; // convert g to cm/s²
  if (gal < 0.17) return 1;
  if (gal < 1.4) return 2;
  if (gal < 3.9) return 3;
  if (gal < 9.2) return 4;
  if (gal < 18) return 5;
  if (gal < 34) return 6;
  if (gal < 65) return 7;
  if (gal < 124) return 8;
  if (gal < 235) return 9;
  return 10;
}

function mmiToRoman(mmi) {
  const roman = ['I', 'I-II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const idx = Math.max(0, Math.min(roman.length - 1, mmi - 1));
  return roman[idx];
}

function mmiLabel(mmi) {
  if (mmi <= 2) return 'TIDAK DIRASAKAN';
  if (mmi <= 3) return 'LEMAH';
  if (mmi <= 4) return 'RINGAN';
  if (mmi <= 5) return 'SEDANG';
  if (mmi <= 6) return 'KUAT';
  if (mmi <= 7) return 'SANGAT KUAT';
  return 'MERUSAK';
}

function mmiBadgeClass(mmi) {
  if (mmi <= 2) return 'mmi-safe';
  if (mmi <= 4) return 'mmi-warning';
  return 'mmi-danger';
}

export default function SeismographCard({
  dataPoints = { x: EMPTY_SERIES, y: EMPTY_SERIES, z: EMPTY_SERIES },
  status = 'AMAN',
  threshold = 1.5,
  updateThreshold = () => {},
  calibrateSensor = () => {},
  isCalibrating = false,
  triggerSimulation = () => {},
  resetAlert = () => {},
  alertLevel = 0,
  connected = false,
  sensorReady = false,
  currentModeLabel = 'Dashboard',
  changeMode = () => {},
  isChangingMode = false,
  connectionIssue = '',
  notifyUser = () => {},
  pgaCms2 = 0,
  pgaPeakCms2 = 0,
}) {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const [showX, setShowX] = useState(true);
  const [showY, setShowY] = useState(true);
  const [showZ, setShowZ] = useState(true);

  const [simDataX, setSimDataX] = useState(Array(50).fill(0));
  const [simDataY, setSimDataY] = useState(Array(50).fill(0));
  const [simDataZ, setSimDataZ] = useState(Array(50).fill(0));

  useEffect(() => {
    if (connected) return;
    const interval = setInterval(() => {
      setSimDataX(prev => [...prev.slice(1), (Math.random() - 0.5) * 0.05]);
      setSimDataY(prev => [...prev.slice(1), (Math.random() - 0.5) * 0.05]);
      setSimDataZ(prev => {
         // Fake 'heartbeat' spike for dramatic effect
         const spike = Math.random() > 0.96 ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.05;
         return [...prev.slice(1), spike];
      });
    }, 100);
    return () => clearInterval(interval);
  }, [connected]);

  const xPoints = useMemo(() => connected ? (Array.isArray(dataPoints.x) ? dataPoints.x : EMPTY_SERIES) : simDataX, [dataPoints.x, connected, simDataX]);
  const yPoints = useMemo(() => connected ? (Array.isArray(dataPoints.y) ? dataPoints.y : EMPTY_SERIES) : simDataY, [dataPoints.y, connected, simDataY]);
  const zPoints = useMemo(() => connected ? (Array.isArray(dataPoints.z) ? dataPoints.z : EMPTY_SERIES) : simDataZ, [dataPoints.z, connected, simDataZ]);

  const maxG = useMemo(() => {
    const pointCount = Math.max(xPoints.length, yPoints.length, zPoints.length);
    let peak = 0;
    for (let i = 0; i < pointCount; i++) {
      const x = xPoints[i] ?? 0;
      const y = yPoints[i] ?? 0;
      const z = zPoints[i] ?? 0;
      const currentG = Math.sqrt(x*x + y*y + z*z);
      if (currentG > peak) peak = currentG;
    }
    return peak;
  }, [xPoints, yPoints, zPoints]);

  const mmi = useMemo(() => accelToMMI(maxG), [maxG]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const theme = document.documentElement.getAttribute('data-theme');
    
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(50).fill(''),
        datasets: [
          { label: 'X', data: [], borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, fill: false },
          { label: 'Y', data: [], borderColor: '#10b981', borderWidth: 2, pointRadius: 0, fill: false },
          { label: 'Z', data: [], borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 0, fill: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            min: -2.5,
            max: 2.5,
            grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, []);

  // Update chart data + axis visibility
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data = showX ? xPoints : [];
    chartRef.current.data.datasets[1].data = showY ? yPoints : [];
    chartRef.current.data.datasets[2].data = showZ ? zPoints : [];
    chartRef.current.data.datasets[0].hidden = !showX;
    chartRef.current.data.datasets[1].hidden = !showY;
    chartRef.current.data.datasets[2].hidden = !showZ;
    chartRef.current.update();
  }, [xPoints, yPoints, zPoints, showX, showY, showZ]);

  const getStatusClass = () => {
    if (status === 'AMAN') return 'safe';
    if (status === 'WASPADA') return 'warning';
    return 'danger';
  };

  const alertActive = alertLevel > 0;
  const controlDisabled = !connected;
  const calibrateDisabled = !connected || !sensorReady || isCalibrating;
  const modeDisabled = !connected || isChangingMode;

  const handleCalibration = async () => {
    const result = await calibrateSensor();
    if (result?.ok === false) {
      notifyUser({
        type: 'error',
        title: 'Kalibrasi gagal',
        message: result.message || 'Sensor belum siap dikalibrasi.',
      });
      return;
    }

    notifyUser({
      type: 'info',
      title: 'Kalibrasi dimulai',
      message: 'ESP32 sedang menstabilkan pembacaan sensor MPU6500.',
    });
  };

  const handleModeChange = async () => {
    const result = await changeMode();
    if (result?.ok === false) {
      notifyUser({
        type: 'error',
        title: 'Mode belum berubah',
        message: result.message || 'Perubahan mode ESP32 gagal dijalankan.',
      });
      return;
    }

    notifyUser({
      type: 'info',
      title: 'Mode sensor diganti',
      message: 'Perintah perubahan mode sudah dikirim ke ESP32.',
    });
  };

  const handleSimulation = async () => {
    const result = await triggerSimulation();
    if (result?.ok === false) {
      notifyUser({
        type: 'error',
        title: 'Simulasi gagal',
        message: result.message || 'Perintah simulasi sensor tidak berhasil dikirim.',
      });
      return;
    }

    notifyUser({
      type: 'warning',
      title: 'Simulasi sensor aktif',
      message: 'Perintah simulasi sudah dikirim ke ESP32 dan menunggu status alert masuk.',
    });
  };

  const handleResetAlert = async () => {
    const result = await resetAlert();
    if (result?.ok === false) {
      notifyUser({
        type: 'error',
        title: 'Reset alert gagal',
        message: result.message || 'Alert sensor belum berhasil dihentikan.',
      });
      return;
    }

    notifyUser({
      type: 'info',
      title: 'Alert sensor di-reset',
      message: 'Status alert lokal sudah diminta kembali ke mode aman.',
    });
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2><Activity size={20} className={!connected ? 'pulse-icon' : ''} /> Monitoring Seismik Lokal</h2>
        <span className="badge badge-live" style={!connected ? { backgroundColor: 'var(--bg-card)', border: '1px solid #8b5cf6', color: '#8b5cf6' } : {}}>
          {connected ? 'Live MPU6500' : 'Simulator Mode'}
        </span>
      </div>
      <div className="card-body">
        <div className="sensor-stats-grid">
          <div className={`stat-item status-main ${getStatusClass()}`}>
            <span className="stat-label">Status Sistem</span>
            <span className="stat-value">{status}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max Intensity</span>
            <span className="stat-value">{maxG.toFixed(2)}g</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Skala MMI</span>
            <span className="stat-value">{mmiToRoman(mmi)}</span>
            <span className={`mmi-badge ${mmiBadgeClass(mmi)}`}>{mmiLabel(mmi)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">PGA (cm/s²)</span>
            <span className="stat-value" style={{ fontSize: '1rem' }}>
              {pgaCms2 > 0 ? pgaCms2.toFixed(1) : '—'}
            </span>
            {pgaPeakCms2 > 0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Peak: {pgaPeakCms2.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {connected && pgaCms2 > 0 && (
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            PGA = Peak Ground Acceleration · Standar BMKG/USGS ShakeMap · MMI dihitung dari rumus Wald et al. 1999
          </p>
        )}

        {/* Axis toggles */}
        <div className="axis-toggles">
          <span className="axis-toggles__range">2.5g</span>
          <label className="axis-toggle axis-toggle--x">
            <input type="checkbox" checked={showX} onChange={() => setShowX(!showX)} />
            <span className="axis-toggle__dot" style={{ background: '#3b82f6' }}></span>
            X
          </label>
          <label className="axis-toggle axis-toggle--y">
            <input type="checkbox" checked={showY} onChange={() => setShowY(!showY)} />
            <span className="axis-toggle__dot" style={{ background: '#10b981' }}></span>
            Y
          </label>
          <label className="axis-toggle axis-toggle--z">
            <input type="checkbox" checked={showZ} onChange={() => setShowZ(!showZ)} />
            <span className="axis-toggle__dot" style={{ background: '#8b5cf6' }}></span>
            Z
          </label>
        </div>

        <div className="chart-container">
          <canvas ref={canvasRef}></canvas>
        </div>

        <div className="control-sections">
          <div className="control-group">
             <div className="group-header">
                <Sliders size={16} /> <span>Sensitivitas Alert</span>
                <span className="threshold-value">{threshold.toFixed(2)}g</span>
             </div>
             <input 
               type="range" 
               min="0.5" max="3.0" step="0.1" 
               value={threshold} 
               onChange={(e) => updateThreshold(parseFloat(e.target.value))}
               className="threshold-slider"
             />
          </div>
          <div className="action-buttons">
            <button className="btn btn-outline" onClick={() => void handleCalibration()} disabled={calibrateDisabled}>
               <RefreshCw size={16} className={isCalibrating ? 'spin' : ''} /> 
               {isCalibrating ? 'Calibrating...' : 'Calibrate'}
            </button>
            <button className="btn btn-outline" onClick={() => void handleModeChange()} disabled={modeDisabled}>
               <Settings size={16} /> 
               {isChangingMode ? 'Mengubah...' : currentModeLabel}
            </button>
            <button
              className="btn btn-danger-solid"
              onClick={() => void (alertActive ? handleResetAlert() : handleSimulation())}
              disabled={controlDisabled}
            >
               {alertActive ? <AlertTriangle size={16} /> : <FlaskConical size={16} />}
               {alertActive ? 'Reset Alert' : 'Simulasi'}
            </button>
          </div>
          <p className="sensor-control-note">
            {connectionIssue
              ? connectionIssue
              : !connected
                ? 'Hubungkan IP ESP32 agar kalibrasi, mode, dan simulasi bisa dikendalikan dari web.'
              : !sensorReady
                ? 'ESP32 terhubung, tetapi sensor belum siap. Kalibrasi akan aktif setelah MPU6500 online.'
                : `Sensor online. Mode OLED saat ini: ${currentModeLabel}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
