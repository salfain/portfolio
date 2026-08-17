import { describe, expect, it } from 'vitest'

import { profileSchema } from './admin'
import {
  detectProfileAssetType,
  isProfileAssetKind,
  PROFILE_ASSET_COLUMN,
} from '@/lib/profile-asset-storage'

/** Isian minimal yang lolos validasi, tanpa kolom berkas apa pun. */
const validForm = {
  name: 'Muhammad Syaban Alfain',
  roleId: 'IT Support',
  roleEn: 'IT Support',
  headlineId: 'Judul contoh untuk pengujian.',
  headlineEn: 'Sample headline for testing.',
  summaryId: 'Ringkasan contoh yang cukup panjang untuk lolos validasi.',
  summaryEn: 'A sample summary long enough to pass the validation rule.',
  email: 'someone@example.test',
}

describe('profileSchema dan kolom berkas', () => {
  /**
   * Regresi. Ketiga kolom ini pernah ikut didaftarkan di `profileSchema`
   * sementara formulirnya tidak lagi mengirimkannya. `optionalText`
   * mengubah field yang hilang menjadi `null`, dan `saveProfile` menulis
   * hasil parse apa adanya — jadi menekan Simpan menghapus berkas yang
   * baru saja diunggah.
   */
  it('tidak menghasilkan kolom berkas saat formulir tidak mengirimnya', () => {
    const parsed = profileSchema.parse(validForm)

    expect(parsed).not.toHaveProperty('cvIdUrl')
    expect(parsed).not.toHaveProperty('cvEnUrl')
    expect(parsed).not.toHaveProperty('profileImageUrl')
  })

  it('mengabaikan kolom berkas walau ikut terkirim', () => {
    const parsed = profileSchema.parse({
      ...validForm,
      cvIdUrl: '/lama/cv.pdf',
      profileImageUrl: '/lama/foto.jpg',
    })

    expect(parsed).not.toHaveProperty('cvIdUrl')
    expect(parsed).not.toHaveProperty('profileImageUrl')
  })

  it('memetakan setiap jenis berkas ke kolomnya', () => {
    expect(PROFILE_ASSET_COLUMN).toEqual({
      cvId: 'cvIdUrl',
      cvEn: 'cvEnUrl',
      photo: 'profileImageUrl',
    })
  })
})

describe('detectProfileAssetType', () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
  const png = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ])
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
  const html = new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e])

  it('menerima PDF untuk CV', () => {
    expect(detectProfileAssetType('cvId', pdf)).toEqual({
      extension: 'pdf',
      mimeType: 'application/pdf',
    })
  })

  it('menolak gambar untuk CV', () => {
    expect(detectProfileAssetType('cvEn', png)).toBeNull()
  })

  it('menerima gambar untuk foto profil', () => {
    expect(detectProfileAssetType('photo', png)?.mimeType).toBe('image/png')
    expect(detectProfileAssetType('photo', jpeg)?.mimeType).toBe('image/jpeg')
  })

  it('menolak PDF untuk foto profil', () => {
    expect(detectProfileAssetType('photo', pdf)).toBeNull()
  })

  /**
   * Yang paling penting: berkas HTML yang mengaku gambar. Kalau lolos dan
   * disajikan apa adanya, itu XSS di domain yang sama dengan sesi admin.
   */
  it('menolak berkas yang jenisnya tidak dikenali', () => {
    expect(detectProfileAssetType('photo', html)).toBeNull()
    expect(detectProfileAssetType('cvId', html)).toBeNull()
  })
})

describe('isProfileAssetKind', () => {
  it('hanya menerima jenis yang terdaftar', () => {
    expect(isProfileAssetKind('cvId')).toBe(true)
    expect(isProfileAssetKind('photo')).toBe(true)
    expect(isProfileAssetKind('../../etc/passwd')).toBe(false)
    expect(isProfileAssetKind('email')).toBe(false)
  })
})
