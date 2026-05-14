import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Ambil semua earthquake logs
export async function GET() {
  try {
    const earthquakes = await prisma.earthquakeLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 300,
    })
    return NextResponse.json(earthquakes)
  } catch (error) {
    console.error('GET /api/earthquakes error:', error)
    return NextResponse.json([])
  }
}

// POST - Simpan earthquake log baru
// Menggunakan externalId sebagai primary dedup key (stabil lintas sesi)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { magnitude, location, source, level, detail, latitude, longitude, depth, externalId } = body

    // Cek duplikat via externalId (stable ID dari BMKG/USGS) — prioritas utama
    if (externalId) {
      const byExternalId = await prisma.earthquakeLog.findFirst({
        where: { detail: { contains: `[id:${externalId}]` } }
      })
      if (byExternalId) return NextResponse.json(byExternalId)
    }

    // Fallback dedup: sama lokasi+magnitude+source dalam 2 jam
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const existing = await prisma.earthquakeLog.findFirst({
      where: {
        location: location || 'Unknown',
        magnitude: parseFloat(magnitude) || 0,
        source: (source || 'BMKG') as 'BMKG' | 'USGS' | 'ESP32' | 'FALLBACK',
        timestamp: { gte: twoHoursAgo }
      }
    })
    if (existing) return NextResponse.json(existing)

    const detailStr = `${detail || ''}${externalId ? ` [id:${externalId}]` : ''}`

    const earthquake = await prisma.earthquakeLog.create({
      data: {
        magnitude: parseFloat(magnitude) || 0,
        location: location || 'Unknown',
        source: (source || 'BMKG') as 'BMKG' | 'USGS' | 'ESP32' | 'FALLBACK',
        level: (level || 'WASPADA') as 'AMAN' | 'WASPADA' | 'BAHAYA',
        detail: detailStr,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        depth: depth ? parseFloat(depth) : null,
        userId: user?.id || null,
      },
    })

    return NextResponse.json(earthquake, { status: 201 })
  } catch (error) {
    console.error('POST /api/earthquakes error:', error)
    return NextResponse.json({ ok: true })
  }
}

// DELETE - Hapus semua earthquake logs
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.earthquakeLog.deleteMany()
    return NextResponse.json({ message: 'Semua data dihapus' })
  } catch (error) {
    console.error('DELETE /api/earthquakes error:', error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}
