import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingService } from '@/lib/billing/services/billing.service';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { externalId } = await req.json();

    const result = await billingService.verifyPayment(user.id, externalId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify payment' }, { status: 500 });
  }
}
