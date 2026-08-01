'use client'

import { useState } from 'react'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  ListField,
  SelectField,
  StatusField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import { RichTextEditor } from '@/components/admin/editor'
import {
  DIFFICULTY_LABEL,
  KNOWLEDGE_TYPE_LABEL,
  type KnowledgeTypeValue,
  type PublishStatusValue,
} from '@/lib/schemas/admin'

import { saveDocumentAction } from './actions'

export type DocumentFormValues = {
  id: string
  type: KnowledgeTypeValue
  slug: string
  documentCode: string | null
  version: string
  titleId: string
  titleEn: string | null
  summaryId: string
  summaryEn: string | null
  contentIdJson: unknown
  contentEnJson: unknown
  categoryId: string | null
  tags: string[]
  difficulty: string | null
  estimatedMinutes: number | null
  tools: string[]
  isFeatured: boolean
  sortOrder: number
  status: PublishStatusValue
}

type Props = {
  document: DocumentFormValues | null
  categories: { id: string; nameId: string }[]
}

export function DocumentForm({ document, categories }: Props) {
  // Tipe disimpan di state karena kerangka template yang ditawarkan editor
  // mengikutinya — mengganti tipe di tengah pengisian harus langsung
  // mengubah kerangka yang ditawarkan, bukan menunggu simpan.
  const [type, setType] = useState<KnowledgeTypeValue>(
    document?.type ?? 'SOP',
  )

  const storageBase = document?.id ?? 'baru'

  return (
    <FormShell action={saveDocumentAction} wide>
      {(errors) => (
        <>
          {document ? (
            <input type="hidden" name="id" value={document.id} />
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              name="type"
              label="Tipe dokumen"
              required
              hint="Menentukan rute publiknya: /knowledge/sop, /labs, /incidents, /articles."
              value={type}
              onChange={(value) => setType(value as KnowledgeTypeValue)}
              options={Object.entries(KNOWLEDGE_TYPE_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              error={errors.type}
            />

            <TextField
              name="slug"
              label="Slug"
              required
              hint="Bagian akhir URL. Mengubahnya memutus tautan lama."
              defaultValue={document?.slug}
              error={errors.slug}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="documentCode"
              label="Kode dokumen"
              hint="Opsional, mis. SOP-JAR-001. Harus unik bila diisi."
              defaultValue={document?.documentCode}
              error={errors.documentCode}
            />
            <TextField
              name="version"
              label="Versi"
              hint="Ditampilkan di halaman publik dan dipakai sebagai label revisi."
              defaultValue={document?.version ?? '1.0'}
              error={errors.version}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="titleId"
              label="Judul (Indonesia)"
              required
              defaultValue={document?.titleId}
              error={errors.titleId}
            />
            <TextField
              name="titleEn"
              label="Judul (Inggris)"
              hint="Boleh dikosongkan — halaman EN menampilkan versi Indonesia."
              defaultValue={document?.titleEn}
              error={errors.titleEn}
            />
          </div>

          <TextAreaField
            name="summaryId"
            label="Ringkasan (Indonesia)"
            required
            hint="Tampil di kartu daftar dan di hasil pencarian."
            defaultValue={document?.summaryId}
            error={errors.summaryId}
          />
          <TextAreaField
            name="summaryEn"
            label="Ringkasan (Inggris)"
            defaultValue={document?.summaryEn}
            error={errors.summaryEn}
          />

          <RichTextEditor
            name="contentIdJson"
            label="Isi dokumen (Indonesia)"
            hint="Kerangka bagian bisa diisi otomatis saat editor masih kosong."
            type={type}
            defaultValue={document?.contentIdJson}
            storageKey={`${storageBase}:id`}
            error={errors.contentIdJson}
          />

          <RichTextEditor
            name="contentEnJson"
            label="Isi dokumen (Inggris)"
            hint="Boleh dikosongkan. Halaman EN akan menampilkan versi Indonesia beserta pemberitahuannya."
            type={type}
            defaultValue={document?.contentEnJson}
            storageKey={`${storageBase}:en`}
            error={errors.contentEnJson}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              name="categoryId"
              label="Kategori"
              defaultValue={document?.categoryId ?? ''}
              options={[
                { value: '', label: '— tanpa kategori —' },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.nameId,
                })),
              ]}
              error={errors.categoryId}
            />

            <TextField
              name="tags"
              label="Tag"
              hint="Dipisah koma. Tag baru dibuat otomatis."
              defaultValue={document?.tags.join(', ')}
              error={errors.tags}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              name="difficulty"
              label="Tingkat"
              defaultValue={document?.difficulty ?? ''}
              options={[
                { value: '', label: '— tidak ditentukan —' },
                ...Object.entries(DIFFICULTY_LABEL).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              error={errors.difficulty}
            />

            <TextField
              name="estimatedMinutes"
              label="Perkiraan waktu baca (menit)"
              type="number"
              defaultValue={document?.estimatedMinutes?.toString()}
              error={errors.estimatedMinutes}
            />
          </div>

          <ListField
            name="tools"
            label="Alat yang dipakai"
            defaultValue={document?.tools}
            error={errors.tools}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="sortOrder"
              label="Urutan"
              type="number"
              defaultValue={document?.sortOrder?.toString() ?? '0'}
              error={errors.sortOrder}
            />
            <StatusField defaultValue={document?.status} error={errors.status} />
          </div>

          <CheckboxField
            name="isFeatured"
            label="Tampilkan sebagai dokumen pilihan"
            defaultChecked={document?.isFeatured}
          />

          <TextField
            name="changeSummary"
            label="Catatan perubahan"
            hint="Dipakai sebagai judul revisi saat menyunting dokumen yang sudah terbit."
            error={errors.changeSummary}
          />

          <fieldset className="space-y-3 rounded-3xl border border-warning p-6">
            <legend className="px-2 text-sm font-medium">
              Sebelum menerbitkan
            </legend>
            <p className="text-xs text-muted">
              Wajib dicentang setiap kali menerbitkan, termasuk saat
              menerbitkan ulang. Centangnya tidak disimpan — penerbitan
              berikutnya menuntut pemeriksaan ulang.
            </p>

            <CheckboxField
              name="redactionConfirmed"
              resetOnSuccess
              label="Sudah saya periksa: tidak ada password, token, IP publik, nama instansi tanpa izin, atau konfigurasi produksi di dokumen ini."
            />

            {errors.redactionConfirmed ? (
              <p className="text-sm text-danger">{errors.redactionConfirmed}</p>
            ) : null}
          </fieldset>
        </>
      )}
    </FormShell>
  )
}
