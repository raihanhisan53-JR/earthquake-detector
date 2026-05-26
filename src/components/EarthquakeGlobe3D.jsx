"use client"
import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { useI18n } from '../hooks/useI18n';

export default function EarthquakeGlobe3D({ points, markerColorMode }) {
  const { lang, t } = useI18n();
  const globeEl = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Monitor container size for responsive globe
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
    if (mag >= 7) return '#ff0000'; // Critical Red
    if (mag >= 6) return '#ef4444'; // Bright Red
    if (mag >= 5) return '#f97316'; // Orange
    if (mag >= 4) return '#3b82f6'; // Blue
    return '#22c55e'; // Green
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
      // Size based on magnitude, but controlled altitude for "pro" look
      magnitude: p.magnitude,
      altitude: Math.min(0.5, p.magnitude / 20), 
      color: markerColorMode === 'depth' ? getDepthColor(p.depthKm) : getMagnitudeColor(p.magnitude),
      label: `<b>${p.wilayah}</b><br/>M${p.magnitude} · Depth: ${p.kedalaman || '-'}`
    }));
  }, [points, markerColorMode]);

  const ringsData = useMemo(() => {
    // Large earthquakes or tsunami risk get pulse rings
    return points.filter(p => p.magnitude >= 5 || p.potensi?.toLowerCase().includes('tsunami')).map(p => ({
      lat: p.lat,
      lng: p.lon,
      maxR: p.magnitude * 2.5,
      propagationSpeed: p.magnitude > 6 ? 3 : 1.5,
      repeatPeriod: 2000,
      color: p.potensi?.toLowerCase().includes('tsunami') ? '#dc2626' : getMagnitudeColor(p.magnitude)
    }));
  }, [points]);

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = false;
      controls.enableZoom = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;

      // Professional night-time look
      const scene = globeEl.current.scene();
      
      // Add subtle glow
      const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
      scene.add(ambientLight);
      
      // Atmosphere config
      globeEl.current.pointOfView({ lat: -2.5, lng: 118, altitude: 2.5 }, 0);
      globeEl.current.pointOfView({ lat: -2.5, lng: 118, altitude: 1.5 }, 2000);
    }
  }, []);

  return (
    <div ref={containerRef} className="globe-container" style={{ 
      width: '100%', 
      height: '100%', 
      background: 'radial-gradient(circle at center, #0a192f 0%, #020617 100%)', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        // Google Earth / Pro style textures
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Atmosphere
        showAtmosphere={true}
        atmosphereColor="#3a7bd5"
        atmosphereAltitude={0.15}

        // Earthquake Points (Vertical bars style)
        pointsData={globeData}
        pointAltitude="altitude"
        pointColor="color"
        pointRadius={0.25}
        pointLabel="label"
        
        // Pulse Rings
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Interactions
        onPointClick={(point) => {
          globeEl.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.0 }, 1000);
        }}
        
        backgroundColor="rgba(0,0,0,0)"
      />
      
      {/* Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        pointerEvents: 'none',
        fontSize: '11px',
        color: '#fff',
        zIndex: 10,
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        textAlign: lang === 'ar' ? 'right' : 'left'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{lang === 'ar' ? 'توضيح الخريطة' : 'Globe Visualization'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>{lang === 'ar' ? 'قوة عالية (≥ 6.0)' : 'Magnitudo Tinggi (≥ 6.0)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
            <span>{lang === 'ar' ? 'قوة متوسطة (5.0 - 5.9)' : 'Magnitudo Sedang (5.0 - 5.9)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
            <span>{lang === 'ar' ? 'قوة منخفضة (4.0 - 4.9)' : 'Magnitudo Rendah (4.0 - 4.9)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ width: '12px', height: '2px', background: '#dc2626' }}></div>
            <span>{lang === 'ar' ? 'احتمال حدوث تسونامي' : 'Potensi Tsunami'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
