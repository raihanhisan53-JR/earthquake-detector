import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST - Bulk import earthquake logs dari BMKG/USGS
// Endpoint ini menerima array gempa dan menyimpan semua yang belum ada
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { earthquakes } = body as {
      earthquakes: Array<{
        magnitude: number
        location: string
        source: string
        level: string
        detail?: string
        latitude?: number
        longitude?: number
        depth?: number
        externalId: string
        timestamp?: string
      }>
    }

    if (!Array.isArray(earthquakes) || earthquakes.length === 0) {
      return NextResponse.json({ inserted: 0 })
    }

    // Ambil semua externalId yang sudah ada di DB (cari di field detail)
    // Untuk efisiensi, kita cek per batch
    let inserted = 0

    for (const eq of earthquakes) {
      try {
        const externalId = eq.externalId
        if (!externalId) continue

        // Cek apakah sudah ada
        const existing = await prisma.earthquakeLog.findFirst({
          where: { detail: { contains: `[id:${externalId}]` } },
          select: { id: true },
        })
        if (existing) continue

        const detailStr = `${eq.detail || ''}${externalId ? ` [id:${externalId}]` : ''}`

        await prisma.earthquakeLog.create({
          data: {
            magnitude: parseFloat(String(eq.magnitude)) || 0,
            location: eq.location || 'Unknown',
            source: (eq.source || 'BMKG') as 'BMKG' | 'USGS' | 'ESP32' | 'FALLBACK',
            level: (eq.level || 'WASPADA') as 'AMAN' | 'WASPADA' | 'BAHAYA',
            detail: detailStr,
            latitude: eq.latitude ? parseFloat(String(eq.latitude)) : null,
            longitude: eq.longitude ? parseFloat(String(eq.longitude)) : null,
            depth: eq.depth ? parseFloat(String(eq.depth)) : null,
            timestamp: eq.timestamp ? new Date(eq.timestamp) : new Date(),
            userId: null,
          },
        })
        inserted++
      } catch {
        // Skip individual failures, continue with rest
      }
    }

    return NextResponse.json({ inserted })
  } catch (error) {
    console.error('POST /api/earthquakes/bulk error:', error)
    return NextResponse.json({ error: 'Bulk import failed', inserted: 0 }, { status: 500 })
  }
}
