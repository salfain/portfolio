import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { PrismaClient } from '@prisma/client'

/** Sama dengan `LOCAL_UPLOAD_ROOT` di `src/lib/storage/local.ts`. */
const UPLOAD_ROOT = resolve(process.cwd(), 'var', 'uploads')

/** PNG 1×1 piksel, cukup untuk membuktikan berkasnya benar-benar terkirim. */
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

/**
 * Umpan uji E2E.
 *
 * Seluruhnya dibuat dengan awalan `e2e-` supaya pembersihannya bisa
 * menargetkan persis itu — tes yang menghapus "semua dokumen" akan
 * menghapus isi sungguhan begitu seseorang menjalankannya di database
 * yang salah.
 *
 * Isinya sengaja hambar dan jelas-jelas uji coba. Umpan yang terbaca
 * seperti isi sungguhan cepat atau lambat akan tertinggal dan terbit.
 */

export const PREFIX = 'e2e-'

const prisma = new PrismaClient()

const paragraph = (text) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})

export async function seed() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })

  if (!admin) {
    throw new Error(
      'Tidak ada pengguna admin. Jalankan `npm run db:seed` lebih dulu.',
    )
  }

  const terbit = await prisma.knowledgeDocument.create({
    data: {
      slug: `${PREFIX}dokumen-terbit`,
      type: 'SOP',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      titleId: 'Dokumen uji E2E yang terbit',
      summaryId:
        'Umpan uji otomatis. Dokumen ini dihapus lagi setelah tes selesai.',
      contentIdJson: paragraph('Isi dokumen uji tentang jaringan kantor.'),
      contentIdHtml: 'Isi dokumen uji tentang jaringan kantor.',
    },
  })

  const draft = await prisma.knowledgeDocument.create({
    data: {
      slug: `${PREFIX}dokumen-draft`,
      type: 'SOP',
      status: 'DRAFT',
      authorId: admin.id,
      titleId: 'RAHASIA UJI E2E — dokumen ini masih draft',
      summaryId: 'Draft tidak boleh bisa dibuka siapa pun tanpa sesi admin.',
      contentIdJson: paragraph('Isi draft yang tidak boleh bocor.'),
      contentIdHtml: 'Isi draft yang tidak boleh bocor.',
    },
  })

  /**
   * Aset privat, LENGKAP dengan berkas fisiknya.
   *
   * Barisnya saja tidak cukup: tanpa berkas, permintaan bersesi admin juga
   * membalas 404, dan tes tidak bisa membedakan "ditolak" dari "tidak ada".
   * Yang harus dibuktikan adalah URL yang sama membalas 404 tanpa sesi dan
   * 200 dengan sesi.
   */
  const key = `dokumen/${terbit.id}/${PREFIX}privat.png`

  mkdirSync(join(UPLOAD_ROOT, dirname(key)), { recursive: true })
  writeFileSync(join(UPLOAD_ROOT, key), PNG_1PX)

  const asetPrivat = await prisma.mediaAsset.create({
    data: {
      documentId: terbit.id,
      kind: 'SCREENSHOT',
      fileKey: key,
      fileUrl: `/media/${key}`,
      mimeType: 'image/png',
      fileSize: PNG_1PX.byteLength,
      altId: 'Bukti privat uji E2E',
      isPublic: false,
      redactionConfirmed: false,
    },
  })

  return { terbit, draft, asetPrivat }
}

export async function cleanup() {
  const documents = await prisma.knowledgeDocument.findMany({
    where: { slug: { startsWith: PREFIX } },
    select: { id: true },
  })

  const ids = documents.map((document) => document.id)

  // Berkas fisiknya ikut dibuang — baris database yang hilang tidak
  // menghapus apa pun di disk.
  for (const id of ids) {
    rmSync(join(UPLOAD_ROOT, 'dokumen', id), { recursive: true, force: true })
  }

  await prisma.mediaAsset.deleteMany({ where: { documentId: { in: ids } } })
  await prisma.knowledgeRevision.deleteMany({
    where: { documentId: { in: ids } },
  })
  await prisma.knowledgeDocumentTag.deleteMany({
    where: { documentId: { in: ids } },
  })
  await prisma.knowledgeDocument.deleteMany({ where: { id: { in: ids } } })
  await prisma.auditLog.deleteMany({ where: { entityId: { in: ids } } })

  return ids.length
}

export async function disconnect() {
  await prisma.$disconnect()
}
