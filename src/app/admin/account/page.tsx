import { requireAdminPage } from '@/data/_guards'

import { AdminShell } from '@/components/admin/admin-shell'

import { PasswordForm } from './password-form'

export const dynamic = 'force-dynamic'

/**
 * Akun admin.
 *
 * Sebelum halaman ini ada, kata sandi hanya bisa diubah lewat
 * `prisma/seed.ts` — yang berarti butuh akses shell ke server produksi
 * tepat pada saat kata sandinya diduga bocor.
 *
 * Yang SENGAJA tidak ada di sini: membuat pengguna baru, mengubah peran,
 * dan menghapus akun. Situs ini punya satu admin, dan menambah cara
 * membuat akun berarti menambah cara akun dibuat tanpa sepengetahuan
 * pemiliknya (06_SECURITY §7 — tanpa registrasi publik).
 */
export default async function AccountPage() {
  const session = await requireAdminPage()

  return (
    <AdminShell
      title="Akun"
      description={session.user.email}
    >
      <section className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold">Ganti kata sandi</h2>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </AdminShell>
  )
}
