'use client'

import { useState } from 'react'
import type { KnowledgeType } from '@prisma/client'

import { cn } from '@/lib/cn'
import { assignHeadingIds } from '@/lib/prosemirror/headings'
import type { ProseMirrorDocument } from '@/lib/prosemirror/types'
import {
  missingSections,
  templateFor,
} from '@/lib/schemas/document-templates'
import type { PublishStatusValue } from '@/lib/schemas/admin'

import { FormShell } from '@/components/admin/form-shell'
import {
  CheckboxField,
  ListField,
  StatusField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-fields'
import { RichTextEditor } from '@/components/admin/editor'

import { saveDocumentAction } from './actions'

export type DocumentDefaults = {
  id: string | null
  type: KnowledgeType
  status: PublishStatusValue
  slug: string
  documentCode: string | null
  version: string
  titleId: string
  titleEn: string | null
  summaryId: string
  summaryEn: string | null
  contentIdJson: ProseMirrorDocument | null
  contentEnJson: ProseMirrorDocument | null
  difficulty: string | null
  estimatedMinutes: number | null
  tools: string[]
  tagNames: string[]
  categoryId: string | null
  isFeatured: boolean
  sortOrder: number
  wasPublished: boolean
}

const TYPE_LABELS: Record<KnowledgeType, string> = {
  SOP: 'SOP',
  LAB: 'Lab PNETLab',
  INCIDENT: 'Laporan insiden',
  ARTICLE: 'Artikel teknis',
}

export function DocumentForm({
  defaults,
  categories,
}: {
  defaults: DocumentDefaults
  categories: { id: string; label: string }[]
}) {
  const [type, setType] = useState<KnowledgeType>(defaults.type)
  const [missing, setMissing] = useState<string[]>([])

  // Dokumen baru dimulai dari kerangka blok wajib tipenya. Yang disisipkan
  // hanya JUDUL bagian — isinya tetap ditulis pemilik.
  const initialContent =
    defaults.contentIdJson ?? (defaults.id ? null : templateFor(defaults.type))

  const selectClass = cn(
    'w-full rounded-xl border border-border bg-surface px-4 py-2.5',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  )

  function checkSections(doc: ProseMirrorDocument) {
    setMissing(
      missingSections(
        type,
        assignHeadingIds(doc).map((heading) => heading.text),
      ),
    )
  }

  return (
    <FormShell action={saveDocumentAction}>
      {(errors) => (
        <>
          {defaults.id ? (
            <input type="hidden" name="id" value={defaults.id} />
          ) : null}
          <input
            type="hidden"
            name="wasPublished"
            value={defaults.wasPublished ? 'on' : ''}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Tipe dokumen <span aria-hidden>*</span>
              </label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as KnowledgeType)
                }
                // Tipe menentukan blok wajib dan rute publiknya, jadi
                // mengubahnya setelah terbit memindahkan URL dokumen.
                disabled={defaults.wasPublished}
                className={cn(selectClass, 'mt-2 disabled:opacity-60')}
              >
                {(Object.keys(TYPE_LABELS) as KnowledgeType[]).map((value) => (
                  <option key={value} value={value}>
                    {TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
              {defaults.wasPublished ? (
                <p className="mt-1 text-xs text-muted">
                  Tidak bisa diubah — dokumen sudah terbit dan URL-nya sudah
                  mengandung tipe ini.
                </p>
              ) : null}
            </div>

            <StatusField
              defaultValue={defaults.status}
              error={errors.status}
            />
          </div>

          <TextField
            name="slug"
            label="Slug"
            required
            hint="Bagian akhir URL. Mengubahnya setelah terbit memutus tautan lama."
            defaultValue={defaults.slug}
            error={errors.slug}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="documentCode"
              label="Kode dokumen"
              hint="Format HURUF-ANGKA, mis. SOP-002. Boleh dikosongkan."
              defaultValue={defaults.documentCode}
              error={errors.documentCode}
            />
            <TextField
              name="version"
              label="Versi"
              hint="Naikkan saat isi berubah berarti, mis. 1.0 → 1.1."
              defaultValue={defaults.version}
              error={errors.version}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="titleId"
              label="Judul (Indonesia)"
              required
              defaultValue={defaults.titleId}
              error={errors.titleId}
            />
            <TextField
              name="titleEn"
              label="Judul (Inggris)"
              hint="Boleh kosong — halaman /en memakai versi Indonesia."
              defaultValue={defaults.titleEn}
              error={errors.titleEn}
            />
          </div>

          <TextAreaField
            name="summaryId"
            label="Ringkasan (Indonesia)"
            required
            defaultValue={defaults.summaryId}
            error={errors.summaryId}
          />
          <TextAreaField
            name="summaryEn"
            label="Ringkasan (Inggris)"
            defaultValue={defaults.summaryEn}
            error={errors.summaryEn}
          />

          <div>
            <label className="block text-sm font-medium">
              Isi dokumen (Indonesia) <span aria-hidden>*</span>
            </label>
            <p className="mt-1 text-xs text-muted">
              Blok wajib untuk {TYPE_LABELS[type]} sudah disiapkan sebagai
              judul kosong. Hapus yang tidak berlaku.
            </p>

            {missing.length > 0 ? (
              <p className="mt-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2 text-xs">
                Blok wajib yang belum ada: {missing.join(', ')}. Ini
                peringatan, bukan penghalang — tetap bisa disimpan.
              </p>
            ) : null}

            <div className="mt-3">
              <RichTextEditor
                name="contentIdJson"
                initialContent={initialContent}
                placeholder="Tulis isi dokumen…"
                onDocChange={checkSections}
              />
            </div>

            {errors.contentIdJson ? (
              <p className="mt-2 text-sm text-danger">{errors.contentIdJson}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Isi dokumen (Inggris)
            </label>
            <p className="mt-1 text-xs text-muted">
              Kosongkan bila belum diterjemahkan — halaman /en akan memakai
              isi Indonesia beserta penanda terjemahan.
            </p>

            <div className="mt-3">
              <RichTextEditor
                name="contentEnJson"
                initialContent={defaults.contentEnJson}
                placeholder="Leave empty if not translated yet…"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium">
                Kategori
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={defaults.categoryId ?? ''}
                className={cn(selectClass, 'mt-2')}
              >
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium">
                Tingkat
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={defaults.difficulty ?? ''}
                className={cn(selectClass, 'mt-2')}
              >
                <option value="">Tidak ditentukan</option>
                <option value="BEGINNER">Dasar</option>
                <option value="INTERMEDIATE">Menengah</option>
                <option value="ADVANCED">Mahir</option>
              </select>
            </div>
          </div>

          <ListField
            name="tagNames"
            label="Tag"
            hint="Satu tag per baris, huruf kecil dan tanda hubung saja. Tag baru dibuat otomatis."
            defaultValue={defaults.tagNames}
            error={errors.tagNames}
          />

          <ListField
            name="tools"
            label="Alat yang dipakai"
            defaultValue={defaults.tools}
            error={errors.tools}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="estimatedMinutes"
              type="number"
              label="Perkiraan waktu baca (menit)"
              defaultValue={
                defaults.estimatedMinutes === null
                  ? ''
                  : String(defaults.estimatedMinutes)
              }
              error={errors.estimatedMinutes}
            />
            <TextField
              name="sortOrder"
              type="number"
              label="Urutan"
              defaultValue={String(defaults.sortOrder)}
              error={errors.sortOrder}
            />
          </div>

          <CheckboxField
            name="isFeatured"
            label="Tandai sebagai unggulan"
            defaultChecked={defaults.isFeatured}
          />

          {defaults.wasPublished ? (
            <TextAreaField
              name="changeSummary"
              label="Apa yang berubah?"
              required
              rows={2}
              hint="Wajib karena dokumen ini sudah terbit. Tersimpan sebagai satu entri di riwayat revisi."
              error={errors.changeSummary}
            />
          ) : null}
        </>
      )}
    </FormShell>
  )
}
