import { AdminShell } from '@/components/admin/admin-shell'

import { CertificateForm } from '../certificate-form'

export const dynamic = 'force-dynamic'

export default function NewCertificatePage() {
  return (
    <AdminShell title="Tambah Sertifikat">
      <CertificateForm certificate={null} />
    </AdminShell>
  )
}
