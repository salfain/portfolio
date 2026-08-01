import { env } from '@/lib/env'
import type { Locale } from '@/i18n/routing'
import { toIsoString, type DateLike } from '@/lib/format'

/**
 * Structured data (JSON-LD).
 *
 * Satu aturan yang mengalahkan semua pertimbangan SEO di sini: **tidak ada
 * field yang diisi kalau datanya tidak ada.** Schema.org punya banyak
 * properti menggoda — `jobTitle`, `worksFor`, `award`, `aggregateRating` —
 * dan mengisinya dengan tebakan berarti mengarang fakta di tempat yang
 * justru dibaca mesin sebagai pernyataan resmi (CLAUDE.md aturan 1).
 *
 * Karena itu setiap fungsi di bawah menerima data yang sudah ada di
 * database, lalu membuang field yang kosong sebelum dirender.
 */

function clean<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  ) as T
}

/**
 * `dangerouslySetInnerHTML` dipakai DI SINI dan hanya di sini.
 *
 * JSON-LD memang harus berupa isi mentah `<script>`, dan React tidak punya
 * cara lain menuliskannya. Yang masuk selalu hasil `JSON.stringify`, jadi
 * tidak ada string mentah dari pengguna yang lolos. `<` tetap dilolos
 * karena `</script>` di dalam string akan menutup tag lebih awal.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export function PersonJsonLd({
  name,
  role,
  summary,
  locale,
}: {
  name: string
  role: string | null
  summary: string | null
  locale: Locale
}) {
  return (
    <JsonLd
      data={clean({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        jobTitle: role,
        description: summary,
        url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}`,
      })}
    />
  )
}

export function DocumentJsonLd({
  title,
  summary,
  path,
  locale,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string
  summary: string
  path: string
  locale: Locale
  publishedAt: DateLike | null
  updatedAt: DateLike
  authorName: string
}) {
  return (
    <JsonLd
      data={clean({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description: summary,
        inLanguage: locale,
        url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}${path}`,
        datePublished: publishedAt ? toIsoString(publishedAt) : null,
        dateModified: toIsoString(updatedAt),
        author: { '@type': 'Person', name: authorName },
      })}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: { name: string; path: string }[]
  locale: Locale
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${env.NEXT_PUBLIC_SITE_URL}/${locale}${item.path}`,
        })),
      }}
    />
  )
}
