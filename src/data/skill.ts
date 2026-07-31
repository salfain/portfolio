import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { SkillInput } from '@/lib/schemas/admin'

import { requireAdmin, requireAdminPage } from './_guards'

const skillSelect = {
  id: true,
  name: true,
  category: true,
  level: true,
  isFeatured: true,
} satisfies Prisma.SkillSelect

export type PublicSkill = Prisma.SkillGetPayload<{
  select: typeof skillSelect
}>

export type SkillGroup = {
  category: string
  skills: PublicSkill[]
}

export const getPublishedSkills = unstable_cache(
  async (): Promise<PublicSkill[]> =>
    prisma.skill.findMany({
      where: { status: 'PUBLISHED' },
      select: skillSelect,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
  ['skill:published'],
  { tags: ['skills'] },
)

/**
 * Kelompokkan per kategori tanpa query tambahan — satu query di atas
 * sudah terurut per kategori, jadi pengelompokan cukup di memori.
 *
 * Nama kategori adalah data yang diisi pemilik, bukan string UI, jadi
 * ditampilkan apa adanya tanpa terjemahan.
 */
export function groupSkillsByCategory(skills: PublicSkill[]): SkillGroup[] {
  const groups = new Map<string, PublicSkill[]>()

  for (const skill of skills) {
    const existing = groups.get(skill.category)

    if (existing) {
      existing.push(skill)
    } else {
      groups.set(skill.category, [skill])
    }
  }

  return Array.from(groups, ([category, items]) => ({
    category,
    skills: items,
  }))
}

// ─── Admin ───────────────────────────────────────────────

export async function getAdminSkills() {
  await requireAdminPage()

  return prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
}

export async function getAdminSkillById(id: string) {
  await requireAdminPage()

  return prisma.skill.findUnique({ where: { id } })
}

export async function saveSkill(input: SkillInput) {
  await requireAdmin()

  const { id, ...data } = input

  if (id) {
    await prisma.skill.update({ where: { id }, data })
    return
  }

  await prisma.skill.create({ data })
}

export async function deleteSkill(id: string) {
  await requireAdmin()

  await prisma.skill.delete({ where: { id } })
}
