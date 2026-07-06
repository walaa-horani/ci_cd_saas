import { defineConfig } from 'prisma/config'

// Prisma 7 no longer auto-loads .env; load it here for migrate commands.
try {
  process.loadEnvFile()
} catch {
  // No .env file (e.g. CI provides vars directly) — ignore.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Direct (non-pooled) Neon connection — used by prisma migrate.
    // Empty until DIRECT_URL is set; generate/validate don't need it.
    url: process.env.DIRECT_URL ?? '',
  },
})
