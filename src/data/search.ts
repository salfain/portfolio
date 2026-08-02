import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

/**
 * Pencarian full-text PostgreSQL.
 *
 * Memakai SQL mentah, BUKAN Prisma Client: kolom `searchVector` bertipe
 * `tsvector` yang tidak dikenal Prisma, dan `ts_rank` tidak punya padanan
 * di API-nya. Setiap query di sini tetap menyaring `status = 'PUBLISHED'`
 * dengan aturan yang sama seperti `src/data/knowledge.ts` — SQL mentah
 * tidak membebaskan siapa pun dari aturan itu, justru membuatnya lebih
 * mudah terlupa.
 *
 * Seluruh nilai masuk lewat parameter Prisma (`${...}` pada `$queryRaw`),
 * bukan disambung ke string. Kata kunci pencarian datang dari URL, dan
 * merangkainya sendiri ke SQL adalah injeksi yang menunggu terjadi.
 */

export type SearchHit = {
  id: string
  kind: 'document' | 'project'
  slug: string
  /** Segmen rute untuk dokumen; `null` untuk proyek. */
  segment: string | null
  titleId: string
  titleEn: string | null
  summaryId: string
  summaryEn: string | null
  documentCode: string | null
  rank: number
}

/**
 * `websearch_to_tsquery`, bukan `plainto_tsquery`.
 *
 * Ia memahami tanda kutip untuk frasa persis, `OR`, dan `-` untuk
 * mengecualikan — sintaks yang sudah dikenal siapa pun yang pernah memakai
 * mesin pencari. Yang lebih penting: ia TIDAK PERNAH melempar untuk masukan
 * aneh. `to_tsquery` melempar untuk `"("` saja, dan itu berarti galat 500
 * hanya karena pengunjung mengetik kurung.
 */
const TSQUERY = (query: string) =>
  Prisma.sql`websearch_to_tsquery('indonesian', ${query})`

/** Pencarian gabungan untuk command palette. */
export async function searchEverything(
  query: string,
  limit = 12,
): Promise<SearchHit[]> {
  const trimmed = query.trim()

  if (trimmed === '') return []

  return prisma.$queryRaw<SearchHit[]>`
    SELECT
      d.id,
      'document' AS kind,
      d.slug,
      CASE d.type
        WHEN 'SOP' THEN 'sop'
        WHEN 'LAB' THEN 'labs'
        WHEN 'INCIDENT' THEN 'incidents'
        ELSE 'articles'
      END AS segment,
      d."titleId", d."titleEn", d."summaryId", d."summaryEn", d."documentCode",
      ts_rank(d."searchVector", ${TSQUERY(trimmed)}) AS rank
    FROM "KnowledgeDocument" d
    WHERE d.status = 'PUBLISHED'
      AND d."searchVector" @@ ${TSQUERY(trimmed)}

    UNION ALL

    SELECT
      p.id,
      'project' AS kind,
      p.slug,
      NULL AS segment,
      p."titleId", p."titleEn", p."summaryId", p."summaryEn", NULL AS "documentCode",
      ts_rank(p."searchVector", ${TSQUERY(trimmed)}) AS rank
    FROM "Project" p
    WHERE p.status = 'PUBLISHED'
      AND p."searchVector" @@ ${TSQUERY(trimmed)}

    ORDER BY rank DESC, "titleId" ASC
    LIMIT ${limit}
  `
}

/**
 * Id dokumen terbit yang cocok, berurut relevansi.
 *
 * Dipisah dari pengambilan datanya supaya listing Knowledge Base tetap
 * memakai satu bentuk `select` yang sama untuk kartu dokumen — pencarian
 * hanya menentukan MANA dan URUTANNYA, bukan bentuk datanya.
 */
export async function searchDocumentIds(query: string): Promise<string[]> {
  const trimmed = query.trim()

  if (trimmed === '') return []

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT d.id
    FROM "KnowledgeDocument" d
    WHERE d.status = 'PUBLISHED'
      AND d."searchVector" @@ ${TSQUERY(trimmed)}
    ORDER BY ts_rank(d."searchVector", ${TSQUERY(trimmed)}) DESC
    LIMIT 100
  `

  return rows.map((row) => row.id)
}

/**
 * Dokumen terkait, diperingkat berdasarkan kemiripan isi.
 *
 * Sebelumnya "terkait" hanya berarti berkategori sama lalu diurutkan
 * tanggal — yang berarti dokumen terbaru di kategori itu selalu muncul,
 * relevan atau tidak. Sekarang tsvector dokumen ini dipakai sebagai
 * kueri terhadap dokumen lain, jadi yang muncul benar-benar yang
 * pembahasannya berdekatan.
 *
 * Kategori yang sama tetap diberi dorongan, bukan dijadikan syarat:
 * insiden yang membahas DHCP tetap layak muncul di SOP tentang DHCP
 * meski kategorinya berbeda.
 */
export async function searchRelatedDocumentIds(
  documentId: string,
  limit = 3,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH sumber AS (
      SELECT "searchVector", "categoryId"
      FROM "KnowledgeDocument"
      WHERE id = ${documentId}
    )
    SELECT
      d.id
    FROM "KnowledgeDocument" d, sumber s
    WHERE d.status = 'PUBLISHED'
      AND d.id <> ${documentId}
    ORDER BY
      ts_rank(d."searchVector", to_tsquery('indonesian',
        -- Ambil sampai 30 leksem berbobot tertinggi dari dokumen sumber,
        -- disambung dengan OR. Memakai seluruh leksem membuat kuerinya
        -- sangat lambat tanpa mengubah urutan hasil secara berarti.
        coalesce(
          (SELECT string_agg(quote_literal(lexeme), ' | ')
           FROM (
             SELECT lexeme FROM unnest(s."searchVector")
             ORDER BY array_length(positions, 1) DESC
             LIMIT 30
           ) AS teratas),
          'zzzz'
        )
      )) DESC,
      (d."categoryId" IS NOT DISTINCT FROM s."categoryId") DESC,
      d."publishedAt" DESC
    LIMIT ${limit}
  `

  return rows.map((row) => row.id)
}
