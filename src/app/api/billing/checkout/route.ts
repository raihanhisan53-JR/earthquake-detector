import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/services/billing.service';
import { Plan } from '../../../../generated/client';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!Object.values(Plan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkout = await billingService.createCheckout(user.id, user.email || '', plan as Plan);

    return NextResponse.json(checkout);
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
