import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { CertificateInput } from '@/lib/schemas/admin'

import { recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

const certificateSelect = {
  id: true,
  name: true,
  issuer: true,
  issueDate: true,
  expiryDate: true,
  credentialUrl: true,
  skills: true,
} satisfies Prisma.CertificateSelect

export type PublicCertificate = Prisma.CertificateGetPayload<{
  select: typeof certificateSelect
}>

/**
 * `imageUrl` sengaja tidak diambil di Fase 3 — gambar sertifikat
 * disimpan di R2 dan baru dikelola di Fase 5. Menampilkan URL mentah
 * sebelum ada kebijakan akses berkas berisiko membocorkan aset privat.
 *
 * Sertifikat tanpa `credentialUrl` tetap tampil, tapi tanpa penanda
 * terverifikasi (00_CONTENT_INVENTORY §4).
 */
export const getPublishedCertificates = unstable_cache(
  async (): Promise<PublicCertificate[]> =>
    prisma.certificate.findMany({
      where: { status: 'PUBLISHED' },
      select: certificateSelect,
      orderBy: [{ sortOrder: 'asc' }, { issueDate: 'desc' }],
    }),
  ['certificate:published'],
  { tags: ['certificates'] },
)

// ─── Admin ───────────────────────────────────────────────

export async function getAdminCertificates() {
  await requireAdminPage()

  return prisma.certificate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { issueDate: 'desc' }],
  })
}

export async function getAdminCertificateById(id: string) {
  await requireAdminPage()

  return prisma.certificate.findUnique({ where: { id } })
}

export async function saveCertificate(input: CertificateInput) {
  const session = await requireAdmin()

  const { id, ...data } = input

  if (id) {
    await prisma.certificate.update({ where: { id }, data })
  } else {
    await prisma.certificate.create({ data })
  }

  await recordAudit({
    actorId: session.user.id,
    action: id ? 'update' : 'create',
    entityType: 'Certificate',
    entityId: id,
    metadata: { name: data.name, status: data.status },
  })
}

export async function deleteCertificate(id: string) {
  const session = await requireAdmin()

  await prisma.certificate.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'Certificate',
    entityId: id,
  })
}
