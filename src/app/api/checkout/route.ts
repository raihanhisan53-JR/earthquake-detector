import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Catatan: Anda perlu menginstal xendit-node: npm install xendit-node
// Dan menambahkan XENDIT_SECRET_KEY di .env

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planName, price } = await req.json()
    const secretKey = process.env.XENDIT_SECRET_KEY

    // Gunakan URL dinamis dari request agar redirect kembali ke tempat asal (Vercel atau Localhost)
    const url = new URL(req.url)
    const origin = `${url.protocol}//${req.headers.get('host')}`

    if (!secretKey) {
      return NextResponse.json({ error: 'Xendit Secret Key tidak terkonfigurasi' }, { status: 500 })
    }

    // Menggunakan Basic Auth sesuai standar Xendit
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64')

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_id: `invoice-${user.id}-${Date.now()}`,
        amount: price,
        payer_email: user.email,
        description: `Pembayaran Paket ${planName} TECTRA PRO`,
        success_redirect_url: `${origin}/api/checkout/success?plan=${planName}`,
        failure_redirect_url: `${origin}/#harga`,
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal membuat invoice Xendit')
    }

    return NextResponse.json({ invoiceUrl: result.invoice_url })
  } catch (error: any) {
    console.error('Xendit checkout error:', error)
    return NextResponse.json({ error: error.message || 'Gagal membuat invoice pembayaran' }, { status: 500 })
  }
}
