import { Plan, PaymentStatus } from '../../../generated/client';

export type PlanConfig = {
  name: Plan;
  price: number;
  description: string;
  features: string[];
};

export const PLANS: Record<Plan, PlanConfig> = {
  [Plan.STARTER]: {
    name: Plan.STARTER,
    price: 0,
    description: 'Cocok untuk personal monitoring & belajar seismologi.',
    features: [
      'Data BMKG real-time',
      'Notifikasi email dasar',
      'Dashboard standar',
      'Riwayat 30 hari',
      '1 sensor ESP32',
      'Community support',
    ],
  },
  [Plan.PROFESSIONAL]: {
    name: Plan.PROFESSIONAL,
    price: 99000,
    description: 'Untuk tim SAR, sekolah, kantor, dan komunitas.',
    features: [
      'Semua fitur Starter',
      'ARIA AI Assistant (Chat 24/7)',
      'Notifikasi push + SMS',
      'AI magnitude prediction',
      'Riwayat unlimited',
      'Hingga 10 sensor ESP32',
      'REST API access',
      'Radius alert custom',
    ],
  },
  [Plan.ENTERPRISE]: {
    name: Plan.ENTERPRISE,
    price: 0, // Custom pricing
    description: 'Untuk pemerintah, BNPB, NGO, dan korporasi besar.',
    features: [
      'Semua fitur Pro',
      'Unlimited sensors',
      'White-label dashboard',
      'SLA 99.9% uptime',
      'Dedicated server',
      'Custom AI model training',
      'Webhook & integration',
      'On-site training',
      '24/7 phone support',
      'Multi-tenant management',
    ],
  },
};

export interface CreateCheckoutRequest {
  plan: Plan;
}

export interface CheckoutResponse {
  invoiceUrl: string;
  externalId: string;
}

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  user_id: string;
  status: 'PAID' | 'EXPIRED' | 'SETTLED';
  paid_amount: number;
  paid_at: string;
  payment_method: string;
  currency: string;
  // ... other fields from Xendit
}
