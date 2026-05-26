import { NextResponse } from 'next/server';
import { billingRepository } from '@/lib/billing/repositories/billing.repository';
import { isMockPayment, env } from '@/lib/billing/utils/env';

export async function GET(req: Request) {
  if (!isMockPayment) {
    return NextResponse.json({ error: 'Mock payment only available in dev mode' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get('externalId');

  if (!externalId) return NextResponse.json({ error: 'Missing externalId' }, { status: 400 });

  const transaction = await billingRepository.getTransactionByExternalId(externalId);
  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  // Simulate Webhook Call
  try {
    const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/xendit`;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_id: externalId,
        status: 'PAID',
        paid_at: new Date().toISOString(),
        paid_amount: transaction.amount,
      })
    });

    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?pay_status=success`);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
