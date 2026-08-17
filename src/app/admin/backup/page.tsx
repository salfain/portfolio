import { getDocumentsForExport } from '@/data/knowledge'

import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export default async function AdminBackupPage() {
  const documents = await getDocumentsForExport()

  const linkClass =
    'inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hi focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  return (
    <AdminShell
      title="Backup & Ekspor"
      description="Unduh seluruh isi Basis Pengetahuan. Berkas JSON memakai format yang sama dengan seed, jadi bisa dipakai memulihkan."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-7">
          <h2 className="kicker">Ekspor</h2>
          <p className="mt-4 font-display text-4xl tabular-nums leading-none">
            {documents.length}
          </p>
          <p className="mt-3 text-sm text-muted">
            dokumen siap diekspor, termasuk draf.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {/* <a download>, bukan <Link>: tujuannya Route Handler yang
            mengirim berkas dengan Content-Disposition, bukan halaman.
            <Link> akan mem-prefetch dan menavigasi lewat router klien,
            yang membatalkan unduhannya.

            Dulu di sini ada eslint-disable karena aturan
            no-html-link-for-pages tidak bisa membedakan Route Handler dari
            Page. Sejak Next 16 aturannya tidak lagi menyalakan peringatan
            untuk kasus ini, jadi disable-nya dihapus — ESLint melaporkan
            direktif yang tidak terpakai sebagai peringatan tersendiri. */}
            <a
              href="/admin/backup/export?format=json"
              download
              className={linkClass}
            >
              Unduh JSON
            </a>
            <a
              href="/admin/backup/export?format=markdown"
              download
              className="inline-flex items-center rounded-full border border-border-med px-5 py-2.5 text-sm font-medium transition-colors hover:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Unduh Markdown
            </a>
          </div>
        </div>

        {/* Kartu kedua bergaris danger, sesuai handoff. Isinya batasan
            ekspor, BUKAN dropzone pulihkan: memulihkan dari berkas belum
            ada di kode mana pun, dan dropzone yang tidak mengerjakan apa
            pun lebih berbahaya daripada tidak ada dropzone sama sekali. */}
        <div className="rounded-3xl border border-danger/40 bg-surface p-7">
          <h2 className="kicker text-danger">Batasan</h2>
          <p className="mt-4 font-medium">Yang TIDAK ikut di berkas ekspor</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {[
              'Bukti yang belum dikonfirmasi redaksinya, dan seluruh aset privat',
              'Isi versi lama dari riwayat revisi',
              'Pesan dari form kontak',
              'Berkas media itu sendiri — hanya kunci berkasnya yang dicatat',
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-muted"
              >
                <span
                  aria-hidden
                  className="mt-2 h-[3px] w-[3px] shrink-0 rounded-full bg-faint"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-muted">
            Berkas JSON memakai format yang sama dengan seed, jadi pemulihan
            dilakukan lewat <code className="font-mono text-xs">db:seed</code>,
            bukan dari halaman ini.
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
