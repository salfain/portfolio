'use client'

import { FormShell } from '@/components/admin/form-shell'
import { TextField } from '@/components/admin/form-fields'

import { saveTagAction } from './actions'

export function TagForm() {
  return (
    <FormShell action={saveTagAction} submitLabel="Tambah tag">
      {(errors) => (
        <TextField
          name="name"
          label="Nama tag"
          required
          hint="Huruf kecil, angka, dan tanda hubung. Tidak diterjemahkan — istilah teknis sama di kedua bahasa."
          error={errors.name}
        />
      )}
    </FormShell>
  )
}
