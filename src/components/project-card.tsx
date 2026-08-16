import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { resolveLocalized, isLocaleComplete } from '@/lib/i18n-content'
import {
  PROJECT_REQUIRED_EN,
  type ProjectCard as Project,
} from '@/data/project'

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
    <Card className="group relative h-full">
      <CardBody className="flex h-full flex-col p-7">
        <div className="flex items-start justify-between gap-3">
          {/* Kicker "STUDI KASUS" menandai bahwa kartu ini membuka tulisan
              panjang, bukan tautan ke repositori atau demo. */}
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t('caseStudyKicker')}
          </p>

          {/* Penanda "ID" pada kartu yang belum diterjemahkan —
              menyembunyikannya akan membuat /en terlihat kosong
              (08_I18N_FALLBACK_POLICY §3). */}
          {!complete ? (
            <Badge aria-label={t('untranslatedLabel')}>ID</Badge>
          ) : null}
        </div>

        <h3 className="mt-4 text-2xl font-medium leading-snug">
          {/* `after:` menutupi seluruh kartu supaya area kliknya lebar,
              tanpa menyarangkan elemen interaktif di dalam <a>. */}
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span lang={title.lang}>{title.value}</span>
          </Link>
        </h3>

        <p
          lang={summary.lang}
          className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted"
        >
          {summary.value}
        </p>

        {project.tools.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.tools.slice(0, 4).map((tool) => (
              <li key={tool}>
                <Badge>{tool}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-auto flex items-center gap-2 pt-7 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors group-hover:text-primary">
          {t('readCaseStudy')}
          <span aria-hidden>&rarr;</span>
        </p>
      </CardBody>
    </Card>
  )
}
