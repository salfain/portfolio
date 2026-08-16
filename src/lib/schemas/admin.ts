import { z } from 'zod'

import { documentSchema, isEmptyDocument } from '@/lib/prosemirror/types'

/**
 * Skema untuk seluruh form admin.
 *
 * Pesan error ditulis langsung dalam bahasa Indonesia — antarmuka admin
 * memang hanya satu bahasa (05_ROUTE_AND_PRIORITY_MAP §3), jadi tidak
 * perlu lewat kunci terjemahan seperti rute publik.
 *
 * Setiap string WAJIB punya `max()` (06_SECURITY §3).
 */

/** Daftar dipisah baris baru di textarea → array bersih. */
const lines = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
  z.array(z.string().max(300)).max(50),
)

/** Field teks opsional: string kosong dianggap "tidak diisi". */
const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
    z.string().max(max).nullable(),
  )

const optionalUrl = (max = 500) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
    z.string().url('URL tidak valid.').max(max).nullable(),
  )

const optionalDate = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() !== '' ? new Date(value) : null,
  z.date({ invalid_type_error: 'Tanggal tidak valid.' }).nullable(),
)

const requiredDate = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? new Date(value)
      : undefined,
  z.date({
    required_error: 'Tanggal wajib diisi.',
    invalid_type_error: 'Tanggal tidak valid.',
  }),
)

const checkbox = z.preprocess(
  (value) => value === 'on' || value === true,
  z.boolean(),
)

const sortOrder = z.coerce.number().int().min(0).max(9999).default(0)

export const publishStatusSchema = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'PUBLISHED',
  'ARCHIVED',
])

export type PublishStatusValue = z.infer<typeof publishStatusSchema>

export const PUBLISH_STATUS_LABEL: Record<PublishStatusValue, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'Ditinjau',
  PUBLISHED: 'Terbit',
  ARCHIVED: 'Arsip',
}

// ─── Profil ──────────────────────────────────────────────

/**
 * `roleEn`, `headlineEn`, dan `summaryEn` WAJIB.
 *
 * Bukan kelalaian: `07_SCHEMA_DECISIONS.md` menetapkannya `String`
 * (bukan `String?`), dan `08_I18N_FALLBACK_POLICY.md` §2 mencantumkan
 * ketiganya sebagai field wajib EN untuk `SiteProfile`. Aturan fallback
 * bahasa hanya berlaku untuk `Project` dan `KnowledgeDocument` — profil
 * dan pengalaman adalah wajah utama situs, jadi keduanya harus lengkap
 * di kedua bahasa.
 */
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama wajib diisi.').max(120),
  roleId: z.string().trim().min(2, 'Peran (ID) wajib diisi.').max(120),
  roleEn: z.string().trim().min(2, 'Peran (EN) wajib diisi.').max(120),
  headlineId: z
    .string()
    .trim()
    .min(10, 'Headline (ID) minimal 10 karakter.')
    .max(300),
  headlineEn: z
    .string()
    .trim()
    .min(10, 'Headline (EN) minimal 10 karakter.')
    .max(300),
  summaryId: z
    .string()
    .trim()
    .min(20, 'Ringkasan (ID) minimal 20 karakter.')
    .max(2000),
  summaryEn: z
    .string()
    .trim()
    .min(20, 'Ringkasan (EN) minimal 20 karakter.')
    .max(2000),
  location: optionalText(160),
  email: z.string().trim().email('Format email tidak valid.').max(200),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  availabilityId: optionalText(160),
  availabilityEn: optionalText(160),
  profileImageUrl: optionalText(500),
  cvIdUrl: optionalText(500),
  cvEnUrl: optionalText(500),
  githubUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
})

// ─── Pengalaman ──────────────────────────────────────────

export const experienceSchema = z
  .object({
    id: optionalText(40),
    company: z.string().trim().min(2, 'Nama instansi wajib diisi.').max(160),
    positionId: z.string().trim().min(2, 'Jabatan (ID) wajib diisi.').max(160),
    // Wajib — sama alasannya dengan profileSchema di atas.
    positionEn: z.string().trim().min(2, 'Jabatan (EN) wajib diisi.').max(160),
    summaryId: z
      .string()
      .trim()
      .min(20, 'Ringkasan (ID) minimal 20 karakter.')
      .max(2000),
    summaryEn: z
      .string()
      .trim()
      .min(20, 'Ringkasan (EN) minimal 20 karakter.')
      .max(2000),
    location: optionalText(160),
    startDate: requiredDate,
    endDate: optionalDate,
    isCurrent: checkbox,
    achievementsId: lines,
    achievementsEn: lines,
    tools: lines,
    sortOrder,
    status: publishStatusSchema,
  })
  .refine((data) => data.isCurrent || data.endDate !== null, {
    message: 'Isi tanggal selesai, atau centang "masih berjalan".',
    path: ['endDate'],
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
    path: ['endDate'],
  })

