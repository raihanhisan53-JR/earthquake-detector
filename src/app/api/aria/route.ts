import { GoogleGenerativeAI } from '@google/generative-ai'
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
- Bisa analisis data gempa real-time

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
- Ini adalah dashboard monitoring gempa real-time
- Data dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
- Sensor lokal ESP32 dengan MPU6500
- Lokasi: Indonesia (zona seismik aktif)

Format respons:
- Gunakan emoji yang relevan untuk visual
- Untuk data teknis, gunakan format yang mudah dibaca
- Selalu akhiri dengan saran keselamatan jika relevan
- Jangan lebih dari 300 kata kecuali diminta detail`

export async function POST(request: Request) {
  try {
    // Ambil API key saat request (bukan saat module load)
    const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_key
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables' 
      }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { message, history = [], context = {} } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    // Init Gemini dengan key yang sudah divalidasi
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Build context dari data gempa terkini jika ada
    let contextStr = ''
    if (context.latestEarthquake) {
      const eq = context.latestEarthquake
      contextStr = `\n\n[DATA GEMPA TERKINI BMKG]\nMagnitudo: M${eq.magnitude}\nLokasi: ${eq.location}\nWaktu: ${eq.time}\nKedalaman: ${eq.depth}\nPotensi: ${eq.potensi}`
    }
    if (context.esp32Connected) {
      contextStr += `\n\n[STATUS SENSOR ESP32]\nStatus: ${context.esp32Status || 'AMAN'}\nAlert Level: ${context.esp32AlertLevel || 0}`
    }

    // Build chat history
    const chatHistory = history.slice(-10).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    })

    const fullPrompt = `${ARIA_SYSTEM_PROMPT}${contextStr}\n\nUser: ${message}`
    const result = await chat.sendMessage(fullPrompt)
    const reply = result.response.text()

    return NextResponse.json({ reply, model: 'gemini-2.0-flash' })
  } catch (error: any) {
    console.error('ARIA API error:', error)
    const errMsg = error?.message || String(error)
    if (errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'Kuota Gemini API habis. Coba lagi besok.' }, { status: 429 })
    }
    return NextResponse.json({ error: `ARIA error: ${errMsg}` }, { status: 500 })
  }
}
