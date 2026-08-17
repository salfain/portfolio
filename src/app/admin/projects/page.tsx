import Link from 'next/link'

import { getAdminProjects } from '@/data/project'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from '@/components/admin/admin-table'

import { deleteProjectAction } from './actions'

export const dynamic = 'force-dynamic'

const COLUMNS = ['Proyek', 'Status', 'Aksi']
const TEMPLATE = 'minmax(0,1fr) minmax(0,auto) 160px'

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
        <AdminTable columns={COLUMNS} template={TEMPLATE}>
          {projects.map((project) => (
            <AdminTableRow key={project.id} template={TEMPLATE}>
              <AdminTableCell>
                <p className="truncate font-medium">{project.titleId}</p>
                <p className="mt-1 truncate font-mono text-xs text-faint">
                  /{project.slug}
                </p>
              </AdminTableCell>

              <AdminTableCell className="flex flex-wrap items-center gap-2">
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
              </AdminTableCell>

              <AdminTableCell className="flex items-center gap-3 md:justify-end">
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
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </AdminShell>
  )
}
