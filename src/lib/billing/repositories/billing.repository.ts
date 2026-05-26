import { Plan, PaymentStatus, PrismaClient } from '../../../generated/client';
import { prisma } from '@/lib/prisma';

export class BillingRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async createTransaction(data: {
    userId: string;
    externalId: string;
    invoiceId: string;
    amount: number;
    plan: Plan;
    expiresAt?: Date;
    metadata?: any;
  }) {
    return this.db.transaction.create({
      data: {
        userId: data.userId,
        externalId: data.externalId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        plan: data.plan,
        status: PaymentStatus.PENDING,
        expiresAt: data.expiresAt,
        metadata: data.metadata,
      },
    });
  }

  async getTransactionByExternalId(externalId: string) {
    return this.db.transaction.findUnique({
      where: { externalId },
      include: { user: true },
    });
  }

  async updateTransactionStatus(id: string, status: PaymentStatus, paidAt?: Date) {
    return this.db.transaction.update({
      where: { id },
      data: { status, paidAt },
    });
  }

  async activateSubscription(userId: string, plan: Plan, expiresAt?: Date) {
    return this.db.$transaction([
      // Update User Plan
      this.db.user.update({
        where: { id: userId },
        data: { plan },
      }),
      // Upsert Subscription
      this.db.subscription.upsert({
        where: { userId },
        update: {
          plan,
          active: true,
          expiresAt,
          startedAt: new Date(),
        },
        create: {
          userId,
          plan,
          active: true,
          expiresAt,
          startedAt: new Date(),
        },
      }),
    ]);
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.db.auditLog.create({
      data,
    });
  }

  async getUserSubscription(userId: string) {
    return this.db.subscription.findUnique({
      where: { userId },
    });
  }
}

export const billingRepository = new BillingRepository();
