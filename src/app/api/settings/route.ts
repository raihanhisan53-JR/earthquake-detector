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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true }
    })

    // Determine plan from either user field or active subscription
    let activePlan = dbUser?.plan || 'STARTER'

    // Admin Bypass - Robust Check
    const ADMIN_EMAILS = [
      'raihanhisan36@gmail.com', 
      'raihanhisan3@gmail.com',
      'raihanhisan@gmail.com'
    ]
    const isAdmin = (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) || 
                    user.user_metadata?.role === 'admin' ||
                    user.app_metadata?.role === 'admin'

    if (isAdmin) {
      activePlan = 'PROFESSIONAL'
    } else if (dbUser?.subscription && dbUser.subscription.active) {
      // Check for expiration
      if (!dbUser.subscription.expiresAt || new Date(dbUser.subscription.expiresAt) > new Date()) {
        activePlan = dbUser.subscription.plan
      }
    }

    return NextResponse.json({
      ...settings,
      plan: activePlan,
      notifyRegion: settings?.notifyRegion || 'Semua',
      notifyThreshold: settings?.notifyThreshold || 4.0
    })
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

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      },
      create: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      }
    })

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
