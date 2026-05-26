import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isMockPayment } from '@/lib/billing/utils/env';

export async function GET() {
  if (!isMockPayment) {
    return NextResponse.json({ error: 'Not allowed in production', isMock: false }, { status: 403 });
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ transactions, isMock: true });
}
