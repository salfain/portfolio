import { Suspense } from 'react'
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
import { ListingSkeleton } from './listing-skeleton'

/**
 * Isi halaman listing satu tipe dokumen.
 *
 * Dipisah dari berkas rute karena keempat tipe memakai rute STATIS
 * (`/knowledge/sop`, `/knowledge/labs`, …), bukan satu segmen dinamis
 * `[type]`. Segmen tipe yang tidak dikenal jadi tidak cocok dengan rute mana
 * pun dan ditolak router — 404 tanpa merender apa pun. Itu tetap lebih baik
 * daripada mencocokkan lalu memanggil `notFound()`, sekalipun `notFound()`
 * kini sudah membalas 404 dengan benar (docs/phase-5/NOTES.md N1).
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

  return (
    <>
      <PageHeader
        title={t(`types.${segment}.plural`)}
        description={t(`types.${segment}.description`)}
      />

      <Container className="pb-20">
        {/*
          Boundary skeleton berada di sini, DI DALAM halaman listing — bukan
          di `loading.tsx` yang menaungi seluruh subtree locale. `key` memaksa
          skeleton muncul lagi setiap filter berubah; tanpa itu React memakai
          ulang boundary yang sudah ter-resolve dan hasil lama tetap terlihat.
        */}
        <Suspense
          key={JSON.stringify(filters)}
          fallback={<ListingSkeleton />}
        >
          <TypeListingResults
            locale={locale}
            segment={segment}
            filters={filters}
          />
        </Suspense>
      </Container>
    </>
  )
}

/** Bagian yang menunggu database. Dipisah supaya bisa di-Suspense. */
async function TypeListingResults({
  locale,
  segment,
  filters,
}: {
  locale: Locale
  segment: TypeSegment
  filters: ReturnType<typeof parseKnowledgeFilters>
}) {
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
