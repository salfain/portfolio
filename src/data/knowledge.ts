import 'server-only'

import { unstable_cache } from 'next/cache'
import { Prisma, type Difficulty, type KnowledgeType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type {
  CategoryInput,
  KnowledgeDocumentInput,
  TagInput,
} from '@/lib/schemas/knowledge-admin'

import { recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

import { searchDocumentIds, searchRelatedDocumentIds } from './search'

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
      // Dipakai memisahkan bukti yang bisa dilihat dari yang diunduh
      // (Fase 6), dan menampilkan ukuran berkas di daftar unduhan.
      mimeType: true,
      fileSize: true,
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
  }

  /**
   * Tanpa kata kunci: urutan editorial seperti biasa.
   *
   * Dengan kata kunci: urutan RELEVANSI dari full-text search. Mengurutkan
   * hasil pencarian menurut "pilihan" dan `sortOrder` berarti dokumen
   * unggulan selalu di atas meski kata kuncinya nyaris tidak menyinggungnya
   * — dan pengunjung yang mengetik kata kunci sedang meminta yang paling
   * cocok, bukan yang paling dipromosikan.
   */
  if (!query || query.trim() === '') {
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

  const rankedIds = await searchDocumentIds(query)

  if (rankedIds.length === 0) return []

  const documents = await prisma.knowledgeDocument.findMany({
    where: { ...where, id: { in: rankedIds } },
    select: documentCardSelect,
  })

  // Urutan relevansi hilang saat `findMany` mengambil ulang barisnya;
  // dipasang kembali di sini, bukan diserahkan ke database.
  const order = new Map(rankedIds.map((id, index) => [id, index]))

  return documents.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  )
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
/**
 * Dokumen terkait, diperingkat menurut kemiripan isi (Fase 7).
 *
 * Sebelumnya "terkait" berarti berkategori sama lalu diurutkan tanggal —
 * yang membuat dokumen terbaru di kategori itu selalu muncul, relevan atau
 * tidak. Peringkatnya sekarang dihitung di `searchRelatedDocumentIds`.
 *
 * `categorySlug` tetap diterima supaya pemanggil tidak perlu berubah, tapi
 * tidak lagi dipakai sebagai penyaring — kategori kini dorongan, bukan
 * syarat.
 */
export const getRelatedDocuments = unstable_cache(
  async (
    documentId: string,
    _categorySlug: string | null,
    limit = 3,
  ): Promise<DocumentCard[]> => {
    const rankedIds = await searchRelatedDocumentIds(documentId, limit)

    if (rankedIds.length === 0) return []

    const documents = await prisma.knowledgeDocument.findMany({
      where: { ...PUBLISHED, id: { in: rankedIds } },
      select: documentCardSelect,
    })

    const order = new Map(rankedIds.map((id, index) => [id, index]))

    return documents.sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    )
  },
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

// ─── Admin ───────────────────────────────────────────────

export async function getAdminDocuments() {
  await requireAdminPage()

  return prisma.knowledgeDocument.findMany({
    select: {
      id: true,
      slug: true,
      type: true,
      status: true,
      documentCode: true,
      titleId: true,
      titleEn: true,
      isFeatured: true,
      updatedAt: true,
      category: { select: { nameId: true } },
      _count: { select: { revisions: true, media: true } },
    },
    orderBy: [{ updatedAt: 'desc' }],
  })
}

export async function getAdminDocumentById(id: string) {
  await requireAdminPage()

  return prisma.knowledgeDocument.findUnique({
    where: { id },
    include: { tags: { select: { tag: { select: { name: true } } } } },
  })
}

export async function isDocumentSlugTaken(
  slug: string,
  exceptId?: string | null,
) {
  await requireAdmin()

  const existing = await prisma.knowledgeDocument.findUnique({
    where: { slug },
    select: { id: true },
  })

  return existing !== null && existing.id !== exceptId
}

/**
 * Simpan dokumen.
 *
 * Menerbitkan perubahan pada dokumen yang SUDAH terbit selalu membuat satu
 * entri `KnowledgeRevision` — kriteria penerimaan Fase 5. Revisi merekam
 * isi SEBELUM perubahan, bukan sesudahnya, supaya riwayatnya bisa dibaca
 * sebagai "dulu begini, lalu diubah".
 *
 * Tag ditulis ulang seluruhnya (hapus lalu pasang) alih-alih dihitung
 * selisihnya: jumlah tag per dokumen kecil, dan menghitung selisih di sini
 * menambah cabang logika yang mudah salah tanpa manfaat terukur.
 */
export async function saveDocument(
  input: KnowledgeDocumentInput,
  authorId: string,
) {
  const session = await requireAdmin()

  const {
    id,
    tagNames,
    categoryId,
    changeSummary,
    // Dipisahkan supaya tidak ikut ke Prisma — `wasPublished` hanya
    // dipakai skema Zod untuk mewajibkan changeSummary di form. Apakah
    // dokumennya benar-benar sudah terbit tetap dibaca dari database
    // di bawah, bukan dari nilai yang dikirim klien.
    wasPublished: _wasPublished,
    contentIdJson,
    contentEnJson,
    ...rest
  } = input

  /**
   * Prisma menuntut `InputJsonValue`, yang menuntut index signature.
   * `ProseMirrorDocument` adalah objek berbentuk tetap, jadi tidak cocok
   * secara struktural walau isinya JSON yang sah. Konversinya dilakukan
   * SEKALI di sini, di batas database — bukan disebar sebagai `as any`
   * di setiap pemanggilan.
   */
  const fields = {
    ...rest,
    contentIdJson: contentIdJson as unknown as Prisma.InputJsonValue,
    contentEnJson: (contentEnJson ?? Prisma.JsonNull) as
      Prisma.InputJsonValue | typeof Prisma.JsonNull,
  }

  return prisma.$transaction(async (tx) => {
    const tagIds = await upsertTagsTx(tx, tagNames)

    if (id) {
      const before = await tx.knowledgeDocument.findUnique({
        where: { id },
        select: {
          status: true,
          version: true,
          publishedAt: true,
          contentIdJson: true,
          contentEnJson: true,
          metadata: true,
        },
      })

      if (!before) throw new Error('DOCUMENT_NOT_FOUND')

      // Revisi hanya untuk dokumen yang sudah pernah terbit. Menyunting
      // draft berulang kali tidak menghasilkan riwayat yang berguna.
      if (before.status === 'PUBLISHED' && changeSummary) {
        await tx.knowledgeRevision.create({
          data: {
            documentId: id,
            version: before.version,
            changeSummary,
            contentIdJson: (before.contentIdJson ??
              {}) as Prisma.InputJsonValue,
            contentEnJson: (before.contentEnJson ??
              Prisma.JsonNull) as Prisma.InputJsonValue,
            metadata: (before.metadata ??
              Prisma.JsonNull) as Prisma.InputJsonValue,
            createdById: authorId,
          },
        })
      }

      await tx.knowledgeDocumentTag.deleteMany({ where: { documentId: id } })

      await tx.knowledgeDocument.update({
        where: { id },
        data: {
          ...fields,
          categoryId: categoryId ?? null,
          publishedAt:
            fields.status === 'PUBLISHED' && !before.publishedAt
              ? new Date()
              : before.publishedAt,
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        },
      })

      await recordAudit({
        actorId: session.user.id,
        action: fields.status === 'PUBLISHED' ? 'publish' : 'update',
        entityType: 'KnowledgeDocument',
        entityId: id,
        metadata: { slug: fields.slug, status: fields.status },
      })

      return id
    }

    const created = await tx.knowledgeDocument.create({
      data: {
        ...fields,
        authorId,
        categoryId: categoryId ?? null,
        publishedAt: fields.status === 'PUBLISHED' ? new Date() : null,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
      select: { id: true },
    })

    await recordAudit({
      actorId: session.user.id,
      action: 'create',
      entityType: 'KnowledgeDocument',
      entityId: created.id,
      metadata: { slug: fields.slug, status: fields.status },
    })

    return created.id
  })
}

export async function deleteDocument(id: string) {
  const session = await requireAdmin()

  const removed = await prisma.knowledgeDocument.delete({
    where: { id },
    select: { slug: true },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeDocument',
    entityId: id,
    metadata: { slug: removed.slug },
  })
}

/**
 * Pastikan setiap nama tag punya baris, lalu kembalikan id-nya.
 *
 * Dijalankan DI DALAM transaksi pemanggil supaya tag tidak tercipta saat
 * penyimpanan dokumennya sendiri gagal — kalau tidak, percobaan simpan
 * yang gagal meninggalkan tag yatim di daftar tag.
 *
 * `slug` disamakan dengan `name`: tag memang sudah dibatasi huruf kecil,
 * angka, dan tanda hubung oleh skema Zod-nya.
 */
async function upsertTagsTx(
  tx: Prisma.TransactionClient,
  names: string[],
): Promise<string[]> {
  const ids: string[] = []

  for (const name of names) {
    const tag = await tx.knowledgeTag.upsert({
      where: { slug: name },
      update: {},
      create: { name, slug: name },
      select: { id: true },
    })

    ids.push(tag.id)
  }

  return ids
}

// ─── Kategori (admin) ────────────────────────────────────

export async function getAdminCategories() {
  await requireAdminPage()

  return prisma.knowledgeCategory.findMany({
    select: {
      id: true,
      slug: true,
      nameId: true,
      nameEn: true,
      descriptionId: true,
      descriptionEn: true,
      sortOrder: true,
      _count: { select: { documents: true, projects: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getAdminCategoryById(id: string) {
  await requireAdminPage()

  return prisma.knowledgeCategory.findUnique({ where: { id } })
}

export async function saveCategory(input: CategoryInput) {
  const session = await requireAdmin()

  const { id, ...data } = input

  if (id) {
    await prisma.knowledgeCategory.update({ where: { id }, data })
  } else {
    await prisma.knowledgeCategory.create({ data })
  }

  await recordAudit({
    actorId: session.user.id,
    action: id ? 'update' : 'create',
    entityType: 'KnowledgeCategory',
    entityId: id,
    metadata: { slug: data.slug },
  })
}

/**
 * Hapus kategori.
 *
 * Relasinya `onDelete` default (restrict) di sisi dokumen dan proyek, jadi
 * kategori yang masih dipakai akan menolak dihapus di tingkat database.
 * Diperiksa lebih dulu di sini supaya pesannya bisa dibaca manusia.
 */
export async function deleteCategory(id: string) {
  const session = await requireAdmin()

  const inUse = await prisma.knowledgeCategory.findUnique({
    where: { id },
    select: { _count: { select: { documents: true, projects: true } } },
  })

  if (inUse && inUse._count.documents + inUse._count.projects > 0) {
    throw new Error('CATEGORY_IN_USE')
  }

  await prisma.knowledgeCategory.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeCategory',
    entityId: id,
  })
}

// ─── Tag (admin) ─────────────────────────────────────────

export async function getAdminTags() {
  await requireAdminPage()

  return prisma.knowledgeTag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { documents: true, projects: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function saveTag(input: TagInput) {
  const session = await requireAdmin()

  const { id, name } = input

  if (id) {
    await prisma.knowledgeTag.update({
      where: { id },
      data: { name, slug: name },
    })
  } else {
    await prisma.knowledgeTag.create({ data: { name, slug: name } })
  }

  await recordAudit({
    actorId: session.user.id,
    action: id ? 'update' : 'create',
    entityType: 'KnowledgeTag',
    entityId: id,
    metadata: { name },
  })
}

export async function deleteTag(id: string) {
  const session = await requireAdmin()

  // Tag hanya label; menghapusnya cukup melepas kaitannya dari dokumen
  // dan proyek. Cascade di skema sudah menangani baris pivotnya.
  await prisma.knowledgeTag.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeTag',
    entityId: id,
  })
}

/**
 * Seluruh dokumen untuk ekspor/backup.
 *
 * `media` ikut, TAPI hanya aset publik yang sudah lolos redaksi — sama
 * dengan penyaringan di sisi publik. Backup yang memuat bukti internal
 * adalah kebocoran yang menunggu terjadi begitu berkasnya dibagikan.
 */
export async function getDocumentsForExport() {
  await requireAdminPage()

  return prisma.knowledgeDocument.findMany({
    select: {
      type: true,
      slug: true,
      documentCode: true,
      version: true,
      status: true,
      titleId: true,
      titleEn: true,
      summaryId: true,
      summaryEn: true,
      contentIdJson: true,
      contentEnJson: true,
      difficulty: true,
      estimatedMinutes: true,
      tools: true,
      metadata: true,
      isFeatured: true,
      sortOrder: true,
      publishedAt: true,
      category: { select: { slug: true } },
      tags: { select: { tag: { select: { name: true } } } },
      media: {
        where: { isPublic: true, redactionConfirmed: true },
        select: {
          fileKey: true,
          kind: true,
          altId: true,
          altEn: true,
          captionId: true,
          captionEn: true,
          isPublic: true,
          redactionConfirmed: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ type: 'asc' }, { slug: 'asc' }],
  })
}
