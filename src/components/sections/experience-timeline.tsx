import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatPeriod } from '@/lib/format'
import { resolveLocalized } from '@/lib/i18n-content'
import { toAchievements, type PublicExperience } from '@/data/experience'

import { Badge, Card, CardBody, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'

type ExperienceTimelineProps = {
  experiences: PublicExperience[]
  locale: Locale
  /** Homepage hanya menampilkan dua entri teratas. */
  limit?: number
}

export async function ExperienceTimeline({
  experiences,
  locale,
  limit,
}: ExperienceTimelineProps) {
  const t = await getTranslations('experience')
  const visible = limit ? experiences.slice(0, limit) : experiences

  return (
    <Section
      id="experience"
      title={t('title')}
      action={
        limit && experiences.length > limit ? (
          <Link
            href="/experience"
            className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('viewAll')}
          </Link>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <StaggerContainer className="space-y-4">
          {visible.map((experience) => {
            const position = resolveLocalized(experience, 'position', locale)
            const summary = resolveLocalized(experience, 'summary', locale)
            const achievements = toAchievements(
              locale === 'en' && experience.achievementsEn
                ? experience.achievementsEn
                : experience.achievementsId,
            )

            return (
              <StaggerItem key={experience.id}>
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3
                          lang={position.lang}
                          className="font-display text-lg font-semibold"
                        >
                          {position.value}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {experience.company}
                          {experience.location ? ` · ${experience.location}` : ''}
                        </p>
                      </div>

                      <p className="text-sm text-muted">
                        {formatPeriod(
                          experience.startDate,
                          experience.endDate,
                          locale,
                          t('present'),
                        )}
                      </p>
                    </div>

                    <p
                      lang={summary.lang}
                      className="text-justified mt-4 text-sm leading-relaxed text-muted"
                    >
                      {summary.value}
                    </p>

                    {achievements.length > 0 ? (
                      <ul className="text-justified mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                        {achievements.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    ) : null}

                    {experience.tools.length > 0 ? (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {experience.tools.map((tool) => (
                          <li key={tool}>
                            <Badge>{tool}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </CardBody>
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}
    </Section>
  )
}
