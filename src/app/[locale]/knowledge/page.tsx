import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { TYPE_SEGMENT_LIST, typeForSegment } from '@/lib/knowledge-type'
import {
  getKnowledgeCategories,
  getKnowledgeCounts,
  getLatestDocuments,
} from '@/data/knowledge'
import { pickLocale } from '@/lib/i18n-content'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { DocumentCard } from '@/components/knowledge'
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'knowledge' })

  return { title: t('title'), description: t('description') }
}

export default async function KnowledgeLandingPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('knowledge')
  const [counts, categories, latest] = await Promise.all([
    getKnowledgeCounts(),
    getKnowledgeCategories(),
    getLatestDocuments(3),
  ])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <Container className="pb-20">
        {/* Empat tipe dokumen. Ditampilkan walau kosong: pengunjung perlu
            tahu bentuk isi situs ini, dan jumlah 0 lebih jujur daripada
            menyembunyikan seluruh kategorinya. */}
        <StaggerContainer className="grid gap-5 sm:grid-cols-2">
          {TYPE_SEGMENT_LIST.map((segment) => {
            const count = counts[typeForSegment(segment)]

            return (
              <StaggerItem key={segment}>
                <Link
                  href={`/knowledge/${segment}`}
                  className={cn(
                    'group flex h-full flex-col rounded-3xl border border-border bg-surface p-6',
                    'transition-colors hover:border-primary/40',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                      {t(`types.${segment}.plural`)}
                    </h2>
                    <span className="font-display text-2xl font-semibold tabular-nums text-muted">
                      {count}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`types.${segment}.description`)}
                  </p>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {categories.length > 0 ? (
          <Reveal className="mt-14">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {t('category.all')}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/knowledge/category/${category.slug}`}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm',
                      'transition-colors hover:border-primary/40 hover:text-primary',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    )}
                  >
                    {pickLocale(category, 'name', locale)}
                    <span className="text-xs text-muted">
                      {category._count.documents}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        <div className="mt-14">
          {latest.length === 0 ? (
            <EmptyState
              title={t('empty.title')}
              description={t('empty.description')}
            />
          ) : (
            <>
              <Reveal>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {t('browseAll')}
                </h2>
              </Reveal>

              <StaggerContainer className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {latest.map((document) => (
                  <StaggerItem key={document.id}>
                    <DocumentCard document={document} locale={locale} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </div>
      </Container>
    </>
  )
}
