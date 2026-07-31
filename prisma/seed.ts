import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

// Seed admin sekali jalan, idempoten via upsert.
// Kredensial dibaca dari env var — TIDAK ada password hardcoded.
// Lihat docs/rules/06_SECURITY.md §1 & §7.

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD

  if (!email || !password) {
    throw new Error(
      'ADMIN_SEED_EMAIL & ADMIN_SEED_PASSWORD wajib di-set di .env.local untuk seed.',
    )
  }

  // Hash pakai fungsi resmi Better Auth (better-auth/crypto).
  // Format: "<salt-hex>:<key-hex>" (scrypt N=16384 r=16 p=1 dkLen=64).
  // Sebelumnya pakai scrypt Node stdlib dengan format berbeda —
  // password tidak bisa diverifikasi saat login. Lihat NOTES N3.
  const hashed = await hashPassword(password)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      role: 'admin',
      accounts: {
        create: {
          accountId: email,
          providerId: 'credential',
          password: hashed,
        },
      },
    },
  })

  console.log(`✓ Admin siap: ${email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
