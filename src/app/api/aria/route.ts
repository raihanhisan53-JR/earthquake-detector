import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.Gemini_key || ''
)

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { message, history = [], context = {} } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build context dari data gempa terkini jika ada
    let contextStr = ''
    if (context.latestEarthquake) {
      const eq = context.latestEarthquake
      contextStr = `\n\n[DATA GEMPA TERKINI BMKG]\nMagnitudo: M${eq.magnitude}\nLokasi: ${eq.location}\nWaktu: ${eq.time}\nKedalaman: ${eq.depth}\nPotensi: ${eq.potensi}`
    }
    if (context.esp32Connected) {
      contextStr += `\n\n[STATUS SENSOR ESP32]\nStatus: ${context.esp32Status || 'AMAN'}\nAlert Level: ${context.esp32AlertLevel || 0}`
    }

    // Build chat history untuk context
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

    // Simpan ke database jika user login
    if (user) {
      try {
        await prisma.$executeRaw`
          INSERT INTO chat_messages (user_id, role, content, created_at)
          VALUES (${user.id}, 'user', ${message}, NOW()),
                 (${user.id}, 'assistant', ${reply}, NOW())
          ON CONFLICT DO NOTHING
        `
      } catch {
        // Tabel belum ada, skip
      }
    }

    return NextResponse.json({ reply, model: 'gemini-1.5-flash' })
  } catch (error: any) {
    console.error('ARIA API error:', error)
    if (error?.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'API key tidak valid. Set GEMINI_API_KEY di environment.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'ARIA sedang tidak tersedia. Coba lagi.' }, { status: 500 })
  }
}
