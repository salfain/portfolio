import 'server-only'

import { prisma } from '@/lib/prisma'

import { requireAdminPage } from './_guards'

/**
 * Log audit.
 *
 * Mencatat SIAPA mengubah APA dan KAPAN. Untuk situs satu admin ini bukan
 * soal saling mengawasi, melainkan menjawab "kenapa dokumen ini berubah
 * minggu lalu" tanpa harus menebak — dan memberi jejak bila kredensial
 * admin pernah bocor.
 *
 * Lihat docs/rules/06_SECURITY.md §8.
 */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'

export type AuditEntity =
  | 'KnowledgeDocument'
  | 'KnowledgeCategory'
  | 'KnowledgeTag'
  | 'Project'
  | 'Experience'
  | 'Skill'
  | 'Certificate'
  | 'SiteProfile'
  | 'SiteSetting'
  | 'ContactMessage'
  | 'MediaAsset'

/**
 * Catat satu aksi admin.
 *
 * TIDAK PERNAH melempar. Kegagalan menulis log tidak boleh membatalkan
 * mutasi yang sudah berhasil — kehilangan satu baris log jauh lebih ringan
 * daripada pengguna mengira simpanannya gagal lalu menyimpan dua kali.
 *
 * `metadata` hanya boleh memuat pengenal dan nama yang aman ditampilkan.
 * Jangan pernah menaruh isi dokumen di sini: log audit tidak ikut alur
 * redaksi, jadi apa pun yang masuk ke sini lolos dari checklist redaksi.
 */
export async function recordAudit(params: {
  actorId: string | null
  action: AuditAction
  entityType: AuditEntity
  entityId?: string | null
  metadata?: Record<string, string | number | boolean | null>
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? undefined,
      },
    })
  } catch (error) {
    console.error('Gagal menulis log audit:', (error as Error)?.name)
  }
}

export async function getAuditLog(limit = 100) {
  await requireAdminPage()

  return prisma.auditLog.findMany({
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,
      actor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
