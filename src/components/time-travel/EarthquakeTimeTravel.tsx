"use client"
import { useState, useMemo, useEffect } from 'react';
import { History, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface EarthquakeEvent {
  id: string | number;
  epochMs: number | string;
  tanggal: string;
  jam: string;
  magnitude: number;
  wilayah: string;
}

interface EarthquakeTimeTravelProps {
  events: EarthquakeEvent[];
  onPointSelect?: (id: string | number) => void;
}

export default function EarthquakeTimeTravel({ events, onPointSelect }: EarthquakeTimeTravelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1000); // ms

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => (Number(a.epochMs) || 0) - (Number(b.epochMs) || 0));
  }, [events]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentIndex < sortedEvents.length - 1) {
      timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        if (onPointSelect) onPointSelect(sortedEvents[currentIndex + 1].id);
      }, speed);
    } else if (currentIndex >= sortedEvents.length - 1 && isPlaying) {
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, sortedEvents, speed, onPointSelect]);

  const activeEvent = sortedEvents[currentIndex];
  const progress = (currentIndex / (sortedEvents.length - 1)) * 100;

  return (
    <div className="card time-travel-panel">
      <div className="card-header">
        <h2><History size={18} className="text-accent" /> Time-Travel (Histori)</h2>
      </div>

      <div className="time-travel-content" style={{ padding: '16px' }}>
        {activeEvent && (
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Calendar size={12} /> {activeEvent.tanggal} {activeEvent.jam}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>M {activeEvent.magnitude.toFixed(1)}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{activeEvent.wilayah}</div>
          </div>
        )}

        <div className="time-progress" style={{ marginBottom: '24px' }}>
          <input 
            type="range" 
            min="0" 
            max={sortedEvents.length - 1} 
            value={currentIndex}
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              setCurrentIndex(idx);
              if (onPointSelect) onPointSelect(sortedEvents[idx].id);
            }}
            style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>{sortedEvents[0]?.tanggal}</span>
            <span>{currentIndex + 1} / {sortedEvents.length}</span>
            <span>{sortedEvents[sortedEvents.length - 1]?.tanggal}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                if (onPointSelect) onPointSelect(sortedEvents[currentIndex - 1].id);
              }
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="btn btn-primary" 
            style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0 }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (currentIndex < sortedEvents.length - 1) {
                setCurrentIndex(currentIndex + 1);
                if (onPointSelect) onPointSelect(sortedEvents[currentIndex + 1].id);
              }
            }}
            disabled={currentIndex === sortedEvents.length - 1}
          >
            <ChevronRight size={20} />
          </button>
          
          <select 
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'inherit', fontSize: '12px' }}
          >
            <option value={2000}>0.5x</option>
            <option value={1000}>1.0x</option>
            <option value={500}>2.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
