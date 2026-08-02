/**
 * Pemeriksaan berkas unggahan: jenis sebenarnya dan ukuran gambar.
 *
 * `File.type` datang dari peramban dan bisa diisi apa saja oleh siapa pun
 * yang mengirim permintaan sendiri. Berkas HTML yang mengaku `image/png`
 * dan disajikan apa adanya berarti XSS di domain yang sama dengan sesi
 * admin — jadi jenisnya ditentukan dari ISI berkas, dan yang diklaim
 * peramban hanya dipakai sebagai pembanding.
 *
 * Daftar-izin, bukan daftar-larang. Format yang belum terpikirkan otomatis
 * ditolak, termasuk SVG — SVG adalah dokumen yang bisa memuat skrip, dan
 * tidak ada gunanya untuk tangkapan layar bukti.
 */

export type AllowedMime =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf'
  | 'text/plain'
  | 'application/zip'

export const EXTENSION_FOR_MIME: Record<AllowedMime, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/zip': 'zip',
}

export const ALLOWED_MIMES = Object.keys(EXTENSION_FOR_MIME) as AllowedMime[]

/** 10 MB. Tangkapan layar dan PDF sanitasi jauh di bawah ini. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function isAllowedMime(value: string): value is AllowedMime {
  return (ALLOWED_MIMES as string[]).includes(value)
}

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((byte, index) => buffer[offset + index] === byte)
}

/**
 * Jenis berkas menurut isinya.
 *
 * `null` berarti tidak dikenali — dan tidak dikenali selalu berarti ditolak.
 * Teks polos tidak punya magic bytes, jadi ia diperiksa terakhir dengan cara
 * yang berbeda: seluruh isinya harus berupa karakter teks yang wajar.
 */
export function sniffMime(buffer: Buffer): AllowedMime | null {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png'
  }

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg'

  if (
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp'
  }

  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38])) return 'image/gif'
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf'

  // ZIP: arsip biasa, kosong, dan bagian dari arsip terpisah.
  if (
    startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(buffer, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return 'application/zip'
  }

  return isPlainText(buffer) ? 'text/plain' : null
}

/**
 * Teks polos: tidak ada byte NUL dan tidak ada karakter kontrol selain
 * tab, baris baru, dan carriage return.
 *
 * Cukup memeriksa awal berkas — yang dicari bukan keabsahan UTF-8, melainkan
 * kepastian bahwa ini bukan berkas biner yang menyamar.
 */
function isPlainText(buffer: Buffer): boolean {
  if (buffer.length === 0) return false

  const sample = buffer.subarray(0, 4096)

  for (const byte of sample) {
    if (byte === 0) return false
    if (byte < 0x09) return false
    if (byte > 0x0d && byte < 0x20) return false
  }

  return true
}

export type ImageSize = { width: number; height: number }

/**
 * Lebar dan tinggi gambar, dibaca dari header berkas.
 *
 * Dibutuhkan `next/image`: tanpa dimensi, komponennya tidak bisa memesan
 * ruang dan halaman melompat saat gambar selesai dimuat. Fase 4 memakai
 * `<img>` biasa justru karena dimensi ini tidak pernah tersimpan
 * (docs/phase-4/NOTES.md N3).
 *
 * `null` bukan kegagalan — PDF dan arsip memang tidak punya ukuran, dan
 * gambar yang headernya tidak terbaca tetap boleh diunggah, hanya saja
 * dirender dengan `<img>`.
 */
export function readImageSize(
  buffer: Buffer,
  mime: AllowedMime,
): ImageSize | null {
  try {
    if (mime === 'image/png') return pngSize(buffer)
    if (mime === 'image/gif') return gifSize(buffer)
    if (mime === 'image/jpeg') return jpegSize(buffer)
    if (mime === 'image/webp') return webpSize(buffer)
  } catch {
    // Header terpotong atau varian yang tidak ditangani. Bukan alasan
    // menolak berkasnya.
    return null
  }

  return null
}

function pngSize(buffer: Buffer): ImageSize | null {
  // IHDR selalu chunk pertama: lebar di offset 16, tinggi di 20.
  if (buffer.length < 24) return null

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function gifSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 10) return null

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  }
}

function jpegSize(buffer: Buffer): ImageSize | null {
  let offset = 2

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null

    const marker = buffer[offset + 1] ?? 0
    const length = buffer.readUInt16BE(offset + 2)

    // SOF0–SOF15, kecuali penanda yang bukan start-of-frame (C4, C8, CC).
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    offset += 2 + length
  }

  return null
}

function webpSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 30) return null

  const format = buffer.subarray(12, 16).toString('ascii')

  if (format === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    }
  }

  if (format === 'VP8L') {
    const bits = buffer.readUInt32LE(21)

    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    }
  }

  if (format === 'VP8X') {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
    }
  }

  return null
}
