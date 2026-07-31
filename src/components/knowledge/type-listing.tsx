import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { pickLocale } from '@/lib/i18n-content'
import { typeForSegment, type TypeSegment } from '@/lib/knowledge-type'
import {
  hasActiveFilters,
  parseKnowledgeFilters,
} from '@/lib/schemas/knowledge-filters'
import {
  getKnowledgeCategories,
  getKnowledgeTags,
  getPublishedDocuments,
} from '@/data/knowledge'

import { EmptyState } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { DocumentCard } from './document-card'
import { KnowledgeFilters } from './knowledge-filters'

/**
 * Isi halaman listing satu tipe dokumen.
 *
 * Dipisah dari berkas rute karena keempat tipe memakai rute STATIS
 * (`/knowledge/sop`, `/knowledge/labs`, …), bukan satu segmen dinamis
 * `[type]`. Alasannya bukan gaya penulisan:
 *
 * Segmen dinamis membuat `/knowledge/apapun` cocok dengan rute, lalu
 * `notFound()` dipanggil di dalam halaman — dan `notFound()` dari halaman
 * membalas **200** di aplikasi ini, bukan 404. Dengan rute statis, segmen
 * yang tidak dikenal tidak cocok rute mana pun dan ditolak router dengan
 * 404 sungguhan.
 *
 * Lihat docs/phase-4/NOTES.md N2.
 */
export async function TypeListing({
  locale,
  segment,
  searchParams,
}: {
  locale: Locale
  segment: TypeSegment
  searchParams: Record<string, string | string[] | undefined>
}) {
  const filters = parseKnowledgeFilters(searchParams)
  const t = await getTranslations('knowledge')

  const [documents, categories, tags] = await Promise.all([
    getPublishedDocuments({
      type: typeForSegment(segment),
      categorySlug: filters.kategori,
      tagSlug: filters.tag,
      difficulty: filters.tingkat,
      query: filters.q,
    }),
    getKnowledgeCategories(),
    getKnowledgeTags(),
  ])

  const filtered = hasActiveFilters(filters)

  return (
    <>
      <PageHeader
        title={t(`types.${segment}.plural`)}
        description={t(`types.${segment}.description`)}
      />

      <Container className="pb-20">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside>
            <KnowledgeFilters
              basePath={`/knowledge/${segment}`}
              filters={filters}
              resultCount={documents.length}
              categories={categories.map((category) => ({
                value: category.slug,
                label: pickLocale(category, 'name', locale),
              }))}
              tags={tags.map((tag) => ({ value: tag.slug, label: tag.name }))}
            />
          </aside>

          <div>
            {documents.length === 0 ? (
              <EmptyState
                title={t(filtered ? 'emptyFiltered.title' : 'empty.title')}
                description={t(
                  filtered ? 'emptyFiltered.description' : 'empty.description',
                )}
              />
            ) : (
              <StaggerContainer className="grid gap-5 sm:grid-cols-2">
                {documents.map((document) => (
                  <StaggerItem key={document.id}>
                    <DocumentCard document={document} locale={locale} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

/** Metadata bersama untuk keempat rute listing. */
export async function typeListingMetadata(
  locale: Locale,
  segment: TypeSegment,
) {
  const t = await getTranslations({ locale, namespace: 'knowledge' })

  return {
    title: t(`types.${segment}.plural`),
    description: t(`types.${segment}.description`),
  }
}
