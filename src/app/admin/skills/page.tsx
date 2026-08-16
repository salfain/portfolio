import Link from 'next/link'

import { getAdminSkills } from '@/data/skill'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteSkillAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminSkillsPage() {
  const skills = await getAdminSkills()

  return (
    <AdminShell
      title="Keahlian"
      description="Dikelompokkan per kategori di situs. Level ditulis sebagai kata, tanpa persentase."
      action={
        <Button asChild>
          <Link href="/admin/skills/new">Tambah</Link>
        </Button>
      }
    >
      {skills.length === 0 ? (
        <EmptyState
          title="Belum ada keahlian"
          description="Tambahkan keahlian agar bagian Kemampuan muncul di situs."
        />
      ) : (
        <ul className="space-y-3">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{skill.name}</p>
                  <StatusBadge status={skill.status as PublishStatusValue} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {skill.category}
                  {skill.level ? ` · ${skill.level}` : ''}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/skills/${skill.id}`}
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton
                  id={skill.id}
                  name={skill.name}
                  action={deleteSkillAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
