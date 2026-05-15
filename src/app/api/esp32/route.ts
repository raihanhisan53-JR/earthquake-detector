import { NextResponse } from 'next/server'

// Proxy untuk ESP32 - mengatasi CORS dan Mixed Content (HTTP dari HTTPS)
// Web (HTTPS) → Vercel API (HTTPS) → ESP32 (HTTP local)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get('ip')
  const path = searchParams.get('path') || 'api'

  if (!ip) {
    return NextResponse.json({ error: 'IP ESP32 diperlukan' }, { status: 400 })
  }

  // Validasi IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) {
    return NextResponse.json({ error: 'Format IP tidak valid' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`http://${ip}/${path}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      }
    })
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'ESP32 timeout - pastikan sensor menyala dan terhubung WiFi' }, { status: 408 })
    }
    return NextResponse.json({ error: 'ESP32 tidak dapat dijangkau', detail: error.message }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get('ip')
  const path = searchParams.get('path') || 'cmd'

  if (!ip) return NextResponse.json({ error: 'IP diperlukan' }, { status: 400 })

  try {
    const body = await request.text()
    const res = await fetch(`http://${ip}/${path}?${body}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'ESP32 tidak dapat dijangkau' }, { status: 503 })
  }
}
