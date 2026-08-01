import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { ExperienceInput } from '@/lib/schemas/admin'

import { recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

const experienceSelect = {
  id: true,
  company: true,
  positionId: true,
  positionEn: true,
  summaryId: true,
  summaryEn: true,
  location: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  achievementsId: true,
  achievementsEn: true,
  tools: true,
} satisfies Prisma.ExperienceSelect

export type PublicExperience = Prisma.ExperienceGetPayload<{
  select: typeof experienceSelect
}>

/** Field wajib EN untuk `Experience` (08_I18N_FALLBACK_POLICY §2). */
export const EXPERIENCE_REQUIRED_EN = ['position', 'summary'] as const

/**
 * `achievementsId` / `achievementsEn` bertipe `Json?` di Prisma, jadi
 * bentuknya tidak dijamin oleh tipe. Normalisasi ke `string[]` di sini
 * supaya komponen tidak perlu menebak.
 */
export function toAchievements(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is string => typeof item === 'string')
}

export const getPublishedExperiences = unstable_cache(
  async (): Promise<PublicExperience[]> =>
    prisma.experience.findMany({
      where: { status: 'PUBLISHED' },
      select: experienceSelect,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    }),
  ['experience:published'],
  { tags: ['experience'] },
)

// ─── Admin ───────────────────────────────────────────────

export async function getAdminExperiences() {
  await requireAdminPage()

  return prisma.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  })
}

export async function getAdminExperienceById(id: string) {
  await requireAdminPage()

  return prisma.experience.findUnique({ where: { id } })
}

/**
 * `publishedAt` diisi sekali saat entri PERTAMA KALI terbit, lalu
 * dibiarkan. Menimpanya setiap penyuntingan akan membuat riwayat
 * terbit jadi bohong.
 */
export async function saveExperience(input: ExperienceInput) {
  const session = await requireAdmin()

  const { id, isCurrent, endDate, ...rest } = input

  const data = {
    ...rest,
    isCurrent,
    // Entri yang masih berjalan tidak boleh menyimpan tanggal selesai.
    endDate: isCurrent ? null : endDate,
  }

  if (id) {
    const existing = await prisma.experience.findUnique({
      where: { id },
      select: { publishedAt: true },
    })

    await prisma.experience.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          input.status === 'PUBLISHED' && !existing?.publishedAt
            ? new Date()
            : existing?.publishedAt,
      },
    })

    await recordAudit({
      actorId: session.user.id,
      action: input.status === 'PUBLISHED' ? 'publish' : 'update',
      entityType: 'Experience',
      entityId: id,
      metadata: { company: data.company, status: input.status },
    })

    return
  }

  const created = await prisma.experience.create({
    data: {
      ...data,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    },
    select: { id: true },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'create',
    entityType: 'Experience',
    entityId: created.id,
    metadata: { company: data.company, status: input.status },
  })
}

export async function deleteExperience(id: string) {
  const session = await requireAdmin()

  await prisma.experience.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'Experience',
    entityId: id,
  })
}
