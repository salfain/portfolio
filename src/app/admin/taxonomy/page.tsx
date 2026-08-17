import Link from 'next/link'

import { getAdminCategories, getAdminTags } from '@/data/knowledge-admin'

import { EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { DeleteButton } from '@/components/admin/delete-button'

import { CategoryForm } from './category-form'
import { deleteCategoryAction, deleteTagAction } from './actions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ ubah?: string }>
}

export default async function TaxonomyPage({ searchParams }: PageProps) {
  const { ubah } = await searchParams

  const [categories, tags] = await Promise.all([
    getAdminCategories(),
    getAdminTags(),
  ])

  const editing = ubah
    ? (categories.find((category) => category.id === ubah) ?? null)
    : null

  return (
    <AdminShell
      title="Kategori & Tag"
      description="Kategori dibuat manual. Tag dibuat otomatis saat diketik di form dokumen."
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface p-7">
          <h2 className="kicker">
            {editing ? 'Ubah kategori' : 'Tambah kategori'}
          </h2>

          {editing ? (
            <p className="mt-1 text-sm text-muted">
              Menyunting{' '}
              <span className="font-medium text-foreground">
                {editing.nameId}
              </span>
              .{' '}
              <Link
                href="/admin/taxonomy"
                className="text-primary hover:underline"
              >
                Batal
              </Link>
            </p>
          ) : null}

          <div className="mt-4">
            {/* `key` memaksa form dibuat ulang saat berpindah kategori —
              tanpa itu nilai default input tidak ikut berganti. */}
            <CategoryForm key={editing?.id ?? 'baru'} category={editing} />
          </div>

          <h2 className="kicker mt-10">Kategori</h2>

          {categories.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Belum ada kategori"
                description="Dokumen boleh terbit tanpa kategori, tapi halaman kategori baru muncul setelah ada isinya."
              />
            </div>
          ) : (
            <ul className="mt-4">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-border py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {category.nameId}{' '}
                      <span className="text-muted">· {category.nameEn}</span>
                    </p>
                    <p className="mt-1 truncate text-sm text-muted">
                      /knowledge/category/{category.slug} ·{' '}
                      {category._count.documents} dokumen ·{' '}
                      {category._count.projects} proyek
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/admin/taxonomy?ubah=${category.id}`}
                      className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Ubah
                    </Link>
                    <DeleteButton
                      id={category.id}
                      name={category.nameId}
                      action={deleteCategoryAction}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-surface p-7">
          <h2 className="kicker">Tag</h2>
          <p className="mt-3 text-sm text-muted">
            Tag yang masih menempel di dokumen atau proyek tidak bisa dihapus.
          </p>

          {tags.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Belum ada tag"
                description="Ketik nama tag di form dokumen; yang belum ada akan dibuat otomatis."
              />
            </div>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center gap-2 rounded-full border border-border-med py-1.5 pl-4 pr-2 text-sm"
                >
                  <span>{tag.name}</span>
                  <span className="font-mono text-[11px] text-faint">
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
        </section>
      </div>
    </AdminShell>
  )
}
