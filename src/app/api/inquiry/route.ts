import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, needs } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company,
        needs,
      }
    })

    console.log('New Lead Created:', lead.id, email)

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error: any) {
    console.error('Inquiry API error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
