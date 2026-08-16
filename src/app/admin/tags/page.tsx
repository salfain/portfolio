import { getAdminTags } from '@/data/knowledge'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteTagAction } from './actions'
import { TagForm } from './tag-form'

export const dynamic = 'force-dynamic'

export default async function AdminTagsPage() {
  const tags = await getAdminTags()

  return (
    <AdminShell
      title="Tag"
      description="Tag juga dibuat otomatis saat diketik di form dokumen. Halaman ini untuk merapikan."
    >
      {tags.length === 0 ? (
        <EmptyState
          title="Belum ada tag"
          description="Tag muncul di sini setelah dipakai di dokumen."
        />
      ) : (
        <ul className="mb-12 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface py-1.5 pl-4 pr-2"
            >
              <span className="text-sm">{tag.name}</span>
              <span className="text-xs text-muted">
                {tag._count.documents + tag._count.projects}
              </span>
              <DeleteButton
                id={tag.id}
                name={tag.name}
                action={deleteTagAction}
                label="×"
              />
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-medium">Tambah tag</h2>
      <div className="mt-6">
        <TagForm />
      </div>
    </AdminShell>
  )
}
