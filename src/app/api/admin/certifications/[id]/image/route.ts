import { randomUUID } from 'node:crypto'

import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { recordAudit } from '@/data/audit'
import { requireAdmin } from '@/data/_guards'
import { prisma } from '@/lib/prisma'
import {
  deleteCertificateImage,
  detectCertificateImageType,
  getCertificateImageKey,
  getCertificateImageUrl,
  getObjectStorageConfig,
  MAX_CERTIFICATE_IMAGE_BYTES,
  putCertificateImage,
} from '@/lib/certificate-image-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request, { params }: RouteContext) {
  let session

  try {
    session = await requireAdmin()
  } catch {
    return errorResponse('Tidak berwenang.', 404)
  }

  const config = getObjectStorageConfig()
  if (!config)
    return errorResponse('Penyimpanan gambar belum dikonfigurasi.', 503)

  const { id } = await params
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    select: { id: true, imageUrl: true },
  })

  if (!certificate) return errorResponse('Sertifikat tidak ditemukan.', 404)

  const formData = await request.formData()
  const entry = formData.get('image')

  if (!(entry instanceof File))
    return errorResponse('Pilih gambar terlebih dahulu.', 400)

  if (entry.size === 0 || entry.size > MAX_CERTIFICATE_IMAGE_BYTES) {
    return errorResponse(
      'Ukuran gambar harus lebih dari 0 dan maksimal 5 MB.',
      413,
    )
  }

  const bytes = new Uint8Array(await entry.arrayBuffer())
  const imageType = detectCertificateImageType(bytes)

  if (!imageType)
    return errorResponse('Format gambar harus JPG, PNG, atau WebP.', 415)

  const key = `certificates/${id}/${randomUUID()}.${imageType.extension}`
  const imageUrl = getCertificateImageUrl(config, key)

  try {
    await putCertificateImage(config, key, bytes, imageType.mimeType)
    await prisma.certificate.update({ where: { id }, data: { imageUrl } })
  } catch (error) {
    await deleteCertificateImage(config, key).catch(() => undefined)
    console.error('Unggah gambar sertifikat gagal:', (error as Error)?.name)
    return errorResponse('Gambar gagal diunggah. Coba lagi.', 500)
  }

  const oldKey = getCertificateImageKey(config, certificate.imageUrl)
  if (oldKey && oldKey !== key)
    await deleteCertificateImage(config, oldKey).catch(() => undefined)

  await recordAudit({
    actorId: session.user.id,
    action: 'update',
    entityType: 'Certificate',
    entityId: id,
    metadata: { image: true },
  })
  revalidateTag('certificates', { expire: 0 })

  return NextResponse.json({ url: imageUrl })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  let session

  try {
    session = await requireAdmin()
  } catch {
    return errorResponse('Tidak berwenang.', 404)
  }

  const config = getObjectStorageConfig()
  if (!config)
    return errorResponse('Penyimpanan gambar belum dikonfigurasi.', 503)

  const { id } = await params
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    select: { id: true, imageUrl: true },
  })

  if (!certificate) return errorResponse('Sertifikat tidak ditemukan.', 404)

  const key = getCertificateImageKey(config, certificate.imageUrl)
  if (key) await deleteCertificateImage(config, key).catch(() => undefined)

  await prisma.certificate.update({ where: { id }, data: { imageUrl: null } })
  await recordAudit({
    actorId: session.user.id,
    action: 'update',
    entityType: 'Certificate',
    entityId: id,
    metadata: { image: false },
  })
  revalidateTag('certificates', { expire: 0 })

  return NextResponse.json({ ok: true })
}
