import { NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/services/billing.service';
import { env } from '@/lib/billing/utils/env';

export async function POST(req: Request) {
  try {
    // Get Xendit webhook token from headers for verification
    const xenditToken = req.headers.get('x-callback-token') ?? undefined;
    
    // Verify webhook token if provided (recommended for security)
    if (env.XENDIT_WEBHOOK_TOKEN && xenditToken !== env.XENDIT_WEBHOOK_TOKEN) {
      console.error('Invalid Xendit webhook token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('Received Xendit webhook:', JSON.stringify(payload, null, 2));

    await billingService.handleWebhook(payload, xenditToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
