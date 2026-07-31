import { notFound } from 'next/navigation'

import { getAdminProjectById } from '@/data/project'

import { AdminShell } from '@/components/admin/admin-shell'

import { ProjectForm } from '../project-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = await getAdminProjectById(id)

  if (!project) notFound()

  return (
    <AdminShell title="Ubah Proyek" description={`/${project.slug}`}>
      <ProjectForm project={project} />
    </AdminShell>
  )
}
