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
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// POST - Simpan earthquake log baru
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { magnitude, location, source, level, detail, latitude, longitude, depth } = body

    const earthquake = await prisma.earthquakeLog.create({
      data: {
        magnitude: parseFloat(magnitude) || 0,
        location: location || 'Unknown',
        source: source || 'BMKG',
        level: level || 'WASPADA',
        detail: detail || '',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        depth: depth ? parseFloat(depth) : null,
        userId: user.id,
      },
    })

    return NextResponse.json(earthquake, { status: 201 })
  } catch (error) {
    console.error('POST /api/earthquakes error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
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
