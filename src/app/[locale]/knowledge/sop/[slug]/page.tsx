import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { typeForSegment } from '@/lib/knowledge-type'
import { getPublishedDocumentSlugs } from '@/data/knowledge'
import {
  DocumentDetail,
  documentDetailMetadata,
} from '@/components/knowledge/document-detail'

/**
 * `dynamicParams = true` — slug yang baru terbit langsung bisa dibuka tanpa
 * build ulang, dan slug draft atau tak dikenal tetap 404 sungguhan.
 *
 * Syaratnya satu, dan mutlak: TIDAK BOLEH ada `loading.tsx` di segmen mana
 * pun di atas rute ini. Suspense boundary membuat shell halaman ter-flush
 * lebih dulu, sehingga status respons sudah terkirim sebagai 200 sebelum
 * `notFound()` sempat mengubahnya. Lihat docs/phase-5/NOTES.md N1.
 */
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPublishedDocumentSlugs(typeForSegment('sop'))

  return slugs.map((slug) => ({ slug }))
}

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params

  return documentDetailMetadata(locale, 'sop', slug)
}

export default async function KnowledgeSopDetailPage({
  params,
}: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  return <DocumentDetail locale={locale} segment="sop" slug={slug} />
}
