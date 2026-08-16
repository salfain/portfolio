import Link from 'next/link'

import { getAdminProjects } from '@/data/project'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteProjectAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects()

  return (
    <AdminShell
      title="Proyek"
      description="Studi kasus. Hanya proyek Terbit yang punya halaman publik."
      action={
        <Button asChild>
          <Link href="/admin/projects/new">Tambah</Link>
        </Button>
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          title="Belum ada proyek"
          description="Tambahkan proyek agar bagian Pekerjaan Pilihan muncul di beranda."
        />
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{project.titleId}</p>
                  <StatusBadge status={project.status as PublishStatusValue} />
                  {project.isFeatured ? (
                    <span className="rounded-full border border-border-med px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      Pilihan
                    </span>
                  ) : null}
                  {!project.titleEn ? (
                    <span className="rounded-full border border-border-med px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      ID saja
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-muted">
                  /{project.slug}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton
                  id={project.id}
                  name={project.titleId}
                  action={deleteProjectAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
