import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Difficulty, KnowledgeType, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

/**
 * Knowledge Base publik.
 *
 * SETIAP query di berkas ini menyaring `status: 'PUBLISHED'`. Dokumen
 * draft dan arsip tidak boleh bocor lewat listing, kategori, tag, maupun
 * pencarian — dan slug yang tidak terbit harus menghasilkan 404, bukan 403
 * (05_ROUTE_AND_PRIORITY_MAP §6).
 */

const PUBLISHED = { status: 'PUBLISHED' } as const

/** Bentuk kartu — listing tidak butuh isi dokumen. */
const documentCardSelect = {
  id: true,
  slug: true,
  type: true,
  documentCode: true,
  titleId: true,
  titleEn: true,
  summaryId: true,
  summaryEn: true,
  difficulty: true,
  estimatedMinutes: true,
  tools: true,
  isFeatured: true,
  publishedAt: true,
  updatedAt: true,
  category: {
    select: { slug: true, nameId: true, nameEn: true },
  },
  tags: {
    select: { tag: { select: { name: true, slug: true } } },
  },
} satisfies Prisma.KnowledgeDocumentSelect

export type DocumentCard = Prisma.KnowledgeDocumentGetPayload<{
  select: typeof documentCardSelect
}>

/** Bentuk detail — menambah isi, media, dan tautan proyek. */
const documentDetailSelect = {
  ...documentCardSelect,
  version: true,
  contentIdJson: true,
  contentEnJson: true,
  metadata: true,
  createdAt: true,
  media: {
    // Aset privat TIDAK ikut. Default `isPublic` memang false, dan
    // menyerahkan penyaringan ke komponen berarti satu komponen lupa
    // sama dengan bukti internal terbit ke publik.
    where: { isPublic: true, redactionConfirmed: true },
    select: {
      id: true,
      kind: true,
      fileUrl: true,
      thumbnailUrl: true,
      width: true,
      height: true,
      altId: true,
      altEn: true,
      captionId: true,
      captionEn: true,
      titleId: true,
      titleEn: true,
      tool: true,
      testDate: true,
      isCover: true,
    },
    orderBy: { sortOrder: 'asc' },
  },
  projectLinks: {
    where: { project: PUBLISHED },
    select: {
      note: true,
      project: { select: { slug: true, titleId: true, titleEn: true } },
    },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.KnowledgeDocumentSelect

export type DocumentDetail = Prisma.KnowledgeDocumentGetPayload<{
  select: typeof documentDetailSelect
}>

// ─── Listing & filter ────────────────────────────────────

export type DocumentFilters = {
  type?: KnowledgeType
  categorySlug?: string
  tagSlug?: string
  difficulty?: Difficulty
  /** Kata kunci bebas. Pencarian penuh (tsvector) baru di Fase 7. */
  query?: string
}

/**
 * Daftar dokumen terbit sesuai filter.
 *
 * SENGAJA tidak di-cache. `unstable_cache` memasukkan argumen ke kunci
 * cache, jadi setiap kata kunci pencarian akan membuat entri baru dan
 * cache-nya tumbuh tanpa batas. Listing tanpa filter tetap murah karena
 * `select`-nya sempit dan jumlah dokumennya kecil.
 */
export async function getPublishedDocuments(
  filters: DocumentFilters = {},
): Promise<DocumentCard[]> {
  const { type, categorySlug, tagSlug, difficulty, query } = filters

  const where: Prisma.KnowledgeDocumentWhereInput = {
    ...PUBLISHED,
    ...(type ? { type } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    ...(query
      ? {
          OR: [
            { titleId: { contains: query, mode: 'insensitive' } },
            { titleEn: { contains: query, mode: 'insensitive' } },
            { summaryId: { contains: query, mode: 'insensitive' } },
            { summaryEn: { contains: query, mode: 'insensitive' } },
            { documentCode: { contains: query, mode: 'insensitive' } },
            { tools: { has: query } },
          ],
        }
      : {}),
  }

  return prisma.knowledgeDocument.findMany({
    where,
    select: documentCardSelect,
    orderBy: [
      { isFeatured: 'desc' },
      { sortOrder: 'asc' },
      { publishedAt: 'desc' },
    ],
  })
}

export const getFeaturedDocuments = unstable_cache(
  async (limit = 3): Promise<DocumentCard[]> =>
    prisma.knowledgeDocument.findMany({
      where: { ...PUBLISHED, isFeatured: true },
      select: documentCardSelect,
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      take: limit,
    }),
  ['knowledge:featured'],
  { tags: ['knowledge'] },
)

/** Dokumen terbaru lintas tipe — dipakai pratinjau di beranda. */
export const getLatestDocuments = unstable_cache(
  async (limit = 3): Promise<DocumentCard[]> =>
    prisma.knowledgeDocument.findMany({
      where: PUBLISHED,
      select: documentCardSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    }),
  ['knowledge:latest'],
  { tags: ['knowledge'] },
)

// ─── Detail ──────────────────────────────────────────────

export const getPublishedDocumentBySlug = unstable_cache(
  async (slug: string): Promise<DocumentDetail | null> =>
    prisma.knowledgeDocument.findFirst({
      // findFirst, bukan findUnique: `status` ikut ke dalam WHERE supaya
      // dokumen draft tidak pernah terambil lalu disaring di aplikasi.
      where: { slug, ...PUBLISHED },
      select: documentDetailSelect,
    }),
  ['knowledge:by-slug'],
  { tags: ['knowledge'] },
)

/** Slug terbit per tipe — untuk `generateStaticParams`. */
export const getPublishedDocumentSlugs = unstable_cache(
  async (type?: KnowledgeType): Promise<string[]> => {
    const rows = await prisma.knowledgeDocument.findMany({
      where: { ...PUBLISHED, ...(type ? { type } : {}) },
      select: { slug: true },
    })

    return rows.map((row) => row.slug)
  },
  ['knowledge:slugs'],
  { tags: ['knowledge'] },
)

/**
 * Riwayat revisi satu dokumen.
 *
 * `contentIdJson` revisi TIDAK diambil: halaman publik hanya menampilkan
 * garis waktu "apa yang berubah dan kapan", bukan isi versi lama. Isi versi
 * lama bisa memuat data yang sudah diredaksi di versi terbaru.
 */
export const getDocumentRevisions = unstable_cache(
  async (documentId: string) =>
    prisma.knowledgeRevision.findMany({
      where: { documentId },
      select: {
        id: true,
        version: true,
        changeSummary: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ['knowledge:revisions'],
  { tags: ['knowledge'] },
)

/**
 * Dokumen terkait: kategori sama, tipe sama diprioritaskan.
 *
 * Peringkat yang sungguh-sungguh (berbasis tag bersama) ada di Fase 7.
 */
export const getRelatedDocuments = unstable_cache(
  async (
    documentId: string,
    categorySlug: string | null,
    limit = 3,
  ): Promise<DocumentCard[]> =>
    prisma.knowledgeDocument.findMany({
      where: {
        ...PUBLISHED,
        id: { not: documentId },
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      select: documentCardSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    }),
  ['knowledge:related'],
  { tags: ['knowledge'] },
)

// ─── Kategori, tag, hitungan ─────────────────────────────

/**
 * Kategori yang PUNYA dokumen terbit.
 *
 * Kategori kosong tidak ditampilkan: halaman kategori tanpa isi adalah
 * jalan buntu bagi pengunjung dan halaman tipis bagi mesin pencari.
 */
export const getKnowledgeCategories = unstable_cache(
  async () => {
    const rows = await prisma.knowledgeCategory.findMany({
      select: {
        slug: true,
        nameId: true,
        nameEn: true,
        descriptionId: true,
        descriptionEn: true,
        icon: true,
        _count: { select: { documents: { where: PUBLISHED } } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return rows.filter((row) => row._count.documents > 0)
  },
  ['knowledge:categories'],
  { tags: ['knowledge'] },
)

export const getKnowledgeCategoryBySlug = unstable_cache(
  async (slug: string) =>
    prisma.knowledgeCategory.findUnique({
      where: { slug },
      select: {
        slug: true,
        nameId: true,
        nameEn: true,
        descriptionId: true,
        descriptionEn: true,
      },
    }),
  ['knowledge:category'],
  { tags: ['knowledge'] },
)

export const getKnowledgeTags = unstable_cache(
  async () => {
    const rows = await prisma.knowledgeTag.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { documents: { where: { document: PUBLISHED } } } },
      },
      orderBy: { name: 'asc' },
    })

    return rows.filter((row) => row._count.documents > 0)
  },
  ['knowledge:tags'],
  { tags: ['knowledge'] },
)

export const getKnowledgeTagBySlug = unstable_cache(
  async (slug: string) =>
    prisma.knowledgeTag.findUnique({
      where: { slug },
      select: { name: true, slug: true },
    }),
  ['knowledge:tag'],
  { tags: ['knowledge'] },
)

export type KnowledgeCounts = Record<KnowledgeType, number> & { total: number }

/** Jumlah dokumen terbit per tipe — dipakai landing dan navigasi. */
export const getKnowledgeCounts = unstable_cache(
  async (): Promise<KnowledgeCounts> => {
    const rows = await prisma.knowledgeDocument.groupBy({
      by: ['type'],
      where: PUBLISHED,
      _count: { _all: true },
    })

    const counts: KnowledgeCounts = {
      SOP: 0,
      LAB: 0,
      INCIDENT: 0,
      ARTICLE: 0,
      total: 0,
    }

    for (const row of rows) {
      counts[row.type] = row._count._all
      counts.total += row._count._all
    }

    return counts
  },
  ['knowledge:counts'],
  { tags: ['knowledge'] },
)
