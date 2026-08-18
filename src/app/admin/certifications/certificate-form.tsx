'use client'

import type { Certificate } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import {
  DateField,
  ListField,
  StatusField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { saveCertificateAction } from './actions'
import { CertificateImageUpload } from './certificate-image-upload'

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

          <div className="grid gap-6 sm:grid-cols-2">
            <TextAreaField
              name="descriptionId"
              label="Deskripsi (Indonesia)"
              rows={3}
              hint="Satu atau dua kalimat tentang isi kredensialnya. Boleh dikosongkan."
              defaultValue={certificate?.descriptionId}
              error={errors.descriptionId}
            />
            <TextAreaField
              name="descriptionEn"
              label="Deskripsi (Inggris)"
              rows={3}
              hint="Kosongkan bila belum diterjemahkan; halaman /en akan memakai versi Indonesia."
              defaultValue={certificate?.descriptionEn}
              error={errors.descriptionEn}
            />
          </div>

          <TextField
            name="credentialId"
            label="Nomor kredensial"
            hint="Nomor yang tercetak di sertifikat, mis. GOOG-ITS-2025."
            defaultValue={certificate?.credentialId}
            error={errors.credentialId}
          />

          <TextField
            name="credentialUrl"
            label="URL kredensial"
            hint="Tanpa URL ini, sertifikat tetap tampil tapi tanpa tombol verifikasi."
            defaultValue={certificate?.credentialUrl}
            error={errors.credentialUrl}
          />

          <CertificateImageUpload
            certificateId={certificate?.id ?? null}
            imageUrl={certificate?.imageUrl}
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
