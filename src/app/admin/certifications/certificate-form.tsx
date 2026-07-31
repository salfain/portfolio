'use client'

import type { Certificate } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import {
  DateField,
  ListField,
  StatusField,
  TextField,
} from '@/components/admin/form-fields'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { saveCertificateAction } from './actions'

export function CertificateForm({
  certificate,
}: {
  certificate: Certificate | null
}) {
  return (
    <FormShell action={saveCertificateAction}>
      {(errors) => (
        <>
          {certificate ? (
            <input type="hidden" name="id" value={certificate.id} />
          ) : null}

          <TextField
            name="name"
            label="Nama sertifikat"
            required
            defaultValue={certificate?.name}
            error={errors.name}
          />

          <TextField
            name="issuer"
            label="Penerbit"
            required
            defaultValue={certificate?.issuer}
            error={errors.issuer}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <DateField
              name="issueDate"
              label="Tanggal terbit"
              defaultValue={certificate?.issueDate}
              error={errors.issueDate}
            />
            <DateField
              name="expiryDate"
              label="Tanggal kedaluwarsa"
              hint="Kosongkan bila tidak kedaluwarsa."
              defaultValue={certificate?.expiryDate}
              error={errors.expiryDate}
            />
          </div>

          <TextField
            name="credentialUrl"
            label="URL kredensial"
            hint="Tanpa URL ini, sertifikat tetap tampil tapi tanpa tombol verifikasi."
            defaultValue={certificate?.credentialUrl}
            error={errors.credentialUrl}
          />

          <ListField
            name="skills"
            label="Keahlian terkait"
            defaultValue={certificate?.skills}
            error={errors.skills}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="sortOrder"
              type="number"
              label="Urutan"
              defaultValue={String(certificate?.sortOrder ?? 0)}
              error={errors.sortOrder}
            />
            <StatusField
              defaultValue={
                (certificate?.status as PublishStatusValue) ?? 'DRAFT'
              }
              error={errors.status}
            />
          </div>
        </>
      )}
    </FormShell>
  )
}
