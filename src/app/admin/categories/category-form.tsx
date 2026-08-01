'use client'

import { FormShell } from '@/components/admin/form-shell'
import { TextAreaField, TextField } from '@/components/admin/form-fields'

import { saveCategoryAction } from './actions'

export type CategoryDefaults = {
  id: string | null
  slug: string
  nameId: string
  nameEn: string
  descriptionId: string | null
  descriptionEn: string | null
  sortOrder: number
}

export function CategoryForm({ defaults }: { defaults: CategoryDefaults }) {
  return (
    <FormShell action={saveCategoryAction}>
      {(errors) => (
        <>
          {defaults.id ? (
            <input type="hidden" name="id" value={defaults.id} />
          ) : null}

          <TextField
            name="slug"
            label="Slug"
            required
            hint="Dipakai di URL /knowledge/category/…"
            defaultValue={defaults.slug}
            error={errors.slug}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="nameId"
              label="Nama (Indonesia)"
              required
              defaultValue={defaults.nameId}
              error={errors.nameId}
            />
            <TextField
              name="nameEn"
              label="Nama (Inggris)"
              required
              hint="Wajib — kategori tampil di navigasi kedua bahasa."
              defaultValue={defaults.nameEn}
              error={errors.nameEn}
            />
          </div>

          <TextAreaField
            name="descriptionId"
            label="Deskripsi (Indonesia)"
            rows={2}
            defaultValue={defaults.descriptionId}
            error={errors.descriptionId}
          />
          <TextAreaField
            name="descriptionEn"
            label="Deskripsi (Inggris)"
            rows={2}
            defaultValue={defaults.descriptionEn}
            error={errors.descriptionEn}
          />

          <TextField
            name="sortOrder"
            type="number"
            label="Urutan"
            defaultValue={String(defaults.sortOrder)}
            error={errors.sortOrder}
          />
        </>
      )}
    </FormShell>
  )
}
