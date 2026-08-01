import { describe, expect, it } from 'vitest'

import { contentSecurityPolicy, securityHeaders } from './security-headers'

/**
 * Header keamanan yang salah ketik tidak menghasilkan galat apa pun — ia
 * hanya diam-diam tidak berlaku. Tes ini yang menggantikan galat itu.
 */

const production = contentSecurityPolicy(false)
const development = contentSecurityPolicy(true)

function directive(policy: string, name: string): string {
  const found = policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `))

  return found ?? ''
}

describe('Content-Security-Policy', () => {
  it('menolak sumber daya dari origin lain sebagai default', () => {
    expect(directive(production, 'default-src')).toBe("default-src 'self'")
  })

  /**
   * Ini yang paling menentukan: skrip dari domain lain harus ditolak,
   * meski skrip inline diizinkan. Kalau `script-src` sampai memuat `*`
   * atau host luar, seluruh gunanya CSP di sini hilang.
   */
  it('hanya mengizinkan skrip dari origin sendiri', () => {
    const value = directive(production, 'script-src')

    expect(value).toContain("'self'")
    expect(value).not.toContain('http')
    expect(value).not.toContain('*')
  })

  it('TIDAK PERNAH mengizinkan unsafe-eval di produksi', () => {
    expect(production).not.toContain("'unsafe-eval'")
    // Di pengembangan ia dibutuhkan React Fast Refresh.
    expect(development).toContain("'unsafe-eval'")
  })

  it('menutup object, base-uri, form-action, dan pembingkaian', () => {
    expect(directive(production, 'object-src')).toBe("object-src 'none'")
    expect(directive(production, 'base-uri')).toBe("base-uri 'self'")
    expect(directive(production, 'form-action')).toBe("form-action 'self'")
    expect(directive(production, 'frame-ancestors')).toBe(
      "frame-ancestors 'none'",
    )
  })

  it('tidak mengizinkan gambar dari host luar', () => {
    const value = directive(production, 'img-src')

    expect(value).toContain("'self'")
    expect(value).not.toMatch(/https?:\/\//)
  })

  it('memaksa HTTPS hanya di produksi', () => {
    expect(production).toContain('upgrade-insecure-requests')
    expect(development).not.toContain('upgrade-insecure-requests')
  })

  it('setiap direktif punya nilai — tidak ada yang menggantung', () => {
    for (const part of production.split(';')) {
      const trimmed = part.trim()

      if (trimmed === 'upgrade-insecure-requests' || trimmed === '') continue

      expect(trimmed.split(' ').length).toBeGreaterThan(1)
    }
  })
})

describe('securityHeaders', () => {
  it('memasang HSTS hanya di produksi', () => {
    const names = (dev: boolean) => securityHeaders(dev).map((h) => h.key)

    expect(names(false)).toContain('Strict-Transport-Security')
    expect(names(true)).not.toContain('Strict-Transport-Security')
  })

  it('memasang seluruh header yang dituntut 06_SECURITY', () => {
    const names = securityHeaders(false).map((header) => header.key)

    expect(names).toEqual(
      expect.arrayContaining([
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
      ]),
    )
  })

  it('tidak ada header bernilai kosong', () => {
    for (const header of securityHeaders(false)) {
      expect(header.value.trim()).not.toBe('')
    }
  })
})
