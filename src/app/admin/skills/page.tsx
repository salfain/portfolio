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

  /**
   * Dikelompokkan di sini, bukan lewat `groupSkillsByCategory`: helper itu
   * bertipe `PublicSkill[]` dan sengaja tidak memuat `status`, sedangkan
   * daftar admin justru harus menampilkan draf. Melebarkan tipe helper
   * publik hanya demi halaman admin akan membuka jalan bagi kolom admin
   * bocor ke rute publik.
   */
  const groups = Array.from(
    skills
      .reduce((map, skill) => {
        const existing = map.get(skill.category)

        if (existing) existing.push(skill)
        else map.set(skill.category, [skill])

        return map
      }, new Map<string, typeof skills>())
      .entries(),
    ([category, items]) => ({ category, skills: items }),
  )

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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <section
              key={group.category}
              className="rounded-3xl border border-border bg-surface p-7"
            >
              <h2 className="kicker text-primary">{group.category}</h2>

              <ul className="mt-5 flex flex-col">
                {group.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="text-[15px]">{skill.name}</span>
                      {skill.level ? (
                        <span className="rounded-full border border-border-med px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                          {skill.level}
                        </span>
                      ) : null}
                      <StatusBadge
                        status={skill.status as PublishStatusValue}
                      />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
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
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
