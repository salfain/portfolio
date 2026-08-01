import { NextResponse } from 'next/server'

import { getAdminDocumentById } from '@/data/knowledge-admin'
import { documentToMarkdown } from '@/lib/prosemirror/to-markdown'
import { parseDocument } from '@/lib/prosemirror/types'
import { toIsoString } from '@/lib/format'

/**
 * Unduh satu dokumen sebagai JSON atau Markdown.
 *
 * Dijaga `getAdminDocumentById()`, yang memanggil `requireAdminPage()` di
 * baris pertama — dokumen draft ikut bisa diekspor, dan itu memang gunanya.
 *
 * Yang TIDAK ikut: bukti. Berkas bukti punya aturan aksesnya sendiri dan
 * sebagian besar privat; membungkusnya ke dalam berkas ekspor berarti
 * satu unduhan yang lolos ke luar membawa serta semua yang sudah
 * susah payah dijaga.
 */
export const dynamic = 'force-dynamic'

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteProps) {
  const { id } = await params
  const format = new URL(request.url).searchParams.get('format')

  const document = await getAdminDocumentById(id)

  if (!document) return new NextResponse(null, { status: 404 })

  const filename = `${document.slug}-v${document.version}`

  if (format === 'md') {
    const content = parseDocument(document.contentIdJson)
    const contentEn = parseDocument(document.contentEnJson)

    const parts = [
      `# ${document.titleId}`,
      '',
      document.summaryId,
      '',
      '---',
      '',
      content ? documentToMarkdown(content) : '_Isi dokumen belum ada._',
    ]

    if (contentEn) {
      parts.push('', '---', '', `# ${document.titleEn ?? document.titleId}`, '')
      if (document.summaryEn) parts.push(document.summaryEn, '')
      parts.push(documentToMarkdown(contentEn))
    }

    return new NextResponse(parts.join('\n'), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.md"`,
        'Cache-Control': 'private, no-store',
      },
    })
  }

  /**
   * Bentuk JSON-nya sengaja bukan baris database apa adanya.
   *
   * `authorId` dan id internal tidak ikut: berkas ekspor berpindah tangan,
   * dan pengenal internal tidak berguna di luar sistem ini sambil tetap
   * memberi tahu bentuk datanya kepada siapa pun yang menerimanya.
   */
  const payload = {
    slug: document.slug,
    documentCode: document.documentCode,
    type: document.type,
    status: document.status,
    version: document.version,
    title: { id: document.titleId, en: document.titleEn },
    summary: { id: document.summaryId, en: document.summaryEn },
    content: { id: document.contentIdJson, en: document.contentEnJson },
    category: document.categoryId ? { id: document.categoryId } : null,
    tags: document.tags.map((row) => row.tag.name),
    difficulty: document.difficulty,
    estimatedMinutes: document.estimatedMinutes,
    tools: document.tools,
    publishedAt: document.publishedAt ? toIsoString(document.publishedAt) : null,
    updatedAt: toIsoString(document.updatedAt),
    exportedAt: new Date().toISOString(),
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.json"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
