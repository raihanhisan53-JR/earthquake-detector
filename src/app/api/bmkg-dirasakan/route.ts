import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TectraPro/1.0)',
      },
      next: { revalidate: 60 } // Cache 60 detik
    })
    
    if (!res.ok) {
      throw new Error(`BMKG returned ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy BMKG List Error:', error)
    return NextResponse.json({ error: 'Failed to fetch BMKG data' }, { status: 500 })
  }
}
