import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import { PrismaClient } from './generated/prisma/client'

// Neon needs a WebSocket implementation in Node.js runtimes.
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({ adapter })
}

// Reuse a single client across HMR reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
