import { AdminShell } from '@/components/admin/admin-shell'

import { ProjectForm } from '../project-form'

export const dynamic = 'force-dynamic'

export default function NewProjectPage() {
  return (
    <AdminShell title="Tambah Proyek">
      <ProjectForm project={null} />
    </AdminShell>
  )
}