// ─── Keahlian ────────────────────────────────────────────

export const skillSchema = z.object({
  id: optionalText(40),
  name: z.string().trim().min(1, 'Nama keahlian wajib diisi.').max(120),
  category: z.string().trim().min(1, 'Kategori wajib diisi.').max(120),
  // Skala kata, bukan persentase (00_CONTENT_INVENTORY §3).
  level: optionalText(40),
  sortOrder,
  isFeatured: checkbox,
  status: publishStatusSchema,
})

// ─── Sertifikat ──────────────────────────────────────────

export const certificateSchema = z
  .object({
    id: optionalText(40),
    name: z.string().trim().min(2, 'Nama sertifikat wajib diisi.').max(200),
    issuer: z.string().trim().min(2, 'Penerbit wajib diisi.').max(160),
    issueDate: optionalDate,
    expiryDate: optionalDate,
    credentialUrl: optionalUrl(),
    skills: lines,
    sortOrder,
    status: publishStatusSchema,
  })
  .refine(
    (data) =>
      !data.issueDate || !data.expiryDate || data.expiryDate >= data.issueDate,
    {
      message:
        'Tanggal kedaluwarsa tidak boleh lebih awal dari tanggal terbit.',
      path: ['expiryDate'],
    },
  )

// ─── Proyek ──────────────────────────────────────────────

export const projectSchema = z.object({
  id: optionalText(40),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug minimal 3 karakter.')
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug hanya boleh huruf kecil, angka, dan tanda hubung.',
    ),
  titleId: z.string().trim().min(3, 'Judul (ID) wajib diisi.').max(200),
  titleEn: optionalText(200),
  summaryId: z
    .string()
    .trim()
    .min(20, 'Ringkasan (ID) minimal 20 karakter.')
    .max(1000),
  summaryEn: optionalText(1000),
  problemId: optionalText(5000),
  problemEn: optionalText(5000),
  solutionId: optionalText(5000),
  solutionEn: optionalText(5000),
  resultId: optionalText(5000),
  resultEn: optionalText(5000),
  roleId: optionalText(300),
  roleEn: optionalText(300),
  tools: lines,
  repositoryUrl: optionalUrl(),
  demoUrl: optionalUrl(),
  isFeatured: checkbox,
  sortOrder,
  status: publishStatusSchema,
})

// ─── Knowledge Base ──────────────────────────────────────

export const knowledgeTypeSchema = z.enum(['SOP', 'LAB', 'INCIDENT', 'ARTICLE'])
export const difficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])

export type KnowledgeTypeValue = z.infer<typeof knowledgeTypeSchema>
export type DifficultyValue = z.infer<typeof difficultySchema>

export const KNOWLEDGE_TYPE_LABEL: Record<KnowledgeTypeValue, string> = {
  SOP: 'SOP',
  LAB: 'Lab',
  INCIDENT: 'Insiden',
  ARTICLE: 'Artikel',
}

export const DIFFICULTY_LABEL: Record<DifficultyValue, string> = {
  BEGINNER: 'Dasar',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Mahir',
}

const slugField = z
  .string()
  .trim()
  .min(3, 'Slug minimal 3 karakter.')
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug hanya boleh huruf kecil, angka, dan tanda hubung.',
  )

/**
 * Isi dokumen datang dari editor sebagai STRING JSON di input tersembunyi.
 *
 * Diparse dan divalidasi di sini, bukan disimpan mentah: apa pun yang masuk
 * kolom `Json` akan dirender di halaman publik, jadi bentuknya harus sudah
 * dipastikan dokumen ProseMirror sebelum menyentuh database.
 *
 * `documentSchema` sendiri sengaja permisif terhadap node yang tidak dikenal
 * (lihat `src/lib/prosemirror/types.ts`) — yang ditolak di sini hanyalah
 * nilai yang sama sekali bukan dokumen.
 */
