import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAdminDocumentById } from '@/data/knowledge-admin'
import { documentHref } from '@/lib/knowledge-type'
import { parseDocument } from '@/lib/prosemirror/types'
import { ProseMirrorContent } from '@/lib/prosemirror/render'
import {
  KNOWLEDGE_TYPE_LABEL,
  type PublishStatusValue,
} from '@/lib/schemas/admin'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ bahasa?: string }>
}

/**
 * Pratinjau dokumen, termasuk yang masih Draft.
 *
 * Memakai renderer yang SAMA PERSIS dengan halaman publik
 * (`src/lib/prosemirror/render.tsx`), bukan tiruan yang mirip. Pratinjau
 * yang dirender jalur lain akan berbohong tepat di kasus yang paling
 * penting: node yang tidak dikenal renderer publik.
 *
 * Rute ini ada di bawah `/admin`, jadi dijaga middleware DAN
 * `requireAdminPage()` di dalam `AdminShell` maupun fungsi datanya.
 */
export default async function PreviewDocumentPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { bahasa } = await searchParams

  const document = await getAdminDocumentById(id)

  if (!document) notFound()

  const showEnglish = bahasa === 'en'

  const title = showEnglish
    ? (document.titleEn ?? document.titleId)
    : document.titleId
  const summary = showEnglish
    ? (document.summaryEn ?? document.summaryId)
    : document.summaryId

  const rawContent = showEnglish
    ? (document.contentEnJson ?? document.contentIdJson)
    : document.contentIdJson

  const content = parseDocument(rawContent)
  const fallsBack = showEnglish && !document.contentEnJson

  return (
    <AdminShell
      title="Pratinjau"
      description={documentHref(document.type, document.slug)}
      action={
        <Link
          href={`/admin/knowledge/${document.id}`}
          className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Kembali menyunting
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LocaleTab id={document.id} label="Indonesia" active={!showEnglish} />
        <LocaleTab
          id={document.id}
          label="Inggris"
          active={showEnglish}
          english
        />

        <span className="ml-auto flex items-center gap-2">
          <StatusBadge status={document.status as PublishStatusValue} />
          <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-muted">
            {KNOWLEDGE_TYPE_LABEL[document.type]}
          </span>
        </span>
      </div>

      {document.status !== 'PUBLISHED' ? (
        <p
          role="status"
          className="mb-6 rounded-xl border border-warning bg-elevated px-4 py-3 text-sm"
        >
          Dokumen ini belum terbit. Alamat publiknya membalas 404 sampai
          statusnya diubah menjadi Terbit.
        </p>
      ) : null}

      {fallsBack ? (
        <p
          role="status"
          className="mb-6 rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-muted"
        >
          Isi bahasa Inggris belum ada. Halaman EN akan menampilkan versi
          Indonesia beserta pemberitahuannya — persis seperti yang tampil di
          bawah ini.
        </p>
      ) : null}

      <article className="max-w-3xl rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl">{title}</h1>
        <p className="mt-3 text-muted">{summary}</p>

        <hr className="my-8 border-border" />

        {content ? (
          <ProseMirrorContent doc={content} />
        ) : (
          <EmptyState
            title="Isi dokumen belum ada"
            description="Tulis isinya di editor, lalu simpan untuk melihat pratinjau."
          />
        )}
      </article>
    </AdminShell>
  )
}

function LocaleTab({
  id,
  label,
  active,
  english = false,
}: {
  id: string
  label: string
  active: boolean
  english?: boolean
}) {
  return (
    <Link
      href={`/admin/knowledge/${id}/preview${english ? '?bahasa=en' : ''}`}
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
