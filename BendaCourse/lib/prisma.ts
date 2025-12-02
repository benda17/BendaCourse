import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // During build time, DATABASE_URL might not be available
  // We'll check it at runtime when the client is actually used
  // For now, create the client - it will fail gracefully if DATABASE_URL is missing at runtime
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless/connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Runtime check - only throw when actually trying to use the database
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('WARNING: DATABASE_URL environment variable is not set! Database operations will fail.')
}

