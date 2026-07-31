import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'
import { routing } from '@/i18n/routing'
import { getPublishedProjectSlugs } from '@/data/project'

/**
 * `sitemap.xml`.
 *
 * Setiap URL mencantumkan `alternates.languages` supaya Google tahu
 * `/id/...` dan `/en/...` adalah halaman yang sama dalam dua bahasa.
 * Tanpa itu keduanya bersaing sebagai konten duplikat.
 *
 * Yang SENGAJA tidak masuk:
 * - `/recruiter` — ber-`noindex`, mencantumkannya di sitemap adalah sinyal
 *   yang saling bertentangan.
 * - `/admin/*` — diblokir `robots.txt`.
 * - `/knowledge/*` — di balik flag sampai Fase 4 selesai.
 */

/** Rute statis publik beserta bobotnya. */
const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/experience', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/expertise', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/certifications', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

function urlFor(locale: string, path: string): string {
  return `${env.NEXT_PUBLIC_SITE_URL}/${locale}${path}`
}

/** Peta `hreflang` untuk satu path, dipakai ulang di setiap locale. */
function alternatesFor(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, urlFor(locale, path)]),
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedProjectSlugs()
  const now = new Date()

  const paths = [
    ...staticRoutes,
    ...slugs.map((slug) => ({
      path: `/projects/${slug}`,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
  ]

  return paths.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: urlFor(locale, route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: alternatesFor(route.path) },
    })),
  )
}
