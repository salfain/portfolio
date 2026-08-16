'use client'

import type { KnowledgeCategory } from '@prisma/client'

import { FormShell } from '@/components/admin/form-shell'
import { TextAreaField, TextField } from '@/components/admin/form-fields'

import { saveCategoryAction } from './actions'

export function CategoryForm({
  category,
}: {
  category: KnowledgeCategory | null
}) {
  return (
    <FormShell action={saveCategoryAction} submitLabel="Simpan kategori">
      {(errors) => (
        <>
          {category ? (
            <input type="hidden" name="id" value={category.id} />
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="nameId"
              label="Nama (Indonesia)"
              required
              defaultValue={category?.nameId}
              error={errors.nameId}
            />
            <TextField
              name="nameEn"
              label="Nama (Inggris)"
              required
              hint="Wajib — kategori muncul di navigasi kedua bahasa."
              defaultValue={category?.nameEn}
              error={errors.nameEn}
            />
          </div>

          <TextField
            name="slug"
            label="Slug"
            required
            hint="Dipakai di URL /knowledge/category/…"
            defaultValue={category?.slug}
            error={errors.slug}
          />

          <TextAreaField
            name="descriptionId"
            label="Deskripsi (Indonesia)"
            rows={3}
            defaultValue={category?.descriptionId}
            error={errors.descriptionId}
          />
          <TextAreaField
            name="descriptionEn"
            label="Deskripsi (Inggris)"
            rows={3}
            defaultValue={category?.descriptionEn}
            error={errors.descriptionEn}
          />

          <TextField
            name="sortOrder"
            label="Urutan"
            type="number"
            defaultValue={category?.sortOrder?.toString() ?? '0'}
            error={errors.sortOrder}
          />
        </>
      )}
    </FormShell>
  )
}
