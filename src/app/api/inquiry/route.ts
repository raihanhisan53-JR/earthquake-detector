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

    // Kirim Notifikasi Email ke Admin (via Resend)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TECTRA PRO <onboarding@resend.dev>',
            to: 'raihanhisan36@gmail.com',
            subject: `New Enterprise Inquiry: ${name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #8b5cf6;">Inquiry Baru (Enterprise)</h2>
                <p>Ada permintaan konsultasi baru dari website:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nama:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Perusahaan:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${company || '-'}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Kebutuhan:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${needs || '-'}</td></tr>
                </table>
                <p style="margin-top: 20px;">Segera hubungi calon klien ini.</p>
              </div>
            `,
          }),
        })
      } catch (err) {
        console.error('Failed to send inquiry email:', err)
      }
    }

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error: any) {
    console.error('Inquiry API error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
