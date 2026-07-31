import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

/**
 * `robots.txt`.
 *
 * `/admin` dan `/api` diblokir sepenuhnya (05_ROUTE_AND_PRIORITY_MAP §4).
 * Blokir di sini adalah lapisan kesopanan, BUKAN keamanan — crawler nakal
 * mengabaikannya. Yang menjaga `/admin` tetap middleware + `requireAdminPage()`.
 *
 * `/[locale]/recruiter` tidak dicantumkan di sini: halaman itu sudah
 * ber-`noindex` lewat metadata, dan `Disallow` justru mencegah crawler
 * membaca tag `noindex`-nya.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
