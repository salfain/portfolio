import { getCategoryOptions } from '@/data/knowledge-admin'

import { AdminShell } from '@/components/admin/admin-shell'

import { DocumentForm } from '../document-form'

export const dynamic = 'force-dynamic'

export default async function NewDocumentPage() {
  const categories = await getCategoryOptions()

  return (
    <AdminShell
      title="Tambah Dokumen"
      description="Dokumen baru dimulai sebagai Draft dan tidak bisa dibuka publik."
    >
      <DocumentForm document={null} categories={categories} />
    </AdminShell>
  )
}
