import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const plan = searchParams.get('plan')
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (plan) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: plan }
      })
    }

    // Redirect kembali ke home dengan parameter sukses
    return NextResponse.redirect(new URL('/?pay_success=true', req.url))
  } catch (error) {
    console.error('Checkout success error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}
