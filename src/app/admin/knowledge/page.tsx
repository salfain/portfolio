import Link from 'next/link'

import { getAdminDocuments } from '@/data/knowledge'
import type { PublishStatusValue } from '@/lib/schemas/admin'
import { documentHref } from '@/lib/knowledge-type'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteDocumentAction } from './actions'

export const dynamic = 'force-dynamic'

const TYPE_LABELS = {
  SOP: 'SOP',
  LAB: 'Lab',
  INCIDENT: 'Insiden',
  ARTICLE: 'Artikel',
} as const

export default async function AdminKnowledgePage() {
  const documents = await getAdminDocuments()

  return (
    <AdminShell
      title="Knowledge Base"
      description="SOP, lab, insiden, dan artikel. Hanya dokumen Terbit yang punya halaman publik."
      action={
        <Button asChild>
          <Link href="/admin/knowledge/new">Tambah</Link>
        </Button>
      }
    >
      {documents.length === 0 ? (
        <EmptyState
          title="Belum ada dokumen"
          description="Tambahkan SOP, lab, atau laporan insiden pertama."
        />
      ) : (
        <ul className="space-y-3">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                    {TYPE_LABELS[document.type]}
                  </span>
                  <p className="font-medium">{document.titleId}</p>
                  <StatusBadge status={document.status as PublishStatusValue} />
                  {!document.titleEn ? (
                    <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                      ID saja
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-muted">
                  {[
                    document.documentCode,
                    document.category?.nameId,
                    `${document._count.revisions} revisi`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {document.status === 'PUBLISHED' ? (
                  // Tautan ke halaman publiknya — cara tercepat memeriksa
                  // hasil suntingan tanpa mencari sendiri URL-nya.
                  <a
                    href={`/id${documentHref(document.type, document.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm text-sm text-muted underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Lihat
                  </a>
                ) : null}
                <Link
                  href={`/admin/knowledge/${document.id}`}
                  className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton id={document.id} action={deleteDocumentAction} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
