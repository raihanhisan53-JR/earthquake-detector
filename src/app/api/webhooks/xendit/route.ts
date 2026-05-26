import { NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/services/billing.service';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-callback-token');

    console.log('Xendit Webhook Received:', payload.external_id, payload.status);

    const result = await billingService.handleWebhook(payload, signature || undefined);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    // Xendit will retry if we don't return 2xx
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
