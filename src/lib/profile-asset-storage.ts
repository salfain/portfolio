import 'server-only'

import {
  deleteCertificateImage,
  getCertificateImageKey,
  getCertificateImageUrl,
  getObjectStorageConfig,
  putCertificateImage,
} from './certificate-image-storage'

/**
 * Berkas milik profil situs: dua CV dan satu foto profil.
 *
 * Plumbing S3-nya dipakai ulang dari modul sertifikat — bucket, kredensial,
 * dan aturan URL publiknya sama persis, jadi menyalinnya hanya akan
 * membuat dua tempat yang harus disetel serempak saat R2 diganti.
 * Yang berbeda hanya jenis berkas yang diizinkan dan susunan kuncinya.
 */
export {
  getObjectStorageConfig,
  getCertificateImageUrl as getAssetUrl,
  getCertificateImageKey as getAssetKey,
  deleteCertificateImage as deleteAsset,
  putCertificateImage as putAsset,
}

export const PROFILE_ASSET_KINDS = ['cvId', 'cvEn', 'photo'] as const

export type ProfileAssetKind = (typeof PROFILE_ASSET_KINDS)[number]

/** Kolom `SiteProfile` yang menyimpan URL untuk tiap jenis berkas. */
export const PROFILE_ASSET_COLUMN = {
  cvId: 'cvIdUrl',
  cvEn: 'cvEnUrl',
  photo: 'profileImageUrl',
} as const satisfies Record<ProfileAssetKind, string>

export const PROFILE_ASSET_LABEL = {
  cvId: 'CV (Indonesia)',
  cvEn: 'CV (Inggris)',
  photo: 'Foto profil',
} as const satisfies Record<ProfileAssetKind, string>

/** 8 MB. CV dan foto profil jauh di bawah ini. */
export const MAX_PROFILE_ASSET_BYTES = 8 * 1024 * 1024

export function isProfileAssetKind(value: string): value is ProfileAssetKind {
  return (PROFILE_ASSET_KINDS as readonly string[]).includes(value)
}

type DetectedType = { extension: string; mimeType: string }

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

/**
 * Jenis berkas ditentukan dari ISI, bukan dari `File.type`.
 *
 * `File.type` datang dari peramban dan bisa diisi apa saja oleh siapa pun
 * yang menyusun permintaannya sendiri. Berkas HTML yang mengaku PDF lalu
 * disajikan apa adanya berarti XSS di domain yang sama dengan sesi admin.
 *
 * Daftar-izin, bukan daftar-larang: format yang belum terpikirkan otomatis
 * ditolak. SVG sengaja TIDAK diizinkan untuk foto profil — SVG adalah
 * dokumen yang bisa memuat skrip.
 */
export function detectProfileAssetType(
  kind: ProfileAssetKind,
  bytes: Uint8Array,
): DetectedType | null {
  // %PDF
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) {
    return kind === 'photo'
      ? null
      : { extension: 'pdf', mimeType: 'application/pdf' }
  }

  if (kind !== 'photo') return null

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: 'png', mimeType: 'image/png' }
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { extension: 'jpg', mimeType: 'image/jpeg' }
  }

  // RIFF....WEBP
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { extension: 'webp', mimeType: 'image/webp' }
  }

  return null
}

export function profileAssetTypeError(kind: ProfileAssetKind): string {
  return kind === 'photo'
    ? 'Format foto harus JPG, PNG, atau WebP.'
    : 'Berkas CV harus PDF.'
}
