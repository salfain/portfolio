import { describe, expect, it } from 'vitest'

import { changePasswordSchema } from './account'

const base = {
  currentPassword: 'kata-sandi-lama-yang-panjang',
  newPassword: 'kata-sandi-baru-yang-panjang',
  confirmPassword: 'kata-sandi-baru-yang-panjang',
}

function paths(result: ReturnType<typeof changePasswordSchema.safeParse>) {
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('changePasswordSchema', () => {
  it('menerima penggantian yang sah', () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true)
  })

  /**
   * Kata sandi lama wajib meski sesinya sudah terverifikasi: sesi yang
   * tertinggal terbuka di perangkat orang lain justru alasan paling umum
   * seseorang perlu mengganti kata sandi.
   */
  it('menolak tanpa kata sandi saat ini', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      currentPassword: '',
    })

    expect(result.success).toBe(false)
    expect(paths(result)).toContain('currentPassword')
  })

  it('menolak kata sandi baru yang terlalu pendek', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      newPassword: 'pendek',
      confirmPassword: 'pendek',
    })

    expect(result.success).toBe(false)
    expect(paths(result)).toContain('newPassword')
  })

  it('menolak ketikan ulang yang tidak sama', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      confirmPassword: 'kata-sandi-yang-lain-lagi',
    })

    expect(result.success).toBe(false)
    expect(paths(result)).toContain('confirmPassword')
  })

  it('menolak kata sandi baru yang sama dengan yang lama', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: base.currentPassword,
      newPassword: base.currentPassword,
      confirmPassword: base.currentPassword,
    })

    expect(result.success).toBe(false)
    expect(paths(result)).toContain('newPassword')
  })
})
