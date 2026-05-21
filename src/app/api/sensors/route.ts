import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const readings = await prisma.sensorReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    })
    return NextResponse.json(readings)
  } catch (error) {
    console.error('GET /api/sensors error:', error)
    return NextResponse.json({ error: 'Failed to fetch sensor readings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pgaCms2, pgaPeak, alertLevel, status, sensorIp } = body

    const reading = await prisma.sensorReading.create({
      data: {
        pgaCms2: parseFloat(pgaCms2) || 0,
        pgaPeak: parseFloat(pgaPeak) || 0,
        alertLevel: parseInt(alertLevel) || 0,
        status: status || 'AMAN',
        sensorIp: sensorIp || null,
      },
    })

    return NextResponse.json(reading, { status: 201 })
  } catch (error) {
    console.error('POST /api/sensors error:', error)
    return NextResponse.json({ error: 'Failed to save sensor reading' }, { status: 500 })
  }
}
