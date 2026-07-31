import { notFound } from 'next/navigation'

import { getAdminExperienceById, toAchievements } from '@/data/experience'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { AdminShell } from '@/components/admin/admin-shell'

import { ExperienceForm } from '../experience-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditExperiencePage({ params }: PageProps) {
  const { id } = await params
  const experience = await getAdminExperienceById(id)

  if (!experience) notFound()

  return (
    <AdminShell title="Ubah Pengalaman" description={experience.company}>
      <ExperienceForm
        defaults={{
          id: experience.id,
          company: experience.company,
          positionId: experience.positionId,
          positionEn: experience.positionEn,
          summaryId: experience.summaryId,
          summaryEn: experience.summaryEn,
          location: experience.location,
          startDate: experience.startDate,
          endDate: experience.endDate,
          isCurrent: experience.isCurrent,
          // Json → string[] dilakukan di server; helpernya server-only.
          achievementsId: toAchievements(experience.achievementsId),
          achievementsEn: toAchievements(experience.achievementsEn),
          tools: experience.tools,
          sortOrder: experience.sortOrder,
          status: experience.status as PublishStatusValue,
        }}
      />
    </AdminShell>
  )
}
