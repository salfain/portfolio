import { z } from 'zod'

/**
 * Skema metadata bukti.
 *
 * `altId` WAJIB dan tidak punya nilai default. Alt text yang boleh kosong
 * akan kosong — dan galeri bukti tanpa alt text adalah halaman yang tidak
 * bisa dibaca sama sekali oleh pembaca layar (docs/rules/05_ACCESSIBILITY.md).
 *
 * Berkasnya sendiri divalidasi terpisah di server: isi berkas menentukan
 * jenisnya, bukan apa yang diklaim peramban. Lihat `src/lib/media-file.ts`.
 */

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
    z.string().max(max).nullable(),
  )

const checkbox = z.preprocess(
  (value) => value === 'on' || value === true,
  z.boolean(),
)

export const mediaKindSchema = z.enum([
  'IMAGE',
  'SCREENSHOT',
  'DIAGRAM',
  'TERMINAL_OUTPUT',
  'DOCUMENT',
  'ARCHIVE',
])

export type MediaKindValue = z.infer<typeof mediaKindSchema>

export const MEDIA_KIND_LABEL: Record<MediaKindValue, string> = {
  IMAGE: 'Gambar',
  SCREENSHOT: 'Tangkapan layar',
  DIAGRAM: 'Diagram',
  TERMINAL_OUTPUT: 'Keluaran terminal',
  DOCUMENT: 'Dokumen',
  ARCHIVE: 'Arsip',
}

/** Unggahan berkas baru. */
export const mediaUploadSchema = z.object({
  documentId: z.string().trim().min(1).max(40),
  kind: mediaKindSchema,
  altId: z
    .string()
    .trim()
    .min(3, 'Alt text (ID) wajib diisi — bukti tanpa alt text tidak terbaca pembaca layar.')
    .max(300),
  altEn: optionalText(300),
  titleId: optionalText(200),
  titleEn: optionalText(200),
  captionId: optionalText(500),
  captionEn: optionalText(500),
  tool: optionalText(120),
  sourceNote: optionalText(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
})

/**
 * Perubahan metadata aset yang sudah ada, termasuk saklar penerbitan.
 *
 * `isPublic` dan `redactionConfirmed` sengaja dipisah dari unggahan: berkas
 * yang baru masuk SELALU privat dan belum terkonfirmasi, apa pun yang
 * dikirim form. Menerbitkan bukti harus jadi tindakan tersendiri yang
 * disadari, bukan efek samping menekan "Unggah".
 */
export const mediaUpdateSchema = z
  .object({
    id: z.string().trim().min(1).max(40),
    kind: mediaKindSchema,
    altId: z.string().trim().min(3, 'Alt text (ID) wajib diisi.').max(300),
    altEn: optionalText(300),
    titleId: optionalText(200),
    titleEn: optionalText(200),
    captionId: optionalText(500),
    captionEn: optionalText(500),
    tool: optionalText(120),
    sourceNote: optionalText(500),
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    isCover: checkbox,
    isPublic: checkbox,
    redactionConfirmed: checkbox,
  })
  /**
   * Bukti tidak bisa dijadikan publik tanpa konfirmasi redaksi.
   *
   * Query publik memang sudah menyaring keduanya, jadi tanpa aturan ini
   * asetnya "publik tapi tidak tampil" — keadaan membingungkan yang
   * membuat orang mencari bug di tempat yang salah. Lebih jelas menolaknya
   * di sini, dengan alasannya.
   */
  .refine((data) => !data.isPublic || data.redactionConfirmed, {
    message:
      'Bukti hanya boleh dipublikasikan setelah konfirmasi redaksi dicentang.',
    path: ['redactionConfirmed'],
  })

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>
