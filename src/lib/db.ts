import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Vercel, use /tmp directory for SQLite
const databaseUrl = process.env.DATABASE_URL || 'file:/tmp/dentix.db'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Helper to handle database errors gracefully
export async function safeDbQuery<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query()
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
}
