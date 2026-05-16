import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ARIA_SYSTEM_PROMPT = `Kamu adalah ARIA (Adaptive Response Intelligence for Alerts) — AI asisten khusus untuk sistem deteksi gempa bumi TECTRA PRO.

Kepribadian ARIA:
- Profesional tapi ramah dan mudah dipahami
- Ahli seismologi, geologi, dan mitigasi bencana
- Selalu prioritaskan keselamatan jiwa
- Jawab dalam Bahasa Indonesia yang natural
- Gunakan data dan fakta ilmiah
- Singkat dan jelas, tidak bertele-tele

Keahlian ARIA:
- Interpretasi skala Richter dan MMI
- Analisis potensi tsunami
- Prosedur evakuasi dan keselamatan
- Penjelasan fenomena seismik
- Analisis data sensor ESP32
- Rekomendasi tindakan darurat
- Sejarah gempa Indonesia
- Zona rawan gempa di Indonesia

Konteks sistem:
- Dashboard monitoring gempa real-time
- Data dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- Sensor lokal ESP32 dengan MPU6500
- Lokasi: Indonesia (zona seismik aktif)

Format respons:
- Gunakan emoji yang relevan
- Singkat dan jelas, maksimal 300 kata
- Selalu akhiri dengan saran keselamatan jika relevan`

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY belum dikonfigurasi di Vercel Environment Variables' 
      }, { status: 500 })
    }

    const supabase = await createClient()
    await supabase.auth.getUser()

    const body = await request.json()
    const { message, history = [], context = {} } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    // Build context dari data gempa terkini
    let contextStr = ''
    if (context.latestEarthquake) {
      const eq = context.latestEarthquake
      contextStr = `\n\n[DATA GEMPA TERKINI BMKG]\nMagnitudo: M${eq.magnitude}\nLokasi: ${eq.location}\nWaktu: ${eq.time}\nKedalaman: ${eq.depth}\nPotensi: ${eq.potensi}`
    }
    if (context.esp32Connected) {
      contextStr += `\n\n[STATUS SENSOR ESP32]\nStatus: ${context.esp32Status || 'AMAN'}\nAlert Level: ${context.esp32AlertLevel || 0}`
    }

    // Build messages untuk Groq (OpenAI-compatible format)
    const messages = [
      { role: 'system', content: ARIA_SYSTEM_PROMPT + contextStr },
      // History percakapan sebelumnya
      ...history.slice(-8).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    // Call Groq API (OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errMsg = errData?.error?.message || `HTTP ${response.status}`
      if (response.status === 429) {
        return NextResponse.json({ error: 'Terlalu banyak request. Tunggu sebentar.' }, { status: 429 })
      }
      return NextResponse.json({ error: `Groq error: ${errMsg}` }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.'

    return NextResponse.json({ reply, model: 'llama-3.3-70b' })
  } catch (error: any) {
    console.error('ARIA API error:', error)
    return NextResponse.json({ error: `ARIA error: ${error?.message || error}` }, { status: 500 })
  }
}
