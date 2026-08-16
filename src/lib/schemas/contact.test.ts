import { describe, expect, it } from 'vitest'

import { contactSchema } from '@/lib/schemas/contact'

const valid = {
  name: 'Budi Santoso',
  email: 'budi@example.com',
  message: 'Halo, saya ingin bertanya soal ketersediaan Anda bulan depan.',
  locale: 'id' as const,
}

describe('contactSchema', () => {
  it('menerima kiriman yang sah', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('menolak nama terlalu pendek dengan kode error', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'B' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name?.[0]).toBe('nameTooShort')
    }
  })

  it('menolak email tidak valid', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'bukan-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toBe('emailInvalid')
    }
  })

  it('menolak pesan di bawah 20 karakter', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Halo' })
    expect(result.success).toBe(false)
  })

  // Batas max() wajib ada di setiap string (06_SECURITY §3).
  it('menolak pesan melebihi 4000 karakter', () => {
    const result = contactSchema.safeParse({
      ...valid,
      message: 'a'.repeat(4001),
    })
    expect(result.success).toBe(false)
  })

  it('menolak locale di luar id/en', () => {
    const result = contactSchema.safeParse({ ...valid, locale: 'fr' })
    expect(result.success).toBe(false)
  })

  it('honeypot terisi membuat validasi gagal', () => {
    const result = contactSchema.safeParse({ ...valid, website: 'http://spam' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.website?.[0]).toBe('spam')
    }
  })

  it('honeypot kosong tidak mengganggu', () => {
    expect(contactSchema.safeParse({ ...valid, website: '' }).success).toBe(
      true,
    )
  })
})
