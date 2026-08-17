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
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-col rounded-3xl border border-border bg-surface p-6"
            >
              {/* Pratinjau gambar didahulukan: sertifikat dibedakan dari
                  rupanya, dan tanpa pratinjau di sini satu-satunya cara
                  memastikan berkasnya benar adalah membuka form ubah. */}
              {certificate.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={certificate.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="mb-5 aspect-[4/3] w-full rounded-xl border border-border bg-background object-contain"
                />
              ) : (
                <div className="stripe-placeholder mb-5 grid aspect-[4/3] w-full place-items-center rounded-xl border border-dashed border-border">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                    Tanpa gambar
                  </span>
                </div>
              )}

              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                {certificate.issuer}
              </p>
              <p className="mt-2 font-medium leading-snug">
                {certificate.name}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={certificate.status as PublishStatusValue}
                />
                {!certificate.credentialUrl ? (
                  <span className="rounded-full border border-border-med px-2.5 py-1 font-mono text-[11px] text-muted">
                    Tanpa kredensial
                  </span>
                ) : null}
              </div>

              <div className="mt-auto flex items-center gap-3 pt-6">
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

          {/* Kartu unggah menutup grid, sejajar dengan kartu lain — bukan
              hanya tombol di kepala halaman yang jauh dari isinya. */}
          <li>
            <Link
              href="/admin/certifications/new"
              className="grid h-full min-h-[220px] place-items-center rounded-3xl border border-dashed border-border p-6 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-border-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              + Unggah sertifikat baru
            </Link>
          </li>
        </ul>
      )}
    </AdminShell>
  )
}
