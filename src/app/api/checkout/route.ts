import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { billingService } from '@/lib/billing/services/billing.service'
import { Plan } from '@/generated/client'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planName, price } = await req.json()

    const plan = (planName === 'Professional' || planName === 'PROFESSIONAL' ? Plan.PROFESSIONAL : Plan.STARTER) as Plan

    const url = new URL(req.url)
    const origin = `${url.protocol}//${req.headers.get('host')}`

    const result = await billingService.createCheckout(user.id, user.email || '', plan, origin)

    return NextResponse.json({ invoiceUrl: result.invoiceUrl })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create checkout' }, { status: 500 })
  }
}
