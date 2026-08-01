'use client'

import type { MediaAsset } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import { DeleteButton } from '@/components/admin/delete-button'
import { MEDIA_KIND_LABEL, type MediaKindValue } from '@/lib/schemas/media'
import { ALLOWED_MIMES, MAX_UPLOAD_BYTES } from '@/lib/media-file'

import {
  deleteMediaAction,
  updateMediaAction,
  uploadMediaAction,
} from './actions'

const KIND_OPTIONS = Object.entries(MEDIA_KIND_LABEL).map(([value, label]) => ({
  value,
  label,
}))

export function MediaUploadForm({ documentId }: { documentId: string }) {
  return (
    <FormShell action={uploadMediaAction} submitLabel="Unggah">
      {(errors) => (
        <>
          <input type="hidden" name="documentId" value={documentId} />

          <div>
            <label htmlFor="file" className="block text-sm font-medium">
              Berkas <span aria-hidden>*</span>
            </label>
            <p className="mt-1 text-xs text-muted">
              Maksimal {MAX_UPLOAD_BYTES / 1024 / 1024} MB. Jenis yang diterima:{' '}
              {ALLOWED_MIMES.join(', ')}. Jenis berkas ditentukan dari isinya,
              bukan dari namanya.
            </p>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept={ALLOWED_MIMES.join(',')}
              className="mt-2 block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-elevated file:px-4 file:py-2 file:text-sm file:text-foreground"
            />
          </div>

          <SelectField
            name="kind"
            label="Jenis bukti"
            required
            defaultValue="SCREENSHOT"
            options={KIND_OPTIONS}
            error={errors.kind}
          />

          <TextField
            name="altId"
            label="Alt text (Indonesia)"
            required
            hint="Jelaskan apa yang terlihat. Ini satu-satunya yang dibaca pembaca layar."
            error={errors.altId}
          />
          <TextField
            name="altEn"
            label="Alt text (Inggris)"
            error={errors.altEn}
          />

          <TextField
            name="tool"
            label="Alat yang dipakai"
            hint="Mis. PNETLab, Wireshark. Opsional."
            error={errors.tool}
          />

          <TextAreaField
            name="sourceNote"
            label="Catatan redaksi"
            rows={2}
            hint="Apa yang disunting atau disamarkan dari berkas asli."
            error={errors.sourceNote}
          />

          <p className="rounded-xl border border-border bg-elevated px-4 py-3 text-xs text-muted">
            Berkas yang baru diunggah selalu <strong>privat</strong>. Ia tidak
            muncul di halaman publik dan alamatnya membalas 404 bagi siapa pun
            yang tidak masuk sebagai admin, sampai kamu menerbitkannya lewat
            daftar di bawah.
          </p>
        </>
      )}
    </FormShell>
  )
}

export function MediaEditForm({
  asset,
  documentId,
}: {
  asset: MediaAsset
  documentId: string
}) {
  return (
    <FormShell action={updateMediaAction} submitLabel="Simpan bukti">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={asset.id} />
          <input type="hidden" name="documentId" value={documentId} />

          <SelectField
            name="kind"
            label="Jenis bukti"
            required
            defaultValue={asset.kind as MediaKindValue}
            options={KIND_OPTIONS}
            error={errors.kind}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="altId"
              label="Alt text (Indonesia)"
              required
              defaultValue={asset.altId}
              error={errors.altId}
            />
            <TextField
              name="altEn"
              label="Alt text (Inggris)"
              defaultValue={asset.altEn}
              error={errors.altEn}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="titleId"
              label="Judul (Indonesia)"
              defaultValue={asset.titleId}
              error={errors.titleId}
            />
            <TextField
              name="titleEn"
              label="Judul (Inggris)"
              defaultValue={asset.titleEn}
              error={errors.titleEn}
            />
          </div>

          <TextAreaField
            name="captionId"
            label="Keterangan (Indonesia)"
            rows={2}
            defaultValue={asset.captionId}
            error={errors.captionId}
          />
          <TextAreaField
            name="captionEn"
            label="Keterangan (Inggris)"
            rows={2}
            defaultValue={asset.captionEn}
            error={errors.captionEn}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="tool"
              label="Alat yang dipakai"
              defaultValue={asset.tool}
              error={errors.tool}
            />
            <TextField
              name="sortOrder"
              label="Urutan"
              type="number"
              defaultValue={asset.sortOrder.toString()}
              error={errors.sortOrder}
            />
          </div>

          <TextAreaField
            name="sourceNote"
            label="Catatan redaksi"
            rows={2}
            defaultValue={asset.sourceNote}
            error={errors.sourceNote}
          />

          <CheckboxField
            name="isCover"
            label="Jadikan sampul dokumen"
            defaultChecked={asset.isCover}
          />

          <fieldset className="space-y-3 rounded-3xl border border-warning p-6">
            <legend className="px-2 text-sm font-medium">
              Menerbitkan bukti ini
            </legend>
            <p className="text-xs text-muted">
              Bukti yang diterbitkan bisa dibuka siapa pun yang punya
              alamatnya, termasuk sebelum dokumennya sendiri terbit.
            </p>

            <CheckboxField
              name="redactionConfirmed"
              label="Sudah saya periksa: tidak ada nama instansi, alamat IP publik, nama pengguna, atau data pribadi yang terbaca di berkas ini."
              defaultChecked={asset.redactionConfirmed}
            />

            <CheckboxField
              name="isPublic"
              label="Tampilkan di halaman publik"
              defaultChecked={asset.isPublic}
            />

            {errors.redactionConfirmed ? (
              <p className="text-sm text-danger">{errors.redactionConfirmed}</p>
            ) : null}
          </fieldset>

          <DeleteButton id={asset.id} action={deleteMediaAction} />
        </>
      )}
    </FormShell>
  )
}
