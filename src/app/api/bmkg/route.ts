import { NextResponse } from 'next/server'

// Proxy untuk BMKG API - menghindari CORS issue di browser
export async function GET() {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', {
      next: { revalidate: 30 }, // cache 30 detik
    })
    if (!res.ok) throw new Error(`BMKG HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('BMKG proxy error:', error)
    return NextResponse.json({ error: 'BMKG tidak tersedia' }, { status: 503 })
  }
}
