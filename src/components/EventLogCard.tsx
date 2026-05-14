'use client'
import { useEffect, useMemo, useState } from 'react'
import { History, Search, Trash2, XCircle, Cloud, FileJson, FileSpreadsheet } from 'lucide-react'
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

export default function EventLogCard() {
  const [events, setEvents] = useState<EarthquakeEvent[]>([])
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('SEMUA')
  const [sourceFilter, setSourceFilter] = useState('SEMUA')
  const supabase = createClient()

  useEffect(() => {
    // Load initial data
    fetch('/api/earthquakes')
      .then(r => r.json())
      .then((data: EarthquakeEvent[]) => setEvents(data))
      .catch(console.error)

    // Realtime subscription via Supabase
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
    else acc.new++
    return acc
  }, { bahaya: 0, waspada: 0, new: 0 }), [events])

  const handleDelete = async (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    await fetch(`/api/earthquakes/${id}`, { method: 'DELETE' }).catch(console.error)
  }

  const handleClear = async () => {
    if (!window.confirm('Hapus semua riwayat?')) return
    setEvents([])
    await fetch('/api/earthquakes', { method: 'DELETE' }).catch(console.error)
  }

  const exportCSV = () => {
    if (!filteredEvents.length) return
    const headers = ['ID', 'Waktu', 'Level', 'Magnitude', 'Lokasi', 'Sumber', 'Status', 'Detail']
    const rows = filteredEvents.map(e => [e.id, e.timestamp, e.level, e.magnitude, e.location, e.source, e.status, e.detail || ''])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `quake_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card event-log-card">
      <div className="card-header">
        <h2>
          <History size={20} />
          <span>Riwayat Insiden Gempa</span>
          <span className="event-sync-badge cloud"><Cloud size={12} /> Supabase</span>
        </h2>
        <div className="header-actions">
          <button className="btn-icon" onClick={exportCSV} title="Export CSV" disabled={!filteredEvents.length}><FileSpreadsheet size={16} /></button>
          <button className="btn-icon" onClick={() => { const b = new Blob([JSON.stringify(filteredEvents, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'quake.json'; a.click() }} title="Export JSON" disabled={!filteredEvents.length}><FileJson size={16} /></button>
          <button className="btn-icon btn-danger" onClick={handleClear} title="Hapus Semua" disabled={!events.length}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="card-body">
        <div className="event-summary-grid">
          {[
            { label: 'Total', value: events.length, color: 'var(--text-primary)', accent: 'var(--accent)' },
            { label: 'Bahaya', value: levelCounts.bahaya, color: '#ef4444', accent: '#ef4444' },
            { label: 'Waspada', value: levelCounts.waspada, color: '#f59e0b', accent: '#f59e0b' },
            { label: 'Baru', value: levelCounts.new, color: '#3b82f6', accent: '#3b82f6' },
          ].map(card => (
            <div key={card.label} className="event-summary-item" style={{ borderTopColor: card.accent }}>
              <span className="event-summary-label">{card.label}</span>
              <strong className="event-summary-value" style={{ color: card.color }}>{card.value}</strong>
            </div>
          ))}
        </div>

        <div className="event-toolbar">
          <div className="event-search">
            <Search size={16} />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari..." />
          </div>
          <div className="event-filters">
            {['SEMUA', 'BAHAYA', 'WASPADA', 'NEW'].map(f => (
              <button key={f} type="button" className={`event-filter-pill ${levelFilter === f ? 'active' : ''}`} onClick={() => setLevelFilter(f)}>
                {f === 'SEMUA' ? 'Semua Status' : f === 'BAHAYA' ? 'Bahaya' : f === 'WASPADA' ? 'Waspada' : 'Baru'}
              </button>
            ))}
          </div>
          <div className="event-filters" style={{ marginTop: '0.75rem' }}>
            {['SEMUA', 'BMKG', 'USGS', 'ESP32'].map(s => (
              <button key={s} type="button" className={`event-filter-pill ${sourceFilter === s ? 'active' : ''}`} onClick={() => setSourceFilter(s)}>
                {s === 'SEMUA' ? 'Semua Sumber' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="event-counter">{filteredEvents.length} dari {events.length} kejadian</div>

        <div className="event-table-wrapper">
          {filteredEvents.length === 0 ? (
            <div className="event-empty">
              <History size={40} />
              <p>{events.length === 0 ? 'Belum ada aktivitas.' : 'Tidak ada yang cocok.'}</p>
            </div>
          ) : (
            <table className="event-table">
              <thead>
                <tr>
                  <th>Waktu</th><th>Status</th><th>Kekuatan</th><th>Lokasi</th><th>Sumber</th><th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => {
                  const meta = getLevelMeta(event.level)
                  return (
                    <tr key={event.id} className={`event-row ${String(event.level || 'new').toLowerCase()}`}>
                      <td className="event-time-cell">{event.timestamp}</td>
                      <td><span className="event-level-badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span></td>
                      <td><span className="event-magnitude">{event.magnitude}</span></td>
                      <td className="event-location-cell">{event.location || '-'}</td>
                      <td className="event-source-cell">{event.source || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-delete-single" onClick={() => handleDelete(event.id)} title="Hapus"><XCircle size={16} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
