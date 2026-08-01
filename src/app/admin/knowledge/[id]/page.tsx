import { notFound } from 'next/navigation'

import { getAdminCategories, getAdminDocumentById } from '@/data/knowledge'
import { parseDocument } from '@/lib/prosemirror/types'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { AdminShell } from '@/components/admin/admin-shell'

import { DocumentForm } from '../document-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params
  const [document, categories] = await Promise.all([
    getAdminDocumentById(id),
    getAdminCategories(),
  ])

  if (!document) notFound()

  return (
    <AdminShell
      title="Ubah Dokumen"
      description={`/${document.slug}`}
    >
      <DocumentForm
        defaults={{
          id: document.id,
          type: document.type,
          status: document.status as PublishStatusValue,
          slug: document.slug,
          documentCode: document.documentCode,
          version: document.version,
          titleId: document.titleId,
          titleEn: document.titleEn,
          summaryId: document.summaryId,
          summaryEn: document.summaryEn,
          // parseDocument mengembalikan null bila isinya rusak — form tetap
          // terbuka dengan editor kosong alih-alih gagal render.
          contentIdJson: parseDocument(document.contentIdJson),
          contentEnJson: parseDocument(document.contentEnJson),
          difficulty: document.difficulty,
          estimatedMinutes: document.estimatedMinutes,
          tools: document.tools,
          tagNames: document.tags.map((item) => item.tag.name),
          categoryId: document.categoryId,
          isFeatured: document.isFeatured,
          sortOrder: document.sortOrder,
          wasPublished: document.status === 'PUBLISHED',
        }}
        categories={categories.map((category) => ({
          id: category.id,
          label: category.nameId,
        }))}
      />
    </AdminShell>
  )
}
