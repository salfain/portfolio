import { z } from 'zod'

/**
 * Pesan validasi di sini adalah KODE, bukan teks yang dilihat pengguna.
 * Kode dipetakan ke kunci terjemahan `contact.errors.*` di komponen,
 * supaya pesan error ikut bilingual (03_I18N §1).
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'nameTooShort')
    .max(100, 'nameTooLong'),
  email: z
    .string()
    .trim()
    .min(1, 'emailRequired')
    .email('emailInvalid')
    .max(200, 'emailTooLong'),
  company: z.string().trim().max(150, 'companyTooLong').optional(),
  subject: z.string().trim().max(200, 'subjectTooLong').optional(),
  message: z
    .string()
    .trim()
    .min(20, 'messageTooShort')
    .max(4000, 'messageTooLong'),
  locale: z.enum(['id', 'en']),
  /**
   * Honeypot. Bot mengisi setiap field yang ada di DOM; manusia tidak
   * pernah melihat field ini. Terisi → permintaan dibuang tanpa pesan
   * error, supaya bot tidak belajar apa yang gagal.
   */
  website: z.string().max(0, 'spam').optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

/** Kode error yang boleh dikembalikan server action ke klien. */
export type ContactErrorCode =
  | 'validation'
  | 'rateLimited'
  | 'server'

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      code: ContactErrorCode
      fieldErrors?: Partial<Record<keyof ContactInput, string>>
    }
