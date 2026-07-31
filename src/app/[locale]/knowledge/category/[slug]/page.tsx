import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { pickLocale } from '@/lib/i18n-content'
import {
  getKnowledgeCategories,
  getKnowledgeCategoryBySlug,
  getPublishedDocuments,
} from '@/data/knowledge'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { DocumentCard } from '@/components/knowledge'
import { StaggerContainer, StaggerItem } from '@/components/motion'

/**
 * `dynamicParams = false` — WAJIB, bukan pilihan gaya.
 *
 * Rute yang punya `generateStaticParams()` dengan `dynamicParams: true`
 * menyajikan hasil `notFound()` lewat jalur prerender, dan jalur itu selalu
 * membalas **200** (terlihat dari header `x-nextjs-prerender: 1`). Dokumen
 * draft yang membalas 200 akan diindeks mesin pencari sebagai halaman sah.
 *
 * Diuji juga dengan `dynamic = 'force-dynamic'`: tetap 200. Satu-satunya
 * yang menghasilkan 404 sungguhan adalah menolak di level router, yaitu
 * `dynamicParams = false` — sama seperti `/projects/[slug]` di Fase 3 (N2).
 *
 * KONSEKUENSI: dokumen, kategori, atau tag yang baru terbit belum bisa
 * dibuka sampai build berikutnya. Lihat docs/phase-4/NOTES.md N2.
 */
export const dynamicParams = false

export async function generateStaticParams() {
  const categories = await getKnowledgeCategories()

  return categories.map((category) => ({ slug: category.slug }))
}

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const category = await getKnowledgeCategoryBySlug(slug)

  if (!category) return {}

  const t = await getTranslations({ locale, namespace: 'knowledge' })

  return {
    title: t('category.title', { name: pickLocale(category, 'name', locale) }),
    description: pickLocale(category, 'description', locale) || undefined,
  }
}

export default async function KnowledgeCategoryPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = await getKnowledgeCategoryBySlug(slug)

  if (!category) notFound()

  const t = await getTranslations('knowledge')
  const documents = await getPublishedDocuments({ categorySlug: slug })

  return (
    <>
      <PageHeader
        title={t('category.title', { name: pickLocale(category, 'name', locale) })}
        description={pickLocale(category, 'description', locale) || undefined}
      />

      <Container className="pb-20">
        {documents.length === 0 ? (
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
          />
        ) : (
          <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <StaggerItem key={document.id}>
                <DocumentCard document={document} locale={locale} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </Container>
    </>
  )
}
