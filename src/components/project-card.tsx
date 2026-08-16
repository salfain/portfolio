import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { resolveLocalized, isLocaleComplete } from '@/lib/i18n-content'
import { PROJECT_REQUIRED_EN, type ProjectCard as Project } from '@/data/project'

import { Badge, Card, CardBody } from '@/components/ui'

type ProjectCardProps = {
  project: Project
  locale: Locale
}

export async function ProjectCard({ project, locale }: ProjectCardProps) {
  const t = await getTranslations('projects')
  const title = resolveLocalized(project, 'title', locale)
  const summary = resolveLocalized(project, 'summary', locale)
  const complete = isLocaleComplete(project, locale, PROJECT_REQUIRED_EN)

  return (
    <Card className="group relative h-full transition-colors hover:border-primary/40">
      <CardBody className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug">
            {/* `after:` menutupi seluruh kartu supaya area kliknya lebar,
                tanpa menyarangkan elemen interaktif di dalam <a>. */}
            <Link
              href={`/projects/${project.slug}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span lang={title.lang}>{title.value}</span>
            </Link>
          </h3>

          {/* Penanda "ID" pada kartu yang belum diterjemahkan —
              menyembunyikannya akan membuat /en terlihat kosong
              (08_I18N_FALLBACK_POLICY §3). */}
          {!complete ? (
            <Badge aria-label={t('untranslatedLabel')}>ID</Badge>
          ) : null}
        </div>

        <p
          lang={summary.lang}
          className="mt-3 line-clamp-3 hyphens-auto text-justify text-sm leading-relaxed text-muted"
        >
          {summary.value}
        </p>

        {project.tools.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tools.slice(0, 4).map((tool) => (
              <li key={tool}>
                <Badge>{tool}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-auto pt-6 text-sm font-medium text-primary">
          {t('readCaseStudy')}
        </p>
      </CardBody>
    </Card>
  )
}
