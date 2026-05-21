import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', {
      next: { revalidate: 30 },
    })
    if (!res.ok) throw new Error(`BMKG HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('BMKG terkini proxy error:', error)
    return NextResponse.json({ error: 'BMKG tidak tersedia' }, { status: 503 })
  }
}
