import { NextResponse } from 'next/server'

// Proxy untuk USGS API - menghindari CORS issue di browser
export async function GET() {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson',
      { next: { revalidate: 60 } } // cache 60 detik
    )
    if (!res.ok) throw new Error(`USGS HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('USGS proxy error:', error)
    return NextResponse.json({ error: 'USGS tidak tersedia' }, { status: 503 })
  }
}
