import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { typeForSegment } from '@/lib/knowledge-type'
import { getPublishedDocumentSlugs } from '@/data/knowledge'
import {
  DocumentDetail,
  documentDetailMetadata,
} from '@/components/knowledge/document-detail'

/**
 * `dynamicParams = false` — WAJIB.
 *
 * Rute ber-`generateStaticParams()` dengan `dynamicParams: true`
 * menyajikan hasil `notFound()` lewat jalur prerender, yang selalu
 * membalas 200. Dokumen draft yang membalas 200 akan diindeks mesin
 * pencari sebagai halaman sah. Diuji juga dengan `force-dynamic`: tetap
 * 200. Hanya penolakan level router yang menghasilkan 404 sungguhan.
 *
 * KONSEKUENSI: dokumen yang baru terbit belum bisa dibuka sampai build
 * berikutnya. Lihat docs/phase-4/NOTES.md N2.
 */
export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getPublishedDocumentSlugs(typeForSegment('articles'))

  return slugs.map((slug) => ({ slug }))
}

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params

  return documentDetailMetadata(locale, 'articles', slug)
}

export default async function KnowledgeArticlesDetailPage({
  params,
}: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  return <DocumentDetail locale={locale} segment="articles" slug={slug} />
}
