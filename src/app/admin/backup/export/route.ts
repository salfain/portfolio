import { NextResponse, type NextRequest } from 'next/server'

import { requireAdmin } from '@/data/_guards'
import { getDocumentsForExport } from '@/data/knowledge'
import { documentToMarkdown } from '@/lib/prosemirror/to-markdown'
import { parseDocument } from '@/lib/prosemirror/types'

/**
 * Unduhan backup.
 *
 * Route Handler, bukan server action: yang dikirim adalah BERKAS, dan
 * server action tidak bisa mengembalikan respons dengan
 * `Content-Disposition`.
 *
 * `requireAdmin()` tetap dipanggil di baris pertama — route handler tidak
 * lewat `AdminShell`, jadi tidak ada lapisan lain yang menjaganya.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    // 404, bukan 401: keberadaan endpoint backup tidak perlu dikonfirmasi
    // ke pihak yang tidak berhak (05_ROUTE_AND_PRIORITY_MAP §6).
    return new NextResponse(null, { status: 404 })
  }

  const format = request.nextUrl.searchParams.get('format') ?? 'json'
  const documents = await getDocumentsForExport()
  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'markdown') {
    const body = documents
      .map((document) => {
        const content = parseDocument(document.contentIdJson)

        return [
          `# ${document.titleId}`,
          '',
          `- slug: ${document.slug}`,
          `- tipe: ${document.type}`,
          `- status: ${document.status}`,
          document.documentCode ? `- kode: ${document.documentCode}` : null,
          `- versi: ${document.version}`,
          '',
          `> ${document.summaryId}`,
          '',
          content ? documentToMarkdown(content) : '_(isi tidak terbaca)_',
        ]
          .filter((line) => line !== null)
          .join('\n')
      })
      .join('\n\n---\n\n')

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="knowledge-${stamp}.md"`,
        // Backup memuat draft — jangan sampai tersimpan di cache perantara.
        'Cache-Control': 'no-store, private',
      },
    })
  }

  // Format JSON mengikuti 04_SEED_CONTENT_DRAFT.md §2, jadi berkas ini
  // sekaligus bisa dipakai sebagai sumber seed dan sumber import.
  const body = documents.map((document) => ({
    type: document.type,
    slug: document.slug,
    documentCode: document.documentCode,
    version: document.version,
    status: document.status,
    category: document.category?.slug ?? null,
    tags: document.tags.map((item) => item.tag.name),
    tools: document.tools,
    difficulty: document.difficulty,
    estimatedMinutes: document.estimatedMinutes,
    isFeatured: document.isFeatured,
    sortOrder: document.sortOrder,
    titleId: document.titleId,
    titleEn: document.titleEn,
    summaryId: document.summaryId,
    summaryEn: document.summaryEn,
    contentIdJson: document.contentIdJson,
    contentEnJson: document.contentEnJson,
    metadata: document.metadata,
    evidence: document.media,
  }))

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="knowledge-${stamp}.json"`,
      'Cache-Control': 'no-store, private',
    },
  })
}
