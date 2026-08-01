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

  const user = await prisma.user.upsert({
    where: { email },
    // `role` ikut diperbarui: akun yang pernah turun peran harus bisa
    // dikembalikan lewat seed, bukan lewat SQL manual.
    update: { role: 'admin' },
    create: { email, name: 'Admin', role: 'admin' },
    select: { id: true },
  })

  /**
   * Password akun WAJIB ikut diperbarui saat seed dijalankan ulang.
   *
   * Sebelumnya `upsert` memakai `update: {}` sehingga akun yang sudah ada
   * dilewati sepenuhnya. Akibatnya: mengganti ADMIN_SEED_PASSWORD lalu
   * menjalankan seed lagi TIDAK mengubah apa pun, skripnya tetap mencetak
   * "Admin siap", dan login gagal dengan "Invalid email or password" tanpa
   * petunjuk sama sekali. Terjadi sungguhan dan butuh waktu lama dilacak.
   *
   * Dengan ini, menjalankan seed ulang = mereset password admin.
   */
  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: 'credential' },
    select: { id: true },
  })

  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashed },
    })
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: email,
        providerId: 'credential',
        password: hashed,
      },
    })
  }

  console.log(
    `✓ Admin siap: ${email} (password ${account ? 'diperbarui' : 'dibuat'})`,
  )
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
