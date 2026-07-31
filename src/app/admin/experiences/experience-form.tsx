'use client'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  DateField,
  ListField,
  StatusField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { saveExperienceAction } from './actions'

/**
 * Bentuk data yang sudah diratakan di Server Component.
 *
 * `achievements*` disimpan sebagai `Json` di database; konversinya ke
 * `string[]` dilakukan di server karena `toAchievements` ada di modul
 * `server-only` dan tidak boleh ikut ke bundel klien.
 */
export type ExperienceDefaults = {
  id: string | null
  company: string
  positionId: string
  positionEn: string
  summaryId: string
  summaryEn: string
  location: string | null
  startDate: Date | null
  endDate: Date | null
  isCurrent: boolean
  achievementsId: string[]
  achievementsEn: string[]
  tools: string[]
  sortOrder: number
  status: PublishStatusValue
}

export function ExperienceForm({ defaults }: { defaults: ExperienceDefaults }) {
  return (
    <FormShell action={saveExperienceAction}>
      {(errors) => (
        <>
          {defaults.id ? (
            <input type="hidden" name="id" value={defaults.id} />
          ) : null}

          <TextField
            name="company"
            label="Nama instansi"
            required
            hint="Pastikan namanya boleh disebut publik. Kalau ragu, pakai deskripsi generik."
            defaultValue={defaults.company}
            error={errors.company}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="positionId"
              label="Jabatan (Indonesia)"
              required
              defaultValue={defaults.positionId}
              error={errors.positionId}
            />
            <TextField
              name="positionEn"
              label="Jabatan (Inggris)"
              required
              defaultValue={defaults.positionEn}
              error={errors.positionEn}
            />
          </div>

          <TextAreaField
            name="summaryId"
            label="Ringkasan tanggung jawab (Indonesia)"
            required
            defaultValue={defaults.summaryId}
            error={errors.summaryId}
          />
          <TextAreaField
            name="summaryEn"
            label="Ringkasan tanggung jawab (Inggris)"
            required
            defaultValue={defaults.summaryEn}
            error={errors.summaryEn}
          />

          <TextField
            name="location"
            label="Lokasi"
            defaultValue={defaults.location}
            error={errors.location}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <DateField
              name="startDate"
              label="Tanggal mulai"
              required
              defaultValue={defaults.startDate}
              error={errors.startDate}
            />
            <DateField
              name="endDate"
              label="Tanggal selesai"
              hint="Kosongkan bila masih berjalan."
              defaultValue={defaults.endDate}
              error={errors.endDate}
            />
          </div>

          <CheckboxField
            name="isCurrent"
            label="Masih berjalan"
            hint='Ditampilkan sebagai "Sekarang" di situs.'
            defaultChecked={defaults.isCurrent}
          />

          <ListField
            name="achievementsId"
            label="Pencapaian (Indonesia)"
            hint="Satu poin per baris. Tanpa angka yang tidak bisa dibuktikan."
            defaultValue={defaults.achievementsId}
            error={errors.achievementsId}
          />
          <ListField
            name="achievementsEn"
            label="Pencapaian (Inggris)"
            defaultValue={defaults.achievementsEn}
            error={errors.achievementsEn}
          />

          <ListField
            name="tools"
            label="Alat yang dipakai"
            hint="Satu alat per baris. Hanya yang benar-benar dipakai."
            defaultValue={defaults.tools}
            error={errors.tools}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="sortOrder"
              type="number"
              label="Urutan"
              hint="Angka kecil tampil lebih dulu."
              defaultValue={String(defaults.sortOrder)}
              error={errors.sortOrder}
            />
            <StatusField defaultValue={defaults.status} error={errors.status} />
          </div>
        </>
      )}
    </FormShell>
  )
}
