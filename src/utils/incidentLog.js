'use client'

const INCIDENT_STORAGE_KEY = 'quakeguard-incidents'
const INCIDENT_MAX = 300

export const readIncidents = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(INCIDENT_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveIncidents = (incidents) => {
  localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(incidents.slice(0, INCIDENT_MAX)))
}

export const appendIncident = async (incident) => {
  // 1. Simpan di localStorage
  const current = readIncidents()
  const next = [{ ...incident }, ...current]
  saveIncidents(next)

  // 2. Simpan ke Supabase via API
  try {
    await fetch('/api/earthquakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        magnitude: parseFloat(incident.magnitude) || 0,
        location: incident.location || 'Unknown',
        source: incident.source || 'BMKG',
        level: incident.level || 'WASPADA',
        detail: incident.detail || '',
      }),
    })
  } catch {
    // silent fail - data aman di localStorage
  }
}

export const deleteIncident = async (incidentId) => {
  const current = readIncidents()
  const next = current.filter(inc => String(inc.id) !== String(incidentId))
  saveIncidents(next)
  try {
    await fetch(`/api/earthquakes/${incidentId}`, { method: 'DELETE' })
  } catch { /* silent */ }
}

export const clearIncidents = async () => {
  localStorage.setItem(INCIDENT_STORAGE_KEY, '[]')
  try {
    await fetch('/api/earthquakes', { method: 'DELETE' })
  } catch { /* silent */ }
}
