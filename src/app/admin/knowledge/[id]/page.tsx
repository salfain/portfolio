import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAdminDocumentById, getCategoryOptions } from '@/data/knowledge-admin'
import { documentHref } from '@/lib/knowledge-type'
import { formatFullDate } from '@/lib/format'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { AdminShell } from '@/components/admin/admin-shell'

import { DocumentForm, type DocumentFormValues } from '../document-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params

  const [document, categories] = await Promise.all([
    getAdminDocumentById(id),
    getCategoryOptions(),
  ])

  if (!document) notFound()

  const values: DocumentFormValues = {
    id: document.id,
    type: document.type,
    slug: document.slug,
    documentCode: document.documentCode,
    version: document.version,
    titleId: document.titleId,
    titleEn: document.titleEn,
    summaryId: document.summaryId,
    summaryEn: document.summaryEn,
    contentIdJson: document.contentIdJson,
    contentEnJson: document.contentEnJson,
    metadata: document.metadata,
    categoryId: document.categoryId,
    tags: document.tags.map((row) => row.tag.name),
    difficulty: document.difficulty,
    estimatedMinutes: document.estimatedMinutes,
    tools: document.tools,
    isFeatured: document.isFeatured,
    sortOrder: document.sortOrder,
    status: document.status as PublishStatusValue,
  }

  return (
    <AdminShell
      title="Ubah Dokumen"
      description={documentHref(document.type, document.slug)}
      action={
        <div className="flex items-center gap-4">
          {/* Unduhan: tautan biasa, bukan Link — rute ini membalas berkas,
              bukan halaman, jadi tidak ada yang perlu dinavigasi klien. */}
          <a
            href={`/admin/knowledge/${document.id}/export?format=json`}
            className="rounded-sm text-sm text-muted hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            JSON
          </a>
          <a
            href={`/admin/knowledge/${document.id}/export?format=md`}
            className="rounded-sm text-sm text-muted hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Markdown
          </a>
          <Link
            href={`/admin/knowledge/${document.id}/media`}
            className="rounded-sm text-sm text-muted hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Bukti
          </Link>
          <Link
            href={`/admin/knowledge/${document.id}/preview`}
            className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Pratinjau
          </Link>
        </div>
      }
    >
      <DocumentForm document={values} categories={categories} />

      {document.revisions.length > 0 ? (
        <section className="mt-12 max-w-4xl">
          <h2 className="font-display text-xl font-semibold">Riwayat revisi</h2>
          <p className="mt-1 text-sm text-muted">
            Tercatat otomatis setiap kali dokumen yang sudah terbit disunting.
            Isi versi lama sengaja tidak ditampilkan — versi lama bisa memuat
            data yang justru sudah diredaksi di versi terbaru.
          </p>

          <ol className="mt-4 space-y-3">
            {document.revisions.map((revision) => (
              <li
                key={revision.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-sm font-medium">
                  v{revision.version} · {revision.changeSummary}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatFullDate(revision.createdAt, 'id')}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </AdminShell>
  )
}
