import { Plan, PaymentStatus } from '../../../generated/client';
import { PLANS, CheckoutResponse } from '../types';
import { billingRepository } from '../repositories/billing.repository';
import { isMockPayment, env } from '../utils/env';
import { v4 as uuidv4 } from 'uuid';

export class BillingService {
  async createCheckout(userId: string, userEmail: string, planName: Plan, origin?: string): Promise<CheckoutResponse> {
    const planConfig = PLANS[planName];
    if (!planConfig) throw new Error('Invalid plan selected');

    const externalId = `inv-${userId.slice(0, 8)}-${Date.now()}`;
    const amount = planConfig.price;
    const baseOrigin = origin || env.NEXT_PUBLIC_APP_URL;

    let invoiceUrl = '';
    let invoiceId = '';

    if (isMockPayment) {
      // Simulation Mode
      invoiceId = `mock-${uuidv4()}`;
      invoiceUrl = `${baseOrigin}/api/billing/mock-payment?externalId=${externalId}`;
    } else {
      // Xendit Mode (Sandbox/Production)
      const authHeader = Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString('base64');
      
      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_id: externalId,
          amount: amount,
          payer_email: userEmail,
          description: `Pembayaran Paket ${planName} TECTRA PRO`,
          success_redirect_url: `${baseOrigin}/?pay_success=true`,
          failure_redirect_url: `${baseOrigin}/#harga`,
          currency: 'IDR',
        })
      });

      const result = await response.json();
      console.log('Xendit API Response:', result);
      
      if (!response.ok) {
        console.error('Xendit API Error:', result);
        throw new Error(result.message || result.error_code || 'Xendit error');
      }

      invoiceId = result.id;
      invoiceUrl = result.invoice_url;
    }

    // Save to Database
    await billingRepository.createTransaction({
      userId,
      externalId,
      invoiceId,
      amount,
      plan: planName,
      metadata: { source: isMockPayment ? 'MOCK' : 'XENDIT' },
    });

    await billingRepository.createAuditLog({
      userId,
      action: 'CHECKOUT_CREATED',
      entity: 'TRANSACTION',
      entityId: externalId,
      details: { plan: planName, amount, mode: isMockPayment ? 'MOCK' : 'LIVE' },
    });

    return { invoiceUrl, externalId };
  }

  async handleWebhook(payload: any, signature?: string) {
    // 1. Verify Webhook (Xendit callback token)
    if (env.XENDIT_WEBHOOK_TOKEN && signature !== env.XENDIT_WEBHOOK_TOKEN) {
      throw new Error('Invalid webhook signature');
    }

    const { external_id, status, paid_at } = payload;
    
    // 2. Fetch Transaction
    const transaction = await billingRepository.getTransactionByExternalId(external_id);
    if (!transaction) throw new Error('Transaction not found');

    // 3. Handle Duplicates / Race Conditions
    if (transaction.status === PaymentStatus.PAID) {
      console.log(`Transaction ${external_id} already paid. Skipping.`);
      return { success: true, alreadyProcessed: true };
    }

    // 4. Update Status and Activate Subscription
    if (status === 'PAID' || status === 'SETTLED') {
      const paidDate = paid_at ? new Date(paid_at) : new Date();
      
      // professional plan expires in 30 days (example)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await billingRepository.updateTransactionStatus(transaction.id, PaymentStatus.PAID, paidDate);
      await billingRepository.activateSubscription(transaction.userId, transaction.plan, expiresAt);

      await billingRepository.createAuditLog({
        userId: transaction.userId,
        action: 'PAYMENT_SUCCESS',
        entity: 'SUBSCRIPTION',
        entityId: transaction.userId,
        details: { plan: transaction.plan, externalId: external_id },
      });

      return { success: true };
    }

    if (status === 'EXPIRED') {
      await billingRepository.updateTransactionStatus(transaction.id, PaymentStatus.EXPIRED);
      return { success: true };
    }

    return { success: false };
  }
}

export const billingService = new BillingService();
