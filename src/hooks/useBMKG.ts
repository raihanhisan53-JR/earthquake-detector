'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

const FALLBACK_GEMPA = {
  Tanggal: '23 Apr 2026', Jam: '10:48:21 WIB', Coordinates: '-8.37,123.18',
  Magnitude: '3.8', Kedalaman: '10 km',
  Wilayah: 'Pusat gempa berada di laut 24 km timur Larantuka',
  Potensi: 'Gempa ini dirasakan (MMI II-III Larantuka)', Shakemap: 'autogempa.mmi.jpg',
}

export function useBMKG() {
  const [gempa, setGempa] = useState<typeof FALLBACK_GEMPA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        'https://api.codetabs.com/v1/proxy?quest=https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
        { signal: AbortSignal.timeout(7000) }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const newGempa = data?.Infogempa?.gempa ?? FALLBACK_GEMPA
      setGempa(newGempa)
      setError(null)

      // Auto-save ke Supabase via API
      try {
        const magnitude = parseFloat(newGempa.Magnitude)
        const feltQuake = (newGempa.Potensi ?? '').toLowerCase().includes('dirasakan')
        const level = magnitude >= 5.0 || feltQuake ? 'BAHAYA' : magnitude >= 3.0 ? 'WASPADA' : 'AMAN'
        await fetch('/api/earthquakes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            magnitude, location: newGempa.Wilayah?.replace(/^pusat gempa berada /i, '') || 'Unknown',
            source: 'BMKG', level, detail: `${newGempa.Kedalaman} - ${newGempa.Potensi}`,
          }),
        })
      } catch { /* silent fail */ }
    } catch (err) {
      setGempa(FALLBACK_GEMPA)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
    const id = setInterval(() => void fetchData(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchData])

  return { gempa, loading, error, refresh: fetchData }
}
