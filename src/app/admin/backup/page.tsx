import { getDocumentsForExport } from '@/data/knowledge'

import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export default async function AdminBackupPage() {
  const documents = await getDocumentsForExport()

  const linkClass =
    'inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  return (
    <AdminShell
      title="Backup & Ekspor"
      description="Unduh seluruh isi Knowledge Base. Berkas JSON memakai format yang sama dengan seed, jadi bisa dipakai memulihkan."
    >
      <p className="text-sm text-muted">
        {documents.length} dokumen siap diekspor, termasuk draft.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {/* <a download>, bukan <Link>: tujuannya Route Handler yang
            mengirim berkas dengan Content-Disposition, bukan halaman.
            <Link> akan mem-prefetch dan menavigasi lewat router klien,
            yang membatalkan unduhannya.

            eslint-disable diperlukan karena aturannya tidak bisa
            membedakan Route Handler dari Page — keduanya terlihat sebagai
            path di bawah app/. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/admin/backup/export?format=json"
          download
          className={linkClass}
        >
          Unduh JSON
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/admin/backup/export?format=markdown"
          download
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Unduh Markdown
        </a>
      </div>

      <div className="mt-10 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm">
        <p className="font-medium">Yang TIDAK ikut di berkas ekspor</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>
            Bukti yang belum dikonfirmasi redaksinya, dan seluruh aset privat
          </li>
          <li>Isi versi lama dari riwayat revisi</li>
          <li>Pesan dari form kontak</li>
          <li>Berkas media itu sendiri — hanya kunci berkasnya yang dicatat</li>
        </ul>
      </div>
    </AdminShell>
  )
}
