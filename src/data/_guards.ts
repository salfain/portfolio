import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-policy'

/**
 * Wajib dipanggil di baris pertama setiap server action dan setiap
 * fungsi getAdmin*. Middleware Next.js tidak dijamin berjalan pada
 * setiap jalur pemanggilan, jadi ini satu-satunya lapisan keamanan
 * yang dapat diandalkan.
 *
 * Lihat docs/rules/06_SECURITY.md §2 & docs/rules/07_DATA_PRISMA.md §2.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !isAdminRole(session.user.role)) {
    throw new Error('UNAUTHORIZED')
  }

  return session
}

/**
 * Versi `requireAdmin()` untuk HALAMAN admin.
 *
 * Bedanya: mengarahkan ke login, bukan melempar. Middleware sudah
 * menangkap kasus "tidak ada cookie", tapi cookie yang KEDALUWARSA atau
 * dipalsukan tetap lolos ke sini — tanpa redirect, halamannya berakhir
 * sebagai layar error 500.
 *
 * Server action tetap memakai `requireAdmin()` yang melempar: action
 * perlu mengembalikan pesan galat ke form, bukan mengalihkan halaman.
 */
export async function requireAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !isAdminRole(session.user.role)) {
    redirect('/admin/login')
  }

  return session
}
