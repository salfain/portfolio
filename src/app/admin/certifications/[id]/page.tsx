import { notFound } from 'next/navigation'

import { getAdminCertificateById } from '@/data/certificate'

import { AdminShell } from '@/components/admin/admin-shell'

import { CertificateForm } from '../certificate-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditCertificatePage({ params }: PageProps) {
  const { id } = await params
  const certificate = await getAdminCertificateById(id)

  if (!certificate) notFound()

  return (
    <AdminShell title="Ubah Sertifikat" description={certificate.issuer}>
      <CertificateForm certificate={certificate} />
    </AdminShell>
  )
}
