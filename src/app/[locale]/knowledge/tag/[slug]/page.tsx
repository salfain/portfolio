import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import {
  getKnowledgeTagBySlug,
  getKnowledgeTags,
  getPublishedDocuments,
} from '@/data/knowledge'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { DocumentCard } from '@/components/knowledge'
import { StaggerContainer, StaggerItem } from '@/components/motion'

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
  const tags = await getKnowledgeTags()

  return tags.map((tag) => ({ slug: tag.slug }))
}

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const tag = await getKnowledgeTagBySlug(slug)

  if (!tag) return {}

  const t = await getTranslations({ locale, namespace: 'knowledge' })

  return { title: t('tag.title', { name: tag.name }) }
}

export default async function KnowledgeTagPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const tag = await getKnowledgeTagBySlug(slug)

  if (!tag) notFound()

  const t = await getTranslations('knowledge')
  const documents = await getPublishedDocuments({ tagSlug: slug })

  return (
    <>
      <PageHeader title={t('tag.title', { name: tag.name })} />

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
