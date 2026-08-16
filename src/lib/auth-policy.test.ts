import { describe, expect, it } from 'vitest'

import { adminEmailAndPassword, isAdminRole } from '@/lib/auth-policy'

describe('admin auth policy', () => {
  it('menonaktifkan registrasi publik', () => {
    expect(adminEmailAndPassword.enabled).toBe(true)
    expect(adminEmailAndPassword.disableSignUp).toBe(true)
  })

  it('hanya menerima role admin', () => {
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('user')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })
})
