import { notFound } from 'next/navigation'

import { getAdminSkillById } from '@/data/skill'

import { AdminShell } from '@/components/admin/admin-shell'

import { SkillForm } from '../skill-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditSkillPage({ params }: PageProps) {
  const { id } = await params
  const skill = await getAdminSkillById(id)

  if (!skill) notFound()

  return (
    <AdminShell title="Ubah Keahlian" description={skill.category}>
      <SkillForm skill={skill} />
    </AdminShell>
  )
}
