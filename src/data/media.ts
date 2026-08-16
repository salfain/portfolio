import 'server-only'

import { randomUUID } from 'node:crypto'

import { prisma } from '@/lib/prisma'
import {
  EXTENSION_FOR_MIME,
  MAX_UPLOAD_BYTES,
  readImageSize,
  sniffMime,
} from '@/lib/media-file'
import { buildStorageKey, storage } from '@/lib/storage'
import type { MediaUpdateInput, MediaUploadInput } from '@/lib/schemas/media'

import { recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

/**
 * Aset bukti — sisi admin.
 *
 * Halaman publik membaca media lewat `src/data/knowledge.ts`, yang menyaring
 * `isPublic: true, redactionConfirmed: true` DI DALAM query. Berkas ini
 * tidak menyaring apa pun: admin memang harus melihat bukti privat.
 */

export async function getDocumentMedia(documentId: string) {
  await requireAdminPage()

  return prisma.mediaAsset.findMany({
    where: { documentId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

/** Dipakai penyaji berkas: satu baris, tanpa guard — pemanggil yang menjaga. */
export async function findAssetByKey(fileKey: string) {
  return prisma.mediaAsset.findUnique({
    where: { fileKey },
    select: {
      id: true,
      fileKey: true,
      mimeType: true,
      isPublic: true,
      redactionConfirmed: true,
    },
  })
}

export type UploadRejection =
  | 'FILE_MISSING'
  | 'FILE_TOO_LARGE'
  | 'FILE_TYPE_NOT_ALLOWED'
  | 'FILE_TYPE_MISMATCH'

/**
 * Simpan berkas baru.
 *
 * Urutannya penting: berkas ditulis ke penyimpanan LEBIH DULU, baru barisnya
 * dibuat. Kalau dibalik, kegagalan menulis berkas meninggalkan baris database
 * yang menunjuk berkas tidak ada — dan galeri bukti akan menampilkan gambar
 * rusak di halaman terbit. Bila pembuatan baris yang gagal, yang tertinggal
 * hanya berkas yatim di disk; itu dibersihkan di sini juga.
 */
export async function uploadDocumentMedia(
  input: MediaUploadInput,
  file: File | null,
): Promise<{ error?: UploadRejection }> {
  const session = await requireAdmin()

  if (!file || file.size === 0) return { error: 'FILE_MISSING' }
  if (file.size > MAX_UPLOAD_BYTES) return { error: 'FILE_TOO_LARGE' }

  const buffer = Buffer.from(await file.arrayBuffer())
  const actualMime = sniffMime(buffer)

  if (actualMime === null) return { error: 'FILE_TYPE_NOT_ALLOWED' }

  /**
   * Jenis yang diklaim peramban harus cocok dengan isi berkasnya.
   *
   * Ketidakcocokan bukan sekadar salah label: berkas yang isinya HTML tapi
   * mengaku `image/png` adalah XSS di domain yang sama dengan sesi admin
   * begitu ia disajikan. Yang dipakai selanjutnya selalu `actualMime`.
   */
  if (file.type && file.type !== actualMime) {
    return { error: 'FILE_TYPE_MISMATCH' }
  }

  const key = buildStorageKey({
    documentId: input.documentId,
    extension: EXTENSION_FOR_MIME[actualMime],
    random: randomUUID(),
  })

  const size = readImageSize(buffer, actualMime)

  await storage.put(key, buffer, actualMime)

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        documentId: input.documentId,
        kind: input.kind,
        fileKey: key,
        // Disajikan lewat route handler, bukan sebagai berkas statis.
        fileUrl: `/media/${key}`,
        mimeType: actualMime,
        fileSize: buffer.byteLength,
        width: size?.width ?? null,
        height: size?.height ?? null,
        altId: input.altId,
        altEn: input.altEn,
        titleId: input.titleId,
        titleEn: input.titleEn,
        captionId: input.captionId,
        captionEn: input.captionEn,
        tool: input.tool,
        sourceNote: input.sourceNote,
        sortOrder: input.sortOrder,
        // Berkas baru SELALU privat dan belum terkonfirmasi, apa pun yang
        // dikirim form. Menerbitkan bukti adalah tindakan tersendiri.
        isPublic: false,
        redactionConfirmed: false,
      },
      select: { id: true },
    })

    await recordAudit({
      actorId: session.user.id,
      action: 'create',
      entityType: 'MediaAsset',
      entityId: asset.id,
      metadata: {
        documentId: input.documentId,
        mimeType: actualMime,
        fileSize: buffer.byteLength,
        driver: storage.name,
      },
    })

    return {}
  } catch (error) {
    // Jangan tinggalkan berkas yatim kalau barisnya gagal dibuat.
    await storage.delete(key).catch(() => {})

    throw error
  }
}

export async function updateDocumentMedia(input: MediaUpdateInput) {
  const session = await requireAdmin()

  const { id, isCover, ...fields } = input

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { ...fields, isCover },
    select: { documentId: true, isPublic: true },
  })

  /**
   * Sampul hanya boleh satu per dokumen.
   *
   * Tanpa ini, dua aset bertanda sampul membuat kartu dokumen menampilkan
   * salah satunya secara acak — tergantung urutan query, yang bisa berubah
   * sendiri seiring data bertambah.
   */
  if (isCover && asset.documentId) {
    await prisma.mediaAsset.updateMany({
      where: { documentId: asset.documentId, id: { not: id } },
      data: { isCover: false },
    })
  }

  await recordAudit({
    actorId: session.user.id,
    action: input.isPublic ? 'publish' : 'update',
    entityType: 'MediaAsset',
    entityId: id,
    metadata: { isPublic: input.isPublic },
  })
}

export async function deleteDocumentMedia(id: string) {
  const session = await requireAdmin()

  const asset = await prisma.mediaAsset.delete({
    where: { id },
    select: { fileKey: true, documentId: true },
  })

  // Barisnya sudah hilang; berkas yang gagal dihapus tidak boleh membuat
  // seluruh aksi tampak gagal. Yang tertinggal cuma berkas tanpa acuan.
  await storage.delete(asset.fileKey).catch(() => {})

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'MediaAsset',
    entityId: id,
    metadata: { documentId: asset.documentId },
  })
}
