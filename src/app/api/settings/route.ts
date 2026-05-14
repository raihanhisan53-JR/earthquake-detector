import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ notifyRegion: 'Semua', notifyThreshold: 4.0 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id }
    })

    if (!settings) {
      return NextResponse.json({ notifyRegion: 'Semua', notifyThreshold: 4.0 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ notifyRegion: 'Semua', notifyThreshold: 4.0 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notifyRegion, notifyThreshold } = await request.json()

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        notifyRegion: notifyRegion || 'Semua',
        notifyThreshold: parseFloat(notifyThreshold) || 4.0
      },
      create: {
        userId: user.id,
        notifyRegion: notifyRegion || 'Semua',
        notifyThreshold: parseFloat(notifyThreshold) || 4.0
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('POST /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
