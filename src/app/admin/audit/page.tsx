import { getAuditLog } from '@/data/audit'
import { formatFullDate } from '@/lib/format'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

const ACTION_LABEL: Record<string, string> = {
  create: 'Dibuat',
  update: 'Diubah',
  publish: 'Diterbitkan',
  unpublish: 'Ditarik dari publik',
  archive: 'Diarsipkan',
  delete: 'Dihapus',
}

/**
 * Jejak audit, hanya baca.
 *
 * Tidak ada tombol hapus dan tidak ada penyuntingan: catatan audit yang
 * bisa diubah dari antarmuka yang sama dengan yang dicatatnya tidak
 * membuktikan apa pun.
 */
export default async function AuditPage() {
  const entries = await getAuditLog()

  return (
    <AdminShell
      title="Jejak Audit"
      description="Siapa mengubah apa. Isi dokumen tidak ikut dicatat — hanya perubahannya."
    >
      {entries.length === 0 ? (
        <EmptyState
          title="Belum ada catatan"
          description="Setiap penyimpanan, penerbitan, dan penghapusan isi akan muncul di sini."
        />
      ) : (
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {ACTION_LABEL[entry.action] ?? entry.action} ·{' '}
                  {entry.entityType}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {entry.actor?.name ?? entry.actor?.email ?? 'Tidak diketahui'}
                  {entry.entityId ? ` · ${entry.entityId}` : ''}
                </p>
              </div>

              <p className="shrink-0 text-xs text-muted">
                {formatFullDate(entry.createdAt, 'id')}
              </p>
            </li>
          ))}
        </ol>
      )}
    </AdminShell>
  )
}
