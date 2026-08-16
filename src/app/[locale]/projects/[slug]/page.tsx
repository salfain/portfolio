import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { isLocaleComplete, resolveLocalized } from '@/lib/i18n-content'
import {
  PROJECT_REQUIRED_EN,
  getPublishedProjectBySlug,
  getPublishedProjectSlugs,
} from '@/data/project'

import { Badge } from '@/components/ui'
import { Container } from '@/components/layout/container'
import { TranslationNotice } from '@/components/translation-notice'

export const revalidate = 3600

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

type PageProps = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs()

  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  if (!project) return {}

  const title = resolveLocalized(project, 'title', locale)
  const summary = resolveLocalized(project, 'summary', locale)
  const complete = isLocaleComplete(project, locale, PROJECT_REQUIRED_EN)

  /**
   * Canonical halaman `/en` yang isinya masih berbahasa Indonesia
   * menunjuk ke padanan `/id`. Ini memberi tahu mesin pencari bahwa
   * versi EN belum menjadi halaman tersendiri — tanpa ini, keduanya
   * ditandai duplikat (08_I18N_FALLBACK_POLICY §4).
   */
  const canonical =
    locale === 'en' && !complete
      ? `/id/projects/${slug}`
      : `/${locale}/projects/${slug}`

  return {
    title: title.value,
    description: summary.value,
    alternates: { canonical },
  }
}

/** Satu blok studi kasus. Tidak dirender bila isinya kosong. */
function CaseStudyBlock({
  heading,
  body,
  lang,
}: {
  heading: string
  body: string
  lang: string
}) {
  if (!body.trim()) return null

  return (
    <section className="mt-10">
      <h2 className="text-xl font-medium tracking-tight">{heading}</h2>
      <p
        lang={lang}
        className="mt-3 hyphens-auto whitespace-pre-line text-justify text-base leading-relaxed text-muted"
      >
        {body}
      </p>
    </section>
  )
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const project = await getPublishedProjectBySlug(slug)

  // Draft dan arsip menghasilkan 404, BUKAN 403 — 403 mengonfirmasi
  // keberadaan dokumen (05_ROUTE_AND_PRIORITY_MAP §6).
  if (!project) notFound()

  const t = await getTranslations('projectDetail')

  const title = resolveLocalized(project, 'title', locale)
  const summary = resolveLocalized(project, 'summary', locale)
  const role = resolveLocalized(project, 'role', locale)
  const problem = resolveLocalized(project, 'problem', locale)
  const solution = resolveLocalized(project, 'solution', locale)
  const result = resolveLocalized(project, 'result', locale)
  const complete = isLocaleComplete(project, locale, PROJECT_REQUIRED_EN)

  return (
    <Container as="article" className="py-10 md:py-12">
      <div className="max-w-none">
        <p className="text-sm">
          <Link
            href="/projects"
            className="rounded-sm text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← {t('backToProjects')}
          </Link>
        </p>

        <h1
          lang={title.lang}
          className="mt-6 font-display text-3xl tracking-tight md:text-4xl"
        >
          {title.value}
        </h1>

        {project.category ? (
          <p className="mt-3 text-sm text-muted">
            {locale === 'en' && project.category.nameEn
              ? project.category.nameEn
              : project.category.nameId}
          </p>
        ) : null}

        <div className="mt-8">
          <TranslationNotice locale={locale} show={!complete} />
        </div>

        <p
          lang={summary.lang}
          className="mt-8 hyphens-auto text-justify text-lg leading-relaxed text-muted"
        >
          {summary.value}
        </p>

        {role.value ? (
          <p className="mt-6 text-sm">
            <span className="font-medium">{t('role')}:</span>{' '}
            <span lang={role.lang} className="text-muted">
              {role.value}
            </span>
          </p>
        ) : null}

        {project.tools.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <li key={tool}>
                <Badge>{tool}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        {project.repositoryUrl || project.demoUrl ? (
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
            {project.repositoryUrl ? (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t('repository')}
              </a>
            ) : null}
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t('demo')}
              </a>
            ) : null}
          </div>
        ) : null}

        <CaseStudyBlock
          heading={t('problem')}
          body={problem.value}
          lang={problem.lang}
        />
        <CaseStudyBlock
          heading={t('solution')}
          body={solution.value}
          lang={solution.lang}
        />
        <CaseStudyBlock
          heading={t('result')}
          body={result.value}
          lang={result.lang}
        />

        {project.tags.length > 0 ? (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {project.tags.map(({ tag }) => (
              <li key={tag.slug}>
                <Badge>{tag.name}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Container>
  )
}
