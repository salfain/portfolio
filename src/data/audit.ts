import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { requireAdminPage } from './_guards'

/**
 * Jejak audit untuk perubahan isi.
 *
 * Yang dicatat hanya APA yang berubah dan SIAPA yang mengubahnya — bukan
 * isinya. Menyalin isi dokumen ke `metadata` berarti data yang sudah
 * diredaksi di dokumen tetap hidup di tabel audit, di luar jangkauan
 * checklist redaksi (docs/phase-0/02_REDACTION_CHECKLIST.md).
 *
 * Alamat IP juga tidak dicatat: PRD bab 17 melarang menyimpan IP mentah,
 * dan halaman admin hanya bisa diakses satu orang yang sudah terautentikasi.
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'delete'

export async function recordAudit(input: {
  actorId: string | null
  action: AuditAction
  entityType: string
  entityId?: string | null
  metadata?: Prisma.InputJsonValue
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata,
    },
  })
}

/**
 * Tentukan aksi audit dari perpindahan status.
 *
 * `null` sebagai status lama berarti entitas baru dibuat.
 */
export function auditActionForStatus(
  previous: string | null,
  next: string,
): AuditAction {
  if (previous === null) return 'create'
  if (previous !== 'PUBLISHED' && next === 'PUBLISHED') return 'publish'
  if (previous === 'PUBLISHED' && next === 'ARCHIVED') return 'archive'
  if (previous === 'PUBLISHED' && next !== 'PUBLISHED') return 'unpublish'

  return 'update'
}

export async function getAuditLog(take = 100) {
  await requireAdminPage()

  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: { actor: { select: { name: true, email: true } } },
  })
}
