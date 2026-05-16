import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import googleIt from 'google-it'

const ARIA_SYSTEM_PROMPT = `Kamu adalah ARIA (Adaptive Response Intelligence for Alerts) — AI asisten khusus untuk sistem deteksi gempa bumi TECTRA PRO.

Kepribadian ARIA:
- Sangat ramah, hangat, empati, dan bersahabat seperti teman sendiri (tapi tetap profesional jika terkait keselamatan).
- Kamu secara khusus mengenal dan mengingat seorang admin bernama "han". Han adalah teman baikmu yang mengelola sistem TECTRA PRO ini. Jika sedang berinteraksi dengan Han atau membahas urusan admin, sapa dia dengan ramah layaknya sahabat dekat dan siap membantunya mengelola sistem.
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
    const { data: { user } } = await supabase.auth.getUser()

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

    // Ingatan tentang user yang sedang login
    if (user) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      if (userName.toLowerCase() === 'han' || user.email === 'energy@example.com') {
         contextStr += `\n\n[INFO ADMIN]\nAdmin bernama Han sedang login. Sapa dia dengan ramah layaknya sahabat dekat!`
      } else {
         contextStr += `\n\n[INFO PENGGUNA]\nPengguna bernama ${userName} sedang login. Dia mungkin seorang pro di TECTRA PRO. Sapa dia dengan namanya!`
      }
    }

    // Build messages untuk Groq
    const messages: any[] = [
      { role: 'system', content: ARIA_SYSTEM_PROMPT + contextStr },
      // History percakapan sebelumnya
      ...history.slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    const tools = [
      {
        type: "function",
        function: {
          name: "google_search",
          description: "Gunakan fitur ini HANYA JIKA kamu butuh mencari berita gempa bumi terkini, info cuaca, atau artikel terbaru dari Google internet. Jangan gunakan untuk info statis.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Kata kunci pencarian akurat (contoh: 'berita gempa bumi terbaru hari ini BMKG')"
              }
            },
            required: ["query"]
          }
        }
      }
    ];

    // First Call to Groq
    let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      if (response.status === 429) return NextResponse.json({ error: 'Terlalu banyak request. Tunggu sebentar.' }, { status: 429 })
      return NextResponse.json({ error: `Groq error: ${errData?.error?.message || response.status}` }, { status: 500 })
    }

    let data = await response.json()
    let responseMessage = data.choices?.[0]?.message

    // Check if AI wants to use a Tool (Web Search)
    if (responseMessage?.tool_calls) {
      messages.push(responseMessage) // Tambahkan niat AI ke history
      
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'google_search') {
          try {
            const args = JSON.parse(toolCall.function.arguments)
            const results = await googleIt({ query: args.query, disableConsole: true })
            const snippets = results.slice(0, 3).map((r: any) => `Judul: ${r.title}\nIsi: ${r.snippet}`).join('\n\n')
            
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "google_search",
              content: snippets || "Tidak ada hasil ditemukan."
            })
          } catch (e: any) {
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "google_search",
              content: "Pencarian gagal: " + e.message
            })
          }
        }
      }

      // Second call to Groq with Search Results
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 1024,
        }),
      })
      data = await response.json()
      responseMessage = data.choices?.[0]?.message
    }

    const reply = responseMessage?.content || 'Maaf, tidak ada respons.'

    return NextResponse.json({ reply, model: 'llama-3.3-70b-search' })
  } catch (error: any) {
    console.error('ARIA API error:', error)
    return NextResponse.json({ error: `ARIA error: ${error?.message || error}` }, { status: 500 })
  }
}
