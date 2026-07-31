import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { env } from '@/lib/env'
import { formatFullDate } from '@/lib/format'
import { pickLocale, resolveLocalized } from '@/lib/i18n-content'
import { typeForSegment, type TypeSegment } from '@/lib/knowledge-type'
import { collectHeadings } from '@/lib/prosemirror/headings'
import { ProseMirrorContent } from '@/lib/prosemirror/render'
import { parseDocument } from '@/lib/prosemirror/types'
import {
  getDocumentRevisions,
  getPublishedDocumentBySlug,
  getRelatedDocuments,
} from '@/data/knowledge'

import { Container } from '@/components/layout/container'
import { TranslationNotice } from '@/components/translation-notice'

import { DocumentCard } from './document-card'
import { EvidenceGallery, type EvidenceItem } from './evidence-gallery'
import { ReadingProgress } from './reading-progress'
import { RevisionTimeline } from './revision-timeline'
import { TableOfContents } from './table-of-contents'

/**
 * Isi halaman detail satu dokumen.
 *
 * Dipisah dari berkas rute karena keempat tipe punya rute detail sendiri
 * (`/knowledge/sop/[slug]`, `/knowledge/labs/[slug]`, …). Lihat
 * `type-listing.tsx` untuk alasannya.
 */

/** Metadata bersama untuk keempat rute detail. */
export async function documentDetailMetadata(
  locale: Locale,
  segment: TypeSegment,
  slug: string,
) {
  const document = await getPublishedDocumentBySlug(slug)

  // Dokumen tidak ada: metadata dikosongkan, halamannya yang memanggil
  // notFound().
  if (!document || document.type !== typeForSegment(segment)) return {}

  const title = resolveLocalized(document, 'title', locale)
  const summary = resolveLocalized(document, 'summary', locale)
  const path = `/knowledge/${segment}/${slug}`

  return {
    title: title.value,
    description: summary.value,
    alternates: {
      // Canonical menunjuk versi Indonesia bila terjemahan Inggris belum
      // ada — dua URL dengan isi identik kalau tidak akan bersaing sebagai
      // konten duplikat (08_I18N_FALLBACK_POLICY §5).
      canonical: title.isFallback
        ? `${env.NEXT_PUBLIC_SITE_URL}/id${path}`
        : `${env.NEXT_PUBLIC_SITE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        routing.locales.map((item) => [
          item,
          `${env.NEXT_PUBLIC_SITE_URL}/${item}${path}`,
        ]),
      ),
    },
  }
}

export async function DocumentDetail({
  locale,
  segment,
  slug,
}: {
  locale: Locale
  segment: TypeSegment
  slug: string
}) {
  const document = await getPublishedDocumentBySlug(slug)

  // Slug yang benar tapi di bawah tipe yang salah juga 404 — kalau tidak,
  // setiap dokumen bisa dibuka lewat empat URL berbeda.
  if (!document || document.type !== typeForSegment(segment)) notFound()

  const t = await getTranslations('knowledge')
  const tDetail = await getTranslations('knowledge.detail')

  const title = resolveLocalized(document, 'title', locale)
  const summary = resolveLocalized(document, 'summary', locale)

  // Isi Inggris dipakai hanya bila benar-benar ada; kalau tidak, isi
  // Indonesia ditampilkan dengan atribut lang yang benar.
  const hasEnglishContent =
    locale === 'en' && document.contentEnJson !== null
  const content = parseDocument(
    hasEnglishContent ? document.contentEnJson : document.contentIdJson,
  )
  const contentLang: Locale = hasEnglishContent ? 'en' : 'id'

  const headings = content ? collectHeadings(content) : []
  const [revisions, related] = await Promise.all([
    getDocumentRevisions(document.id),
    getRelatedDocuments(document.id, document.category?.slug ?? null),
  ])

  const evidence: EvidenceItem[] = document.media.map((asset) => ({
    id: asset.id,
    src: asset.fileUrl,
    alt: pickLocale(asset, 'alt', locale),
    caption: pickLocale(asset, 'caption', locale) || null,
    title: pickLocale(asset, 'title', locale) || null,
    tool: asset.tool,
    testDate: asset.testDate ? formatFullDate(asset.testDate, locale) : null,
  }))

  const meta = [
    document.documentCode,
    tDetail('version', { version: document.version }),
    document.difficulty ? t(`difficulty.${document.difficulty}`) : null,
    document.estimatedMinutes
      ? t('card.minutes', { minutes: document.estimatedMinutes })
      : null,
  ].filter(Boolean)

  return (
    <>
      <ReadingProgress />

      <Container className="py-12 md:py-16">
        <Link
          href={`/knowledge/${segment}`}
          className="rounded-sm text-sm text-muted underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← {tDetail('backToList', { type: t(`types.${segment}.plural`) })}
        </Link>

        <header className="mt-6 max-w-prose">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {meta.map((item) => (
              <span key={String(item)}>{item}</span>
            ))}
          </div>

          <h1
            lang={title.lang}
            className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {title.value}
          </h1>

          <p
            lang={summary.lang}
            className="mt-4 text-lg leading-relaxed text-muted"
          >
            {summary.value}
          </p>

          <div className="mt-6">
            <TranslationNotice locale={locale} show={title.isFallback} />
          </div>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 lg:order-1">
            {content ? (
              <article lang={contentLang}>
                <ProseMirrorContent doc={content} />
              </article>
            ) : (
              <p className="text-muted">{tDetail('emptyContent')}</p>
            )}

            {evidence.length > 0 ? (
              <section aria-labelledby="evidence-heading" className="mt-16">
                <h2
                  id="evidence-heading"
                  className="font-display text-xl font-semibold tracking-tight"
                >
                  {tDetail('evidence')}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {tDetail('evidenceNote')}
                </p>
                <div className="mt-6">
                  <EvidenceGallery items={evidence} />
                </div>
              </section>
            ) : null}

            <RevisionTimeline revisions={revisions} locale={locale} />

            {document.projectLinks.length > 0 ? (
              <section
                aria-labelledby="related-projects-heading"
                className="mt-16"
              >
                <h2
                  id="related-projects-heading"
                  className="font-display text-xl font-semibold tracking-tight"
                >
                  {tDetail('relatedProjects')}
                </h2>
                <ul className="mt-5 space-y-3">
                  {document.projectLinks.map((link) => (
                    <li key={link.project.slug}>
                      <Link
                        href={`/projects/${link.project.slug}`}
                        className="rounded-sm font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {pickLocale(link.project, 'title', locale)}
                      </Link>
                      {link.note ? (
                        <p className="mt-1 text-sm text-muted">{link.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {/* Daftar isi setelah isi di DOM, dipindah ke kanan lewat
              `order` di layar besar: pembaca layar dan keyboard menemui
              isi utama lebih dulu, bukan navigasi sekunder. */}
          <aside className="lg:order-2">
            <TableOfContents headings={headings} />

            {document.tools.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
                  {tDetail('tools')}
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {document.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full bg-elevated px-3 py-1 text-xs"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {document.tags.length > 0 ? (
              <div className="mt-8">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
                  {tDetail('tags')}
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {document.tags.map(({ tag }) => (
                    <li key={tag.slug}>
                      <Link
                        href={`/knowledge/tag/${tag.slug}`}
                        className="rounded-full bg-elevated px-3 py-1 text-xs hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {document.publishedAt ? (
              <p className="mt-8 text-xs text-muted">
                {tDetail('published', {
                  date: formatFullDate(document.publishedAt, locale),
                })}
              </p>
            ) : null}
          </aside>
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-20">
            <h2
              id="related-heading"
              className="font-display text-xl font-semibold tracking-tight"
            >
              {tDetail('related')}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <DocumentCard
                  key={item.id}
                  document={item}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  )
}
