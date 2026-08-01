import { getAdminCategories } from '@/data/knowledge'

import { AdminShell } from '@/components/admin/admin-shell'

import { DocumentForm, type DocumentDefaults } from '../document-form'

export const dynamic = 'force-dynamic'

const blank: DocumentDefaults = {
  id: null,
  type: 'SOP',
  status: 'DRAFT',
  slug: '',
  documentCode: null,
  version: '1.0',
  titleId: '',
  titleEn: null,
  summaryId: '',
  summaryEn: null,
  contentIdJson: null,
  contentEnJson: null,
  difficulty: null,
  estimatedMinutes: null,
  tools: [],
  tagNames: [],
  categoryId: null,
  isFeatured: false,
  sortOrder: 0,
  wasPublished: false,
}

export default async function NewDocumentPage() {
  const categories = await getAdminCategories()

  return (
    <AdminShell title="Tambah Dokumen">
      <DocumentForm
        defaults={blank}
        categories={categories.map((category) => ({
          id: category.id,
          label: category.nameId,
        }))}
      />
    </AdminShell>
  )
}
