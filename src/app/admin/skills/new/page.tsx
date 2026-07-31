import { AdminShell } from '@/components/admin/admin-shell'

import { SkillForm } from '../skill-form'

export const dynamic = 'force-dynamic'

export default function NewSkillPage() {
  return (
    <AdminShell title="Tambah Keahlian">
      <SkillForm skill={null} />
    </AdminShell>
  )
}
