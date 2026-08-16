import 'server-only'

import { Prisma, type PublishStatus, type KnowledgeType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { documentText } from '@/lib/prosemirror/headings'
import { slugifyHeading } from '@/lib/prosemirror/headings'
import { parseDocument } from '@/lib/prosemirror/types'
import type {
  KnowledgeCategoryInput,
  KnowledgeDocumentInput,
} from '@/lib/schemas/admin'

import { auditActionForStatus, recordAudit } from './audit'
import { requireAdmin, requireAdminPage } from './_guards'

/**
 * Sisi ADMIN Knowledge Base.
 *
 * Sengaja dipisah dari `src/data/knowledge.ts`. Berkas itu menyaring
 * `status: 'PUBLISHED'` di setiap query tanpa kecuali — begitu query admin
 * yang memang harus melihat draft ikut tinggal di sana, aturan "setiap query
 * di berkas ini menyaring PUBLISHED" berubah jadi "sebagian besar", dan
 * aturan yang berlaku sebagian besar tidak bisa diandalkan saat ditinjau.
 *
 * Setiap fungsi di sini memanggil guard-nya sendiri di baris pertama
 * (docs/rules/07_DATA_PRISMA.md §2).
 */

// ─── Daftar & detail ─────────────────────────────────────

export type AdminDocumentFilters = {
  type?: KnowledgeType
  status?: PublishStatus
}

export async function getAdminDocuments(filters: AdminDocumentFilters = {}) {
  await requireAdminPage()

  return prisma.knowledgeDocument.findMany({
    where: {
      type: filters.type,
      status: filters.status,
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      type: true,
      status: true,
      documentCode: true,
      titleId: true,
      version: true,
      isFeatured: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { nameId: true } },
      _count: { select: { revisions: true, media: true } },
    },
  })
}

export async function getAdminDocumentById(id: string) {
  await requireAdminPage()

  return prisma.knowledgeDocument.findUnique({
    where: { id },
    include: {
      tags: { select: { tag: { select: { name: true } } } },
      revisions: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          version: true,
          changeSummary: true,
          createdAt: true,
        },
      },
    },
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

export async function isDocumentCodeTaken(
  documentCode: string,
  exceptId?: string | null,
) {
  await requireAdmin()

  const existing = await prisma.knowledgeDocument.findUnique({
    where: { documentCode },
    select: { id: true },
  })

  return existing !== null && existing.id !== exceptId
}

// ─── Simpan ──────────────────────────────────────────────

/**
 * Teks polos untuk indeks pencarian.
 *
 * Kolom `contentIdHtml`/`contentEnHtml` menyimpan teks, BUKAN HTML, dan
 * tidak pernah dibaca untuk merender halaman publik — renderer selalu
 * bekerja dari JSON (`07_SCHEMA_DECISIONS.md` §6). Namanya dipertahankan
 * karena mengganti nama kolom berarti migrasi, dan migrasi butuh izin.
 */
function searchText(value: unknown): string | null {
  const doc = parseDocument(value)

  return doc ? documentText(doc).slice(0, 100_000) : null
}

/** Tag dibuat sesuai kebutuhan; nama yang sudah ada dipakai ulang. */
async function connectTags(
  tx: Prisma.TransactionClient,
  documentId: string,
  names: string[],
) {
  await tx.knowledgeDocumentTag.deleteMany({ where: { documentId } })

  for (const name of names) {
    // Slug bisa saja kosong untuk nama non-latin; nama tetap jadi acuan
    // unik, jadi slug kosong diberi pengganti yang tetap unik.
    const slug = slugifyHeading(name) || `tag-${Date.now()}`

    const tag = await tx.knowledgeTag.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    })

    await tx.knowledgeDocumentTag.create({
      data: { documentId, tagId: tag.id },
    })
  }
}