const contentJson = (required: boolean) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string' || value.trim() === '') return null

      try {
        return JSON.parse(value)
      } catch {
        return 'INVALID_JSON'
      }
    },
    z
      .union([documentSchema, z.null()])
      // Editor yang dibiarkan kosong tetap mengirim satu paragraf kosong.
      // Disimpan apa adanya, isi EN "kosong tapi ada" mematikan fallback ke
      // bahasa Indonesia di halaman publik.
      .transform((value) =>
        value !== null && isEmptyDocument(value) ? null : value,
      )
      .refine((value) => !required || value !== null, {
        message: 'Isi dokumen wajib diisi.',
      }),
  )

/** Nama tag dipisah koma; dinormalkan jadi daftar unik. */
const tagNames = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? Array.from(
          new Set(
            value
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean),
          ),
        )
      : [],
  z.array(z.string().max(60)).max(20),
)

export const knowledgeDocumentSchema = z
  .object({
    id: optionalText(40),
    type: knowledgeTypeSchema,
    slug: slugField,
    documentCode: optionalText(60),
    version: z.string().trim().min(1).max(20).default('1.0'),
    titleId: z.string().trim().min(3, 'Judul (ID) wajib diisi.').max(200),
    titleEn: optionalText(200),
    summaryId: z
      .string()
      .trim()
      .min(20, 'Ringkasan (ID) minimal 20 karakter.')
      .max(1000),
    summaryEn: optionalText(1000),
    contentIdJson: contentJson(true),
    contentEnJson: contentJson(false),
    categoryId: optionalText(40),
    tags: tagNames,
    difficulty: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      difficultySchema.nullable(),
    ),
    estimatedMinutes: z.preprocess(
      (value) =>
        typeof value === 'string' && value.trim() !== '' ? Number(value) : null,
      z.number().int().min(1).max(1440).nullable(),
    ),
    tools: lines,
    isFeatured: checkbox,
    sortOrder,
    status: publishStatusSchema,
    /** Ringkasan perubahan — dipakai sebagai judul revisi. */
    changeSummary: optionalText(300),
    /**
     * Konfirmasi redaksi. Wajib dicentang untuk menerbitkan, dan sengaja
     * TIDAK disimpan: nilainya hanya berlaku untuk satu kali kirim, supaya
     * penerbitan berikutnya tetap menuntut pemeriksaan ulang.
     * Lihat docs/phase-0/02_REDACTION_CHECKLIST.md.
     */
    redactionConfirmed: checkbox,
  })
  .refine((data) => data.status !== 'PUBLISHED' || data.redactionConfirmed, {
    message:
      'Centang konfirmasi redaksi sebelum menerbitkan — tidak ada kredensial, IP publik, atau nama instansi tanpa izin di dokumen ini.',
    path: ['redactionConfirmed'],
  })

export const knowledgeCategorySchema = z.object({
  id: optionalText(40),
  slug: slugField,
  nameId: z.string().trim().min(2, 'Nama (ID) wajib diisi.').max(120),
  nameEn: z.string().trim().min(2, 'Nama (EN) wajib diisi.').max(120),
  descriptionId: optionalText(500),
  descriptionEn: optionalText(500),
  sortOrder,
})

// ─── Bagian naratif (SiteSetting) ────────────────────────

/**
 * Blok naratif diketik sebagai teks berformat sederhana, satu blok per
 * paragraf ganda, judul dipisah dari isi oleh `|`:
 *
 *   Judul blok | Isi blok
 *
 *   Judul lain | Isi lain
 *
 * Editor kaya (Tiptap) baru masuk di Fase 5; format ini sengaja dibuat
 * cukup untuk tiga bagian naratif tanpa menarik dependency baru.
 */
export const narrativeFormSchema = z.object({
  key: z.enum([
    'home.whyWorkWithMe',
    'home.troubleshootingProcess',
    'about.story',
  ]),
  blocksId: z.string().max(20000),
  blocksEn: z.string().max(20000),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type ExperienceInput = z.infer<typeof experienceSchema>
export type SkillInput = z.infer<typeof skillSchema>
export type CertificateInput = z.infer<typeof certificateSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type NarrativeFormInput = z.infer<typeof narrativeFormSchema>
export type KnowledgeDocumentInput = z.infer<typeof knowledgeDocumentSchema>
export type KnowledgeCategoryInput = z.infer<typeof knowledgeCategorySchema>

/** Bentuk hasil setiap server action admin. */
export type AdminState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

/**
 * Ubah `ZodError` menjadi peta `field → pesan pertama`.
 *
 * Error tanpa path (hasil `.refine()` di tingkat objek) diberi kunci
 * `_form` supaya tetap tampil, tidak hilang diam-diam.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_form'

    if (!result[key]) result[key] = issue.message
  }

  return result
}
