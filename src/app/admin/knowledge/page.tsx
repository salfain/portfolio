import Link from 'next/link'

import { getAdminDocuments } from '@/data/knowledge-admin'
import { documentHref } from '@/lib/knowledge-type'
import { formatFullDate } from '@/lib/format'
import {
  KNOWLEDGE_TYPE_LABEL,
  knowledgeTypeSchema,
  publishStatusSchema,
  type PublishStatusValue,
} from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteDocumentAction } from './actions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminKnowledgePage({ searchParams }: PageProps) {
  const params = await searchParams

  // Nilai filter yang tidak sah diabaikan diam-diam, bukan dijadikan galat:
  // ini URL yang bisa diketik siapa saja, bukan masukan form.
  const type = knowledgeTypeSchema.safeParse(params.tipe)
  const status = publishStatusSchema.safeParse(params.status)

  const documents = await getAdminDocuments({
    type: type.success ? type.data : undefined,
    status: status.success ? status.data : undefined,
  })

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
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterLink
          label="Semua"
          href="/admin/knowledge"
          active={!type.success && !status.success}
        />

        {Object.entries(KNOWLEDGE_TYPE_LABEL).map(([value, label]) => (
          <FilterLink
            key={value}
            label={label}
            href={`/admin/knowledge?tipe=${value}`}
            active={type.success && type.data === value}
          />
        ))}

        <FilterLink
          label="Draft"
          href="/admin/knowledge?status=DRAFT"
          active={status.success && status.data === 'DRAFT'}
        />
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="Belum ada dokumen"
          description="Dokumen pertama akan langsung muncul di Knowledge Base publik begitu diterbitkan."
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
                  <p className="font-medium">{document.titleId}</p>
                  <StatusBadge status={document.status as PublishStatusValue} />
                  <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                    {KNOWLEDGE_TYPE_LABEL[document.type]}
                  </span>
                  {document.isFeatured ? (
                    <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
                      Pilihan
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-sm text-muted">
                  {documentHref(document.type, document.slug)}
                  {document.documentCode ? ` · ${document.documentCode}` : ''}
                  {` · v${document.version}`}
                  {document._count.revisions > 0
                    ? ` · ${document._count.revisions} revisi`
                    : ''}
                </p>

                <p className="mt-1 text-xs text-muted">
                  Diperbarui {formatFullDate(document.updatedAt, 'id')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/knowledge/${document.id}/preview`}
                  className="rounded-sm text-sm text-muted hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Pratinjau
                </Link>
                <Link
                  href={`/admin/knowledge/${document.id}`}
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton
                  id={document.id}
                  name={document.titleId}
                  action={deleteDocumentAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={
        active
          ? 'rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground'
          : 'rounded-full bg-elevated px-3 py-1.5 text-sm text-muted hover:text-foreground'
      }
    >
      {label}
    </Link>
  )
}
