import { AdminShell } from '@/components/admin/admin-shell'

import { ExperienceForm, type ExperienceDefaults } from '../experience-form'

export const dynamic = 'force-dynamic'

const blank: ExperienceDefaults = {
  id: null,
  company: '',
  positionId: '',
  positionEn: '',
  summaryId: '',
  summaryEn: '',
  location: null,
  startDate: null,
  endDate: null,
  isCurrent: false,
  achievementsId: [],
  achievementsEn: [],
  tools: [],
  sortOrder: 0,
  status: 'DRAFT',
}

export default function NewExperiencePage() {
  return (
    <AdminShell title="Tambah Pengalaman">
      <ExperienceForm defaults={blank} />
    </AdminShell>
  )
}
