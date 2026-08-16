import Link from 'next/link'

import { getAdminCertificates } from '@/data/certificate'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { Button, EmptyState } from '@/components/ui'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'

import { deleteCertificateAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminCertificatesPage() {
  const certificates = await getAdminCertificates()

  return (
    <AdminShell
      title="Sertifikat"
      description="Hanya sertifikat yang benar-benar dimiliki. Tanpa URL kredensial, tombol verifikasi tidak muncul."
      action={
        <Button asChild>
          <Link href="/admin/certifications/new">Tambah</Link>
        </Button>
      }
    >
      {certificates.length === 0 ? (
        <EmptyState
          title="Belum ada sertifikat"
          description="Tambahkan sertifikat agar bagian Sertifikasi muncul di situs."
        />
      ) : (
        <ul className="space-y-3">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{certificate.name}</p>
                  <StatusBadge
                    status={certificate.status as PublishStatusValue}
                  />
                  {!certificate.credentialUrl ? (
                    <span className="rounded-full border border-border-med px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      Tanpa kredensial
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{certificate.issuer}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/certifications/${certificate.id}`}
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ubah
                </Link>
                <DeleteButton
                  id={certificate.id}
                  name={certificate.name}
                  action={deleteCertificateAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
