import Link from 'next/link'

import { getAdminExperiences } from '@/data/experience'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteExperienceAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencesPage() {
  const experiences = await getAdminExperiences()

  return (
    <AdminShell
      title="Pengalaman"
      description="Riwayat kerja. Wajib lengkap di kedua bahasa."
      action={
        <Button asChild>
          <Link href="/admin/experiences/new">Tambah</Link>
        </Button>
      }
    >
      {experiences.length === 0 ? (
        <EmptyState
          title="Belum ada entri"
          description="Tambahkan riwayat kerja agar bagian Pengalaman muncul di situs."
        />
      ) : (
        <ul className="space-y-3">
          {experiences.map((experience) => (
            <li
              key={experience.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{experience.positionId}</p>
                  <StatusBadge
                    status={experience.status as PublishStatusValue}
                  />
                </div>
                <p className="mt-1 text-sm text-muted">{experience.company}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/experiences/${experience.id}`}
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton
                  id={experience.id}
                  name={experience.positionId}
                  action={deleteExperienceAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
