import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { ProjectInput } from '@/lib/schemas/admin'

import { recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

/** Bentuk kartu — halaman listing tidak butuh isi studi kasus. */
const projectCardSelect = {
  id: true,
  slug: true,
  titleId: true,
  titleEn: true,
  summaryId: true,
  summaryEn: true,
  tools: true,
  isFeatured: true,
  publishedAt: true,
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.ProjectSelect

/** Bentuk detail — seluruh blok studi kasus. */
const projectDetailSelect = {
  ...projectCardSelect,
  problemId: true,
  problemEn: true,
  solutionId: true,
  solutionEn: true,
  resultId: true,
  resultEn: true,
  roleId: true,
  roleEn: true,
  repositoryUrl: true,
  demoUrl: true,
  category: {
    select: { slug: true, nameId: true, nameEn: true },
  },
} satisfies Prisma.ProjectSelect

export type ProjectCard = Prisma.ProjectGetPayload<{
  select: typeof projectCardSelect
}>

export type ProjectDetail = Prisma.ProjectGetPayload<{
  select: typeof projectDetailSelect
}>

/** Field wajib EN untuk `Project` (08_I18N_FALLBACK_POLICY §2). */
export const PROJECT_REQUIRED_EN = ['title', 'summary'] as const

export const getPublishedProjects = unstable_cache(
  async (): Promise<ProjectCard[]> =>
    prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: projectCardSelect,
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    }),
  ['project:published'],
  { tags: ['projects'] },
)

export const getFeaturedProjects = unstable_cache(
  async (limit = 3): Promise<ProjectCard[]> =>
    prisma.project.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      select: projectCardSelect,
      orderBy: { sortOrder: 'asc' },
      take: limit,
    }),
  ['project:featured'],
  { tags: ['projects'] },
)

/**
 * `null` untuk slug yang tidak ada MAUPUN yang berstatus draft/arsip.
 * Pemanggil wajib memetakannya ke `notFound()` — 403 mengonfirmasi
 * keberadaan dokumen (05_ROUTE_AND_PRIORITY_MAP §6).
 */
export const getPublishedProjectBySlug = unstable_cache(
  async (slug: string): Promise<ProjectDetail | null> =>
    prisma.project.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: projectDetailSelect,
    }),
  ['project:by-slug'],
  { tags: ['projects'] },
)

/** Untuk `generateStaticParams` — hanya slug yang benar-benar terbit. */
export const getPublishedProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    })

    return rows.map((row) => row.slug)
  },
  ['project:slugs'],
  { tags: ['projects'] },
)

// ─── Admin ───────────────────────────────────────────────

export async function getAdminProjects() {
  await requireAdminPage()

  return prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function getAdminProjectById(id: string) {
  await requireAdminPage()

  return prisma.project.findUnique({ where: { id } })
}

/** `true` bila slug sudah dipakai proyek LAIN. */
export async function isSlugTaken(slug: string, exceptId?: string | null) {
  await requireAdmin()

  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  })

  return existing !== null && existing.id !== exceptId
}

export async function saveProject(input: ProjectInput) {
  const session = await requireAdmin()

  const { id, ...data } = input

  if (id) {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { publishedAt: true },
    })

    await prisma.project.update({
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
      entityType: 'Project',
      entityId: id,
      metadata: { slug: data.slug, status: input.status },
    })

    return
  }

  const created = await prisma.project.create({
    data: {
      ...data,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    },
    select: { id: true },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'create',
    entityType: 'Project',
    entityId: created.id,
    metadata: { slug: data.slug, status: input.status },
  })
}

export async function deleteProject(id: string) {
  const session = await requireAdmin()

  await prisma.project.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'Project',
    entityId: id,
  })
}