export async function saveDocument(
  input: KnowledgeDocumentInput,
  metadata: Prisma.InputJsonValue,
) {
  const session = await requireAdmin()

  const { id, tags, changeSummary } = input

  /**
   * Kolom ditulis satu per satu, bukan disebar dari hasil parse.
   *
   * `redactionConfirmed` memang tidak boleh ikut tersimpan, dan menyaringnya
   * lewat destructuring berarti setiap field baru di skema otomatis ikut ke
   * database begitu ditambahkan. Daftar eksplisit membuat penambahan kolom
   * jadi keputusan sadar.
   *
   * `Prisma.DbNull` untuk isi EN yang dikosongkan — `undefined` berarti
   * "jangan ubah", sehingga terjemahan yang dihapus penulis akan tetap
   * hidup di database dan tetap tampil di halaman EN.
   */
  const data = {
    type: input.type,
    slug: input.slug,
    documentCode: input.documentCode,
    version: input.version,
    titleId: input.titleId,
    titleEn: input.titleEn,
    summaryId: input.summaryId,
    summaryEn: input.summaryEn,
    categoryId: input.categoryId,
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    tools: input.tools,
    isFeatured: input.isFeatured,
    sortOrder: input.sortOrder,
    status: input.status,
    metadata,
    contentIdJson: input.contentIdJson as Prisma.InputJsonValue,
    contentEnJson: (input.contentEnJson ??
      Prisma.DbNull) as Prisma.InputJsonValue,
    contentIdHtml: searchText(input.contentIdJson),
    contentEnHtml: searchText(input.contentEnJson),
  }

  return prisma.$transaction(async (tx) => {
    if (!id) {
      const created = await tx.knowledgeDocument.create({
        data: {
          ...data,
          authorId: session.user.id,
          publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
        },
        select: { id: true },
      })

      await connectTags(tx, created.id, tags)

      await recordAudit({
        actorId: session.user.id,
        action: auditActionForStatus(null, input.status),
        entityType: 'KnowledgeDocument',
        entityId: created.id,
        metadata: { slug: input.slug, status: input.status },
      })

      return created.id
    }

    const existing = await tx.knowledgeDocument.findUniqueOrThrow({
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

    /**
     * Menyunting dokumen yang SUDAH TERBIT menyimpan isi LAMA sebagai
     * revisi — bukan isi baru. Riwayat revisi gunanya menjawab "dulu
     * tulisannya apa", dan itu hanya bisa dijawab kalau yang diarsipkan
     * adalah versi sebelum diubah.
     *
     * Draft tidak menghasilkan revisi: dokumen yang belum pernah terbit
     * tidak punya "versi sebelumnya" yang pernah dibaca siapa pun.
     */
    if (existing.status === 'PUBLISHED') {
      await tx.knowledgeRevision.create({
        data: {
          documentId: id,
          version: existing.version,
          changeSummary: changeSummary ?? 'Penyuntingan tanpa catatan.',
          contentIdJson: existing.contentIdJson as Prisma.InputJsonValue,
          contentEnJson: (existing.contentEnJson ??
            undefined) as Prisma.InputJsonValue,
          metadata: (existing.metadata ?? undefined) as Prisma.InputJsonValue,
          createdById: session.user.id,
        },
      })
    }

    await tx.knowledgeDocument.update({
      where: { id },
      data: {
        ...data,
        // Tanggal terbit pertama tidak pernah ditulis ulang — mengubahnya
        // membuat urutan "terbaru" di halaman publik melompat setiap kali
        // dokumen lama disunting.
        publishedAt:
          input.status === 'PUBLISHED' && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    })

    await connectTags(tx, id, tags)

    await recordAudit({
      actorId: session.user.id,
      action: auditActionForStatus(existing.status, input.status),
      entityType: 'KnowledgeDocument',
      entityId: id,
      metadata: {
        slug: input.slug,
        from: existing.status,
        to: input.status,
        changeSummary: changeSummary ?? null,
      },
    })

    return id
  })
}

export async function deleteDocument(id: string) {
  const session = await requireAdmin()

  const document = await prisma.knowledgeDocument.delete({
    where: { id },
    select: { slug: true, status: true },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeDocument',
    entityId: id,
    metadata: { slug: document.slug, status: document.status },
  })
}

// ─── Kategori ────────────────────────────────────────────

export async function getAdminCategories() {
  await requireAdminPage()

  return prisma.knowledgeCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { nameId: 'asc' }],
    include: { _count: { select: { documents: true, projects: true } } },
  })
}

/** Dipakai form dokumen — tidak butuh hitungan relasi. */
export async function getCategoryOptions() {
  await requireAdminPage()

  return prisma.knowledgeCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { nameId: 'asc' }],
    select: { id: true, nameId: true },
  })
}

export async function isCategorySlugTaken(
  slug: string,
  exceptId?: string | null,
) {
  await requireAdmin()

  const existing = await prisma.knowledgeCategory.findUnique({
    where: { slug },
    select: { id: true },
  })

  return existing !== null && existing.id !== exceptId
}

export async function saveCategory(input: KnowledgeCategoryInput) {
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
    metadata: { slug: input.slug },
  })
}

/**
 * Kategori yang masih dipakai TIDAK boleh dihapus.
 *
 * Relasinya `SetNull` di sisi Prisma, jadi penghapusan diam-diam akan
 * melepas kategori dari dokumen yang sudah terbit — perubahan isi publik
 * sebagai efek samping tindakan admin yang terlihat sepele.
 */
export async function deleteCategory(id: string) {
  const session = await requireAdmin()

  const used = await prisma.knowledgeDocument.count({
    where: { categoryId: id },
  })
  const usedByProject = await prisma.project.count({
    where: { categoryId: id },
  })

  if (used > 0 || usedByProject > 0) {
    throw new Error('CATEGORY_IN_USE')
  }

  const category = await prisma.knowledgeCategory.delete({
    where: { id },
    select: { slug: true },
  })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeCategory',
    entityId: id,
    metadata: { slug: category.slug },
  })
}

// ─── Tag ─────────────────────────────────────────────────

export async function getAdminTags() {
  await requireAdminPage()

  return prisma.knowledgeTag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { documents: true, projects: true } } },
  })
}

/** Tag tanpa pemakai boleh dihapus; yang masih dipakai ditolak. */
export async function deleteTag(id: string) {
  const session = await requireAdmin()

  const tag = await prisma.knowledgeTag.findUniqueOrThrow({
    where: { id },
    select: {
      name: true,
      _count: { select: { documents: true, projects: true } },
    },
  })

  if (tag._count.documents > 0 || tag._count.projects > 0) {
    throw new Error('TAG_IN_USE')
  }

  await prisma.knowledgeTag.delete({ where: { id } })

  await recordAudit({
    actorId: session.user.id,
    action: 'delete',
    entityType: 'KnowledgeTag',
    entityId: id,
    metadata: { name: tag.name },
  })
}
