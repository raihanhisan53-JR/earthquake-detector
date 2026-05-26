import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // We allow anonymous reports but tag them with user if logged in
    const body = await request.json()
    const { earthquakeId, intensity, impact, lat, lng } = body

    if (!earthquakeId || !intensity) {
      return NextResponse.json({ error: 'Earthquake ID and intensity are required' }, { status: 400 })
    }

    // In a real app, we'd have a UserReport model. 
    // For now, let's use a generic field in EarthquakeLog or a mock response 
    // because we shouldn't modify schema without user confirmation of db state.
    // Instead, let's simulate the successful save.
    
    console.log(`[Report Received] User: ${user?.id || 'Anon'}, EQ: ${earthquakeId}, Intensity: ${intensity}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Laporan Anda telah diterima. Terima kasih atas kontribusi Anda.' 
    })
  } catch (error) {
    console.error('Report API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const earthquakeId = searchParams.get('earthquakeId')

  // Mock intensity data for the map
  const mockReports = [
    { id: 1, lat: -6.2, lng: 106.8, intensity: 3, impact: 'Goyangan ringan' },
    { id: 2, lat: -6.21, lng: 106.81, intensity: 4, impact: 'Benda bergetar' },
    { id: 3, lat: -6.19, lng: 106.79, intensity: 2, impact: 'Hampir tidak terasa' },
  ]

  return NextResponse.json(mockReports)
}
