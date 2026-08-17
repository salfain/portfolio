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

import {
  parseIncidentMetadata,
  parseLabMetadata,
} from '@/lib/schemas/knowledge-metadata'
import { getPublishedProfile } from '@/data/profile'
import { BreadcrumbJsonLd, DocumentJsonLd } from '@/components/structured-data'

import { DocumentCard } from './document-card'
import { EvidenceDownloads, type DownloadItem } from './evidence-downloads'
import { EvidenceGallery, type EvidenceItem } from './evidence-gallery'
import { IncidentBlocks } from './incident-blocks'
import { LabBlocks } from './lab-blocks'
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
  const hasEnglishContent = locale === 'en' && document.contentEnJson !== null
  const content = parseDocument(
    hasEnglishContent ? document.contentEnJson : document.contentIdJson,
  )
  const contentLang: Locale = hasEnglishContent ? 'en' : 'id'

  const headings = content ? collectHeadings(content) : []

  /**
   * Ketiganya diambil BERSAMAAN, bukan berurutan.
   *
   * Profil sempat ditulis sebagai `await` tersendiri sebelum `Promise.all`
   * saat JSON-LD ditambahkan di Fase 7 — satu jalan-pulang database
   * tambahan yang menunggu tanpa alasan, di halaman yang paling sering
   * dibuka.
   *
   * Nama penulis diambil dari profil situs. Bila profil belum diisi, yang
   * dipakai nama situs — bukan nama yang dikarang.
   */
  const [profile, revisions, related] = await Promise.all([
    getPublishedProfile(),
    getDocumentRevisions(document.id),
    getRelatedDocuments(document.id, document.category?.slug ?? null),
  ])

  const authorName = profile?.name ?? t('title')

  /**
   * Metadata terstruktur hanya diurai untuk tipe yang memilikinya.
   *
   * `parse*` mengembalikan `null` bila bentuknya tidak cocok — dokumen
   * dengan metadata rusak kehilangan blok buktinya, bukan seluruh
   * halamannya.
   */
  const labMeta =
    document.type === 'LAB' ? parseLabMetadata(document.metadata) : null
  const incidentMeta =
    document.type === 'INCIDENT'
      ? parseIncidentMetadata(document.metadata)
      : null

  /**
   * Bukti dipisah menurut cara pakainya: yang bisa dilihat masuk galeri,
   * sisanya jadi unduhan. Tanpa pemisahan ini arsip ZIP akan muncul di
   * galeri sebagai gambar rusak.
   */
  const isViewable = (mimeType: string) => mimeType.startsWith('image/')

  const downloads: DownloadItem[] = document.media
    .filter((asset) => !isViewable(asset.mimeType))
    .map((asset) => ({
      id: asset.id,
      href: asset.fileUrl,
      label:
        pickLocale(asset, 'title', locale) || pickLocale(asset, 'alt', locale),
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
    }))

  const evidence: EvidenceItem[] = document.media
    .filter((asset) => isViewable(asset.mimeType))
    .map((asset) => ({
      id: asset.id,
      src: asset.fileUrl,
      alt: pickLocale(asset, 'alt', locale),
      caption: pickLocale(asset, 'caption', locale) || null,
      title: pickLocale(asset, 'title', locale) || null,
      tool: asset.tool,
      testDate: asset.testDate ? formatFullDate(asset.testDate, locale) : null,
      width: asset.width,
      height: asset.height,
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
      {/*
        JSON-LD dirender di halaman, bukan di metadata: `generateMetadata`
        tidak punya tempat untuk skrip, dan menaruhnya di layout berarti
        setiap halaman mengaku sebagai artikel yang sama.

        Nama penulis diambil dari profil situs, bukan dikarang — bila profil
        belum diisi, blok penulisnya tidak ikut dirender.
      */}
      <DocumentJsonLd
        title={title.value}
        summary={summary.value}
        path={`/knowledge/${segment}/${slug}`}
        locale={locale}
        publishedAt={document.publishedAt}
        updatedAt={document.updatedAt}
        authorName={authorName}
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: t('title'), path: '/knowledge' },
          { name: t(`types.${segment}.plural`), path: `/knowledge/${segment}` },
          {
            name: title.value,
            path: `/knowledge/${segment}/${slug}`,
          },
        ]}
      />

      <ReadingProgress />

      <Container className="py-8 md:py-12">
        <Link
          href={`/knowledge/${segment}`}
          className="rounded-sm text-sm text-muted underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← {tDetail('backToList', { type: t(`types.${segment}.plural`) })}
        </Link>

        <header className="mt-6 max-w-none">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {meta.map((item) => (
              <span key={String(item)}>{item}</span>
            ))}
          </div>

          <h1
            lang={title.lang}
            className="mt-3 font-display text-3xl tracking-tight md:text-4xl"
          >
            {title.value}
          </h1>

          <p
            lang={summary.lang}
            className="mt-4 hyphens-auto text-justify text-lg leading-relaxed text-muted"
          >
            {summary.value}
          </p>

          <div className="mt-6">
            <TranslationNotice locale={locale} show={title.isFallback} />
          </div>
        </header>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <div className="min-w-0 lg:order-1">
            {content ? (
              <article lang={contentLang}>
                <ProseMirrorContent doc={content} />
              </article>
            ) : (
              <p className="text-muted">{tDetail('emptyContent')}</p>
            )}

            {/*
              Blok bukti terstruktur (Fase 6) dirender SETELAH isi dokumen.
              Isinya menjelaskan, tabelnya membuktikan — urutan sebaliknya
              memaksa pembaca menafsirkan angka sebelum tahu konteksnya.
            */}
            {labMeta ? <LabBlocks meta={labMeta} /> : null}
            {incidentMeta ? (
              <IncidentBlocks meta={incidentMeta} locale={locale} />
            ) : null}

            <EvidenceDownloads items={downloads} />

            {evidence.length > 0 ? (
              <section aria-labelledby="evidence-heading" className="mt-16">
                <h2
                  id="evidence-heading"
                  className="text-xl font-medium tracking-tight"
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
                  className="text-xl font-medium tracking-tight"
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
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:order-2">
            <TableOfContents headings={headings} />

            {document.tools.length > 0 ? (
              <div className="mt-10">
                <h2 className="kicker">{tDetail('tools')}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {document.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-sm bg-elevated px-3 py-1 text-xs"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {document.tags.length > 0 ? (
              <div className="mt-8">
                <h2 className="kicker">{tDetail('tags')}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {document.tags.map(({ tag }) => (
                    <li key={tag.slug}>
                      <Link
                        href={`/knowledge/tag/${tag.slug}`}
                        className="rounded-sm bg-elevated px-3 py-1 text-xs hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
              className="text-xl font-medium tracking-tight"
            >
              {tDetail('related')}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <DocumentCard key={item.id} document={item} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  )
}
