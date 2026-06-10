import { Plan, PaymentStatus } from '../../../generated/client';
import { PLANS, CheckoutResponse } from '../types';
import { billingRepository } from '../repositories/billing.repository';
import { isMockPayment, env } from '../utils/env';
import { v4 as uuidv4 } from 'uuid';

export class BillingService {
  async createCheckout(userId: string, userEmail: string, planName: Plan, origin?: string): Promise<CheckoutResponse> {
    // First, check if there's already a pending transaction for this plan
    const existingPending = await billingRepository.getLatestPendingTransaction(userId, planName);
    if (existingPending) {
      // If there's a pending transaction, check if it's still valid (not expired)
      const isExpired = existingPending.expiresAt && new Date(existingPending.expiresAt) < new Date();
      if (!isExpired) {
        // Check if we can get the invoice URL (if it's Xendit)
        let invoiceUrl = '';
        if (existingPending.metadata?.source === 'MOCK') {
          invoiceUrl = `${origin || env.NEXT_PUBLIC_APP_URL}/api/billing/mock-payment?externalId=${existingPending.externalId}`;
        } else if (existingPending.invoiceId) {
          // Try to get the invoice from Xendit
          const authHeader = Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString('base64');
          const response = await fetch(`https://api.xendit.co/v2/invoices/${existingPending.invoiceId}`, {
            headers: { 'Authorization': `Basic ${authHeader}` }
          });
          if (response.ok) {
            const invoice = await response.json();
            invoiceUrl = invoice.invoice_url;
          }
        }
        if (invoiceUrl) {
          return { invoiceUrl, externalId: existingPending.externalId };
        }
      }
    }

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

  async verifyPayment(userId: string, externalId?: string) {
    let transaction;
    if (externalId) {
      transaction = await billingRepository.getTransactionByExternalId(externalId);
    } else {
      // Get latest pending transaction for user
      transaction = await billingRepository.getLatestPendingTransaction(userId);
    }

    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    // If transaction is already paid, just confirm
    if (transaction.status === PaymentStatus.PAID) {
      return { success: true, message: 'Payment already confirmed' };
    }

    // If it's a mock payment, just mark it as paid for testing
    if (transaction.metadata?.source === 'MOCK') {
      const paidDate = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await billingRepository.completePayment(
        transaction.id,
        transaction.userId,
        transaction.plan,
        expiresAt,
        paidDate
      );

      return { success: true, message: 'Mock payment confirmed' };
    }

    // Otherwise, check Xendit API
    if (!transaction.invoiceId) {
      return { success: false, message: 'Invoice ID not found' };
    }

    const authHeader = Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString('base64');
    const response = await fetch(`https://api.xendit.co/v2/invoices/${transaction.invoiceId}`, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Xendit verify error:', error);
      return { success: false, message: 'Failed to verify payment with Xendit' };
    }

    const invoice = await response.json();
    console.log('Xendit invoice status:', invoice.status);

    if (invoice.status === 'PAID' || invoice.status === 'SETTLED' || invoice.status === 'COMPLETED') {
      const paidDate = invoice.paid_at ? new Date(invoice.paid_at) : new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await billingRepository.completePayment(
        transaction.id,
        transaction.userId,
        transaction.plan,
        expiresAt,
        paidDate
      );

      return { success: true, message: 'Payment confirmed successfully' };
    }

    if (invoice.status === 'EXPIRED') {
      await billingRepository.updateTransactionStatus(transaction.id, PaymentStatus.EXPIRED);
      return { success: false, message: 'Invoice expired' };
    }

    return { success: false, message: 'Payment still pending' };
  }

  async handleWebhook(payload: any, signature?: string) {
    // 1. Verify Webhook (Xendit callback token)
    if (env.XENDIT_WEBHOOK_TOKEN && signature !== env.XENDIT_WEBHOOK_TOKEN) {
      throw new Error('Invalid webhook signature');
    }

    const { external_id, status, paid_at } = payload;
    console.log(`Processing webhook for ${external_id}. Status: ${status}`);
    
    // 2. Fetch Transaction
    const transaction = await billingRepository.getTransactionByExternalId(external_id);
    if (!transaction) {
      console.error(`Transaction not found for external_id: ${external_id}`);
      throw new Error('Transaction not found');
    }

    // 3. Handle Duplicates / Race Conditions
    // If it's already paid, we still check if the user's plan is correctly set
    // This handles cases where the transaction was updated but activateSubscription failed previously
    const isAlreadyPaid = transaction.status === PaymentStatus.PAID;
    
    // 4. Update Status and Activate Subscription
    if (status === 'PAID' || status === 'SETTLED' || status === 'COMPLETED') {
      const paidDate = paid_at ? new Date(paid_at) : new Date();
      
      // professional plan expires in 30 days (example)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      console.log(`Activating plan ${transaction.plan} for user ${transaction.userId}`);
      
      await billingRepository.completePayment(
        transaction.id, 
        transaction.userId, 
        transaction.plan, 
        expiresAt, 
        paidDate
      );

      await billingRepository.createAuditLog({
        userId: transaction.userId,
        action: 'PAYMENT_SUCCESS',
        entity: 'SUBSCRIPTION',
        entityId: transaction.userId,
        details: { plan: transaction.plan, externalId: external_id, alreadyPaid: isAlreadyPaid },
      });

      return { success: true, alreadyPaid: isAlreadyPaid };
    }

    if (status === 'EXPIRED') {
      console.log(`Transaction ${external_id} expired`);
      await billingRepository.updateTransactionStatus(transaction.id, PaymentStatus.EXPIRED);
      return { success: true };
    }

    return { success: false };
  }
}

export const billingService = new BillingService();
