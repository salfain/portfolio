'use server'

import {
  contactSchema,
  type ContactInput,
  type ContactState,
} from '@/lib/schemas/contact'
import { countRecentMessagesFrom, createContactMessage } from '@/data/contact'

/** Maksimal kiriman per alamat email per jam. */
const MAX_PER_HOUR = 3

/**
 * Form kontak publik — SATU-SATUNYA server action tanpa `requireAdmin()`,
 * karena memang ditujukan untuk pengunjung anonim.
 *
 * Perlindungan yang aktif di Fase 3 (06_SECURITY §6):
 *   1. Honeypot          ✅ di bawah
 *   2. Validasi Zod      ✅ di server, bukan hanya di klien
 *   3. Rate limit        ⚠️ per email, BUKAN per IP
 *   4. Cloudflare Turnstile ❌ belum
 *
 * Lapisan 3 dan 4 belum lengkap: rate limit per IP mensyaratkan
 * penyimpanan hash IP (tabel baru = perubahan skema, wajib ditanyakan
 * lebih dulu), dan Turnstile butuh dependency serta kunci akun baru.
 * Keduanya WAJIB dituntaskan sebelum Fase 3.5 (deploy) — dicatat di
 * docs/phase-3/NOTES.md.
 */
export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company') || undefined,
    subject: formData.get('subject') || undefined,
    message: formData.get('message'),
    locale: formData.get('locale'),
    website: formData.get('website') || undefined,
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors

    // Honeypot terisi → kemungkinan besar bot. Balas "berhasil" tanpa
    // menyimpan apa pun, supaya bot tidak belajar apa yang gagal.
    if (flat.website) return { status: 'success' }

    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {}

    for (const [field, messages] of Object.entries(flat)) {
      const code = messages?.[0]
      if (code) fieldErrors[field as keyof ContactInput] = code
    }

    return { status: 'error', code: 'validation', fieldErrors }
  }

  // `website` sengaja tidak ikut disimpan — field itu hanya umpan bot.
  const input = {
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    subject: parsed.data.subject,
    message: parsed.data.message,
    locale: parsed.data.locale,
  }

  try {
    const recent = await countRecentMessagesFrom(input.email)

    if (recent >= MAX_PER_HOUR) {
      return { status: 'error', code: 'rateLimited' }
    }

    await createContactMessage(input)

    return { status: 'success' }
  } catch {
    // Isi pesan kontak tidak boleh masuk log (06_SECURITY §8),
    // jadi error-nya tidak dicetak bersama payload.
    console.error('submitContact gagal menyimpan pesan')

    return { status: 'error', code: 'server' }
  }
}
