import { NextResponse } from 'next/server'

// Catatan: Anda perlu menginstal xendit-node: npm install xendit-node
// Dan menambahkan XENDIT_SECRET_KEY di .env

export async function POST(req: Request) {
  try {
    const { planName, price, userEmail, userName } = await req.json()

    // Mock response untuk simulasi Xendit
    // Dalam produksi, gunakan:
    // const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! })
    // const { Invoice } = x
    // const invoice = new Invoice()
    // const result = await invoice.createInvoice({ ... })

    console.log(`Creating invoice for ${planName} - ${price} for ${userEmail}`)

    // Simulasi URL Invoice Xendit
    const invoiceUrl = `https://checkout.xendit.co/web/test-invoice-${Math.random().toString(36).substring(7)}`

    return NextResponse.json({ invoiceUrl })
  } catch (error) {
    console.error('Xendit checkout error:', error)
    return NextResponse.json({ error: 'Gagal membuat invoice pembayaran' }, { status: 500 })
  }
}
