/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

function createPrismaClient(): any {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg(connectionString)
  const { PrismaClient } = require('@prisma/client')
  return new PrismaClient({ adapter })
}

export const prisma: any = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
