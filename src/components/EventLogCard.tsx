'use client'
import { useEffect, useMemo, useState } from 'react'
import { History, Search, Trash2, XCircle, Cloud, FileJson, FileSpreadsheet, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EarthquakeEvent {
  id: string
  timestamp: string
  level: string
  magnitude: number
  location: string
  source: string
  status: string
  detail?: string
}

const getLevelMeta = (rawLevel: string) => {
  const level = String(rawLevel || 'NEW').toUpperCase()
  if (level === 'BAHAYA') return { label: 'Bahaya', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
  if (level === 'WASPADA') return { label: 'Waspada', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' }
  return { label: 'Baru', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' }
}

const SOURCE_COLORS: Record<string, string> = {
  BMKG: '#6d28d9',
  USGS: '#0891b2',
  ESP32: '#059669',
  FALLBACK: '#64748b',
}

export default function EventLogCard() {
  const [events, setEvents] = useState<EarthquakeEvent[]>([])
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('SEMUA')
  const [sourceFilter, setSourceFilter] = useState('SEMUA')
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/earthquakes')
      .then(r => r.json())
      .then((data: EarthquakeEvent[]) => setEvents(data))
      .catch(console.error)

    const channel = supabase
      .channel('earthquake_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'earthquake_logs' },
        (payload) => {
          const newEvent = payload.new as EarthquakeEvent
          setEvents(prev => [newEvent, ...prev].slice(0, 300))
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [supabase])

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(event => {
      const level = String(event.level || 'NEW').toUpperCase()
      const matchLevel = levelFilter === 'SEMUA' || level === levelFilter
      const matchSource = sourceFilter === 'SEMUA' || String(event.source || '').toUpperCase() === sourceFilter
      const haystack = [event.timestamp, event.level, String(event.magnitude), event.location, event.source, event.detail]
        .filter(Boolean).join(' ').toLowerCase()
      return matchLevel && matchSource && (q.length === 0 || haystack.includes(q))
    })
  }, [events, levelFilter, sourceFilter, query])

  const levelCounts = useMemo(() => events.reduce((acc, e) => {
    const l = String(e.level || 'NEW').toUpperCase()
    if (l === 'BAHAYA') acc.bahaya++
    else if (l === 'WASPADA') acc.waspada++
    else acc.baru++
    return acc
  }, { bahaya: 0, waspada: 0, baru: 0 }), [events])

  const handleDelete = async (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    await fetch(`/api/earthquakes/${id}`, { method: 'DELETE' }).catch(console.error)
  }

  const handleClear = async () => {
    if (!window.confirm('Hapus semua riwayat gempa?')) return
    setEvents([])
    await fetch('/api/earthquakes', { method: 'DELETE' }).catch(console.error)
  }

  const exportCSV = () => {
    if (!filteredEvents.length) return
    const headers = ['Waktu', 'Level', 'Magnitude', 'Lokasi', 'Sumber', 'Status']
    const rows = filteredEvents.map(e => [e.timestamp, e.level, e.magnitude, e.location, e.source, e.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `gempa_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card event-log-card">
      <div className="card-header">
        <h2>
          <History size={20} />
          <span>Riwayat Insiden Gempa</span>
          <span className="event-sync-badge cloud"><Cloud size={12} /> Supabase Live</span>
        </h2>
        <div className="header-actions">
          <button className="btn-icon" onClick={exportCSV} title="Export CSV" disabled={!filteredEvents.length}><FileSpreadsheet size={16} /></button>
          <button className="btn-icon" onClick={() => { const b = new Blob([JSON.stringify(filteredEvents, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'gempa.json'; a.click() }} title="Export JSON" disabled={!filteredEvents.length}><FileJson size={16} /></button>
          <button className="btn-icon btn-danger" onClick={handleClear} title="Hapus Semua" disabled={!events.length}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="card-body">
        {/* Stats row */}
        <div className="event-summary-grid">
          {[
            { label: 'Total', value: events.length, color: 'var(--text-primary)', accent: 'var(--accent)' },
            { label: 'Bahaya', value: levelCounts.bahaya, color: '#ef4444', accent: '#ef4444' },
            { label: 'Waspada', value: levelCounts.waspada, color: '#f59e0b', accent: '#f59e0b' },
            { label: 'Baru', value: levelCounts.baru, color: '#3b82f6', accent: '#3b82f6' },
          ].map(card => (
            <div key={card.label} className="event-summary-item" style={{ borderTopColor: card.accent }}>
              <span className="event-summary-label">{card.label}</span>
              <strong className="event-summary-value" style={{ color: card.color }}>{card.value}</strong>
            </div>
          ))}
        </div>

        {/* Toolbar — single clean row */}
        <div className="event-toolbar">
          <div className="event-search">
            <Search size={15} />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari lokasi, sumber..." />
          </div>
          <select
            className="event-select"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            aria-label="Filter status"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="BAHAYA">Bahaya</option>
            <option value="WASPADA">Waspada</option>
            <option value="NEW">Baru</option>
          </select>
          <select
            className="event-select"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            aria-label="Filter sumber"
          >
            <option value="SEMUA">Semua Sumber</option>
            <option value="BMKG">BMKG</option>
            <option value="USGS">USGS</option>
            <option value="ESP32">ESP32</option>
          </select>
        </div>

        <div className="event-counter">
          {filteredEvents.length} dari {events.length} kejadian
        </div>

        <div className="event-table-wrapper">
          {filteredEvents.length === 0 ? (
            <div className="event-empty">
              <History size={36} />
              <p>{events.length === 0 ? 'Belum ada aktivitas tercatat.' : 'Tidak ada kejadian yang cocok.'}</p>
            </div>
          ) : (
            <div className="event-feed">
              {filteredEvents.map(event => {
                const meta = getLevelMeta(event.level)
                const srcColor = SOURCE_COLORS[String(event.source).toUpperCase()] || '#64748b'
                return (
                  <div key={event.id} className={`event-feed-item ${String(event.level || 'new').toLowerCase()}`}>
                    <div
                      className="event-feed-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Activity size={16} />
                    </div>
                    <div className="event-feed-content">
                      <div className="event-feed-header">
                        <span className="event-feed-location">{event.location || 'Lokasi tidak diketahui'}</span>
                        <span className="event-feed-time">{event.timestamp}</span>
                      </div>
                      <div className="event-feed-details">
                        <span className="event-level-badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                        <span className="event-feed-mag">M {event.magnitude}</span>
                        <span className="event-feed-source-tag" style={{ background: `${srcColor}18`, color: srcColor }}>{event.source || '-'}</span>
                      </div>
                    </div>
                    <button className="btn-delete-single" onClick={() => handleDelete(event.id)} title="Hapus"><XCircle size={15} /></button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
