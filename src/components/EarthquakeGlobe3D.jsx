"use client"
import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';

export default function EarthquakeGlobe3D({ points, markerColorMode }) {
  const globeEl = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getMagnitudeColor = (mag) => {
    if (mag >= 6) return 'rgba(239, 68, 68, 0.9)';
    if (mag >= 5) return 'rgba(249, 115, 22, 0.8)';
    if (mag >= 4) return 'rgba(59, 130, 246, 0.7)';
    return 'rgba(34, 197, 94, 0.6)';
  };

  const getDepthColor = (depthKm) => {
    if (!Number.isFinite(depthKm)) return '#94a3b8';
    if (depthKm < 70) return '#ef4444';
    if (depthKm <= 300) return '#f59e0b';
    return '#3b82f6';
  };

  const globeData = useMemo(() => {
    return points.map(p => ({
      lat: p.lat,
      lng: p.lon,
      size: Math.max(0.1, p.magnitude / 6),
      color: markerColorMode === 'depth' ? getDepthColor(p.depthKm) : getMagnitudeColor(p.magnitude),
      label: `${p.wilayah} (M${p.magnitude})`
    }));
  }, [points, markerColorMode]);

  const ringsData = useMemo(() => {
    // Tsunami risk / recent big earthquakes get expanding rings
    return points.filter(p => p.magnitude >= 5 || p.potensi?.toLowerCase().includes('tsunami')).map(p => ({
      lat: p.lat,
      lng: p.lon,
      maxR: p.magnitude * 2.5,
      propagationSpeed: p.magnitude > 6 ? 4 : 2,
      repeatPeriod: 1200,
      color: p.potensi?.toLowerCase().includes('tsunami') ? '#dc2626' : (p.magnitude >= 6 ? '#ef4444' : '#f97316')
    }));
  }, [points]);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.controls().enableZoom = true;
      globeEl.current.controls().enableDamping = true;
      globeEl.current.controls().dampingFactor = 0.1;
      // Focus on Indonesia — tetap di sini, tidak berputar
      globeEl.current.pointOfView({ lat: -2.5, lng: 118, altitude: 1.2 }, 1500);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#0a0f1d', overflow: 'hidden' }}>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={globeData}
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.2}
        pointLabel="label"
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        backgroundColor="rgba(0,0,0,0)"
        htmlElementsData={points.slice(0, 1)} // Top 1 point for test
        htmlElement={(d) => {
          const el = document.createElement('div');
          el.innerHTML = `<div style="color: red; font-size: 10px; font-weight: bold; transform: translate(-50%, -50%); pointer-events: none;">🔴 M${d.magnitude}</div>`;
          return el;
        }}
      />
    </div>
  );
}
