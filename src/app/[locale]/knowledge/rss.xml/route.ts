import { env } from '@/lib/env'
import { routing, type Locale } from '@/i18n/routing'
import { documentHref } from '@/lib/knowledge-type'
import { pickLocale } from '@/lib/i18n-content'
import { getPublishedDocuments } from '@/data/knowledge'
import { escapeXml } from '@/lib/xml'

/**
 * Umpan RSS Knowledge Base, satu per bahasa.
 *
 * Hanya dokumen `PUBLISHED` — `getPublishedDocuments` menyaringnya di
 * query, jadi tidak ada penyaringan kedua di sini yang bisa lupa
 * disesuaikan.
 *
 * Isinya sengaja hanya judul dan ringkasan, bukan isi dokumen penuh:
 * ringkasan sudah ditulis untuk dibaca berdiri sendiri, sementara isi
 * penuh memuat tabel bukti dan gambar yang tidak terbaca di pembaca RSS
 * mana pun tanpa konteks halamannya.
 */
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: raw } = await params
  const locale = (
    routing.locales.includes(raw as Locale) ? raw : routing.defaultLocale
  ) as Locale

  const documents = await getPublishedDocuments()
  const base = env.NEXT_PUBLIC_SITE_URL
  const feedUrl = `${base}/${locale}/knowledge/rss.xml`

  const items = documents
    .map((document) => {
      const url = `${base}/${locale}${documentHref(document.type, document.slug)}`
      const published = document.publishedAt ?? document.updatedAt

      return `    <item>
      <title>${escapeXml(pickLocale(document, 'title', locale))}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(pickLocale(document, 'summary', locale))}</description>
      <pubDate>${new Date(published).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  const title =
    locale === 'id'
      ? 'Knowledge Base — Muhammad Sya’ban Alfain'
      : 'Knowledge Base — Muhammad Sya’ban Alfain'

  const description =
    locale === 'id'
      ? 'SOP, lab jaringan, dan laporan insiden yang ditulis sendiri.'
      : 'SOPs, network labs, and incident reports written first-hand.'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(`${base}/${locale}/knowledge`)}</link>
    <description>${escapeXml(description)}</description>
    <language>${locale}</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
