/**
 * Skema URL yang boleh muncul di tautan dalam dokumen.
 *
 * `javascript:`, `data:`, dan `vbscript:` adalah jalur XSS klasik lewat
 * atribut `href` — editor bisa saja menyimpannya, entah karena tempel dari
 * sumber luar atau karena akun admin disalahgunakan. Daftar-izin dipakai,
 * bukan daftar-larang: skema baru yang belum terpikirkan otomatis ditolak.
 *
 * Lihat docs/rules/06_SECURITY.md §4.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

export type SafeLink = {
  href: string
  isExternal: boolean
}

export function safeLink(value: unknown): SafeLink | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  if (trimmed === '') return null

  // Tautan relatif dan anchor internal selalu aman — tidak punya skema.
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return { href: trimmed, isExternal: false }
  }

  try {
    const url = new URL(trimmed)

    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null

    return { href: url.href, isExternal: url.protocol !== 'mailto:' }
  } catch {
    // Bukan URL absolut yang sah, dan bukan relatif — tolak.
    return null
  }
}

/**
 * Sumber gambar yang boleh dirender di Fase 4.
 *
 * Hanya path relatif. Gambar remote menunggu `images.remotePatterns` diisi
 * saat penyimpanan objek dipasang di Fase 5 — merendernya sekarang berarti
 * `next/image` menolak host-nya saat runtime, dan halamannya gagal.
 */
export function safeImageSrc(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()

  return trimmed.startsWith('/') && !trimmed.startsWith('//') ? trimmed : null
}
