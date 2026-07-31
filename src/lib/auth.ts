import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'

import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { adminEmailAndPassword } from '@/lib/auth-policy'

// Admin-only: email+password, TANPA sign-up.
// Tidak ada rute registrasi/undangan/lupa-password publik.
// Lihat docs/rules/06_SECURITY.md §7.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // Akun admin hanya dibuat lewat prisma/seed.ts. Better Auth
  // mengizinkan sign-up secara default, jadi kebijakan mematikannya eksplisit.
  emailAndPassword: adminEmailAndPassword,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 menit
    },
  },
  plugins: [admin()],
  // Sesi: cookie httpOnly + secure (produksi) + sameSite=lax.
  // Better Auth default sudah memenuhi ini (docs/rules/06_SECURITY.md §7).
})
