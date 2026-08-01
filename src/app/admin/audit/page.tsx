import { getAuditLog } from '@/data/audit'
import { toIsoString } from '@/lib/format'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

const ACTION_LABELS: Record<string, string> = {
  create: 'Dibuat',
  update: 'Diubah',
  delete: 'Dihapus',
  publish: 'Diterbitkan',
  archive: 'Diarsipkan',
}

const ENTITY_LABELS: Record<string, string> = {
  KnowledgeDocument: 'Dokumen',
  KnowledgeCategory: 'Kategori',
  KnowledgeTag: 'Tag',
  Project: 'Proyek',
  Experience: 'Pengalaman',
  Skill: 'Keahlian',
  Certificate: 'Sertifikat',
  SiteProfile: 'Profil',
  SiteSetting: 'Pengaturan',
  ContactMessage: 'Pesan',
  MediaAsset: 'Media',
}

const formatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

/** Metadata hanya memuat pengenal yang aman ditampilkan (lihat data/audit.ts). */
function describe(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null

  return (
    Object.entries(metadata as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' · ') || null
  )
}

export default async function AdminAuditPage() {
  const entries = await getAuditLog()

  return (
    <AdminShell
      title="Log Audit"
      description="Siapa mengubah apa dan kapan. 100 aksi terakhir."
    >
      {entries.length === 0 ? (
        <EmptyState
          title="Belum ada aktivitas"
          description="Setiap perubahan lewat admin akan tercatat di sini."
        />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-border bg-surface px-5 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>{' '}
                  {ENTITY_LABELS[entry.entityType] ?? entry.entityType}
                  {entry.actor ? (
                    <span className="text-muted">
                      {' '}
                      oleh {entry.actor.name}
                    </span>
                  ) : (
                    // Aktor null = akunnya sudah dihapus (onDelete: SetNull).
                    <span className="text-muted"> oleh akun terhapus</span>
                  )}
                </p>
                {describe(entry.metadata) ? (
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {describe(entry.metadata)}
                  </p>
                ) : null}
              </div>

              <time
                dateTime={toIsoString(entry.createdAt)}
                className="shrink-0 text-xs text-muted"
              >
                {formatter.format(entry.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
