import { z } from 'zod'

import { documentSchema } from '@/lib/prosemirror/types'
import { publishStatusSchema } from '@/lib/schemas/admin'

/**
 * Skema form dokumen Knowledge Base.
 *
 * Isi dokumen datang sebagai STRING JSON dari `<input type="hidden">` yang
 * diisi editor. Divalidasi ulang di server dengan skema ProseMirror yang
 * sama dengan yang dipakai renderer — klien tidak pernah dipercaya, dan
 * JSON rusak yang lolos ke database akan membuat halaman publiknya kosong.
 */

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
    z.string().max(max).nullable(),
  )

const lines = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
  z.array(z.string().max(120)).max(50),
)

const checkbox = z.preprocess(
  (value) => value === 'on' || value === true,
  z.boolean(),
)

/** String JSON → dokumen ProseMirror tervalidasi. */
const documentJson = z.preprocess((value) => {
  if (typeof value !== 'string' || value.trim() === '') return undefined

  try {
    return JSON.parse(value)
  } catch {
    // Dikembalikan apa adanya supaya documentSchema yang menolaknya
    // dengan pesan yang jelas, bukan melempar SyntaxError mentah.
    return value
  }
}, documentSchema)

/** Versi opsional — dipakai untuk isi bahasa Inggris yang boleh kosong. */
const optionalDocumentJson = z.preprocess((value) => {
  if (typeof value !== 'string' || value.trim() === '') return null

  try {
    const parsed = JSON.parse(value)

    // Dokumen kosong dianggap belum diterjemahkan, bukan terjemahan kosong.
    // Kalau tidak, halaman /en menampilkan artikel kosong alih-alih
    // memakai fallback bahasa Indonesia.
    if (
      parsed &&
      typeof parsed === 'object' &&
      (!('content' in parsed) ||
        !Array.isArray(parsed.content) ||
        parsed.content.length === 0)
    ) {
      return null
    }

    return parsed
  } catch {
    return value
  }
}, documentSchema.nullable())

export const knowledgeDocumentSchema = z
  .object({
    id: optionalText(40),
    type: z.enum(['SOP', 'LAB', 'INCIDENT', 'ARTICLE']),
    status: publishStatusSchema,

    slug: z
      .string()
      .trim()
      .min(3, 'Slug minimal 3 karakter.')
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug hanya boleh huruf kecil, angka, dan tanda hubung.',
      ),

    documentCode: z.preprocess(
      (value) =>
        typeof value === 'string' && value.trim() !== ''
          ? value.trim().toUpperCase()
          : null,
      z
        .string()
        .max(40)
        .regex(
          /^[A-Z]+-[0-9]+$/,
          'Format kode dokumen: HURUF-ANGKA, mis. SOP-002.',
        )
        .nullable(),
    ),

    version: z
      .string()
      .trim()
      .max(20)
      .regex(/^\d+\.\d+$/, 'Format versi: angka.angka, mis. 1.0.')
      .default('1.0'),

    titleId: z.string().trim().min(3, 'Judul (ID) wajib diisi.').max(200),
    titleEn: optionalText(200),
    summaryId: z
      .string()
      .trim()
      .min(20, 'Ringkasan (ID) minimal 20 karakter.')
      .max(1000),
    summaryEn: optionalText(1000),

    contentIdJson: documentJson,
    contentEnJson: optionalDocumentJson,

    difficulty: z.preprocess(
      (value) => (value === '' ? null : value),
      z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
    ),

    estimatedMinutes: z.preprocess(
      (value) => (value === '' || value === undefined ? null : Number(value)),
      z.number().int().min(1).max(600).nullable(),
    ),

    tools: lines,
    tagNames: lines,

    categoryId: optionalText(40),
    isFeatured: checkbox,
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),

    /**
     * Ringkasan perubahan untuk riwayat revisi.
     *
     * Wajib hanya bila menyunting dokumen yang SUDAH terbit — revisi tanpa
     * keterangan menghasilkan riwayat yang tidak menjelaskan apa pun.
     */
    changeSummary: optionalText(300),
    /** Diisi form dari status dokumen di database sebelum disunting. */
    wasPublished: checkbox,
  })
  .refine(
    (data) => !data.wasPublished || (data.changeSummary?.length ?? 0) >= 5,
    {
      message: 'Dokumen ini sudah terbit — jelaskan singkat apa yang berubah.',
      path: ['changeSummary'],
    },
  )
  .refine(
    (data) =>
      data.status !== 'PUBLISHED' ||
      (data.contentIdJson.content?.length ?? 0) > 0,
    {
      message: 'Isi bahasa Indonesia tidak boleh kosong saat menerbitkan.',
      path: ['contentIdJson'],
    },
  )

export type KnowledgeDocumentInput = z.infer<typeof knowledgeDocumentSchema>

// ─── Kategori & tag ──────────────────────────────────────

export const categorySchema = z.object({
  id: optionalText(40),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug hanya huruf kecil, angka, tanda hubung.',
    ),
  nameId: z.string().trim().min(2, 'Nama (ID) wajib diisi.').max(120),
  nameEn: z.string().trim().min(2, 'Nama (EN) wajib diisi.').max(120),
  descriptionId: optionalText(500),
  descriptionEn: optionalText(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const tagSchema = z.object({
  id: optionalText(40),
  // Tag disimpan satu nama tanpa terjemahan — istilah teknis sama di kedua
  // bahasa, menerjemahkannya justru memecah navigasi
  // (04_SEED_CONTENT_DRAFT §6).
  name: z
    .string()
    .trim()
    .min(2, 'Nama tag wajib diisi.')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Tag hanya huruf kecil, angka, dan tanda hubung.'),
})

export type TagInput = z.infer<typeof tagSchema>
