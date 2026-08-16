import { getAdminCategories } from '@/data/knowledge'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteCategoryAction } from './actions'
import { CategoryForm } from './category-form'

export const dynamic = 'force-dynamic'

const blank = {
  id: null,
  slug: '',
  nameId: '',
  nameEn: '',
  descriptionId: null,
  descriptionEn: null,
  sortOrder: 0,
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <AdminShell
      title="Kategori"
      description="Satu dokumen satu kategori. Kategori tanpa dokumen terbit tidak muncul di situs publik."
    >
      {categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori"
          description="Tambahkan kategori pertama lewat form di bawah."
        />
      ) : (
        <ul className="mb-12 space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">{category.nameId}</p>
                <p className="mt-1 text-sm text-muted">
                  /{category.slug} · {category._count.documents} dokumen ·{' '}
                  {category._count.projects} proyek
                </p>
              </div>
              <DeleteButton id={category.id} action={deleteCategoryAction} />
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-medium">Tambah kategori</h2>
      <div className="mt-6">
        <CategoryForm defaults={blank} />
      </div>
    </AdminShell>
  )
}
