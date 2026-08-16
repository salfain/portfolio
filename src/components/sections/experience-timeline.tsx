import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { formatPeriod } from '@/lib/format'
import { resolveLocalized } from '@/lib/i18n-content'
import { toAchievements, type PublicExperience } from '@/data/experience'

import { Badge, EmptyState } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'

import { Section } from './section'
import { SectionLink } from './section-link'

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
          <SectionLink href="/experience">{t('viewAll')}</SectionLink>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <StaggerContainer>
          {visible.map((experience) => {
            const position = resolveLocalized(experience, 'position', locale)
            const summary = resolveLocalized(experience, 'summary', locale)
            const achievements = toAchievements(
              locale === 'en' && experience.achievementsEn
                ? experience.achievementsEn
                : experience.achievementsId,
            )

            return (
              <StaggerItem
                key={experience.id}
                className="grid gap-x-8 gap-y-4 border-t border-border py-9 md:grid-cols-[200px_minmax(0,1fr)]"
              >
                {/* Kolom kiri: periode dan organisasi, keduanya mono.
                    Di bawah md kolomnya menumpuk, jadi periode tetap
                    berada persis di atas jabatan yang diterangkannya. */}
                <div className="flex flex-col gap-1.5">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-faint">
                    {formatPeriod(
                      experience.startDate,
                      experience.endDate,
                      locale,
                      t('present'),
                    )}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
                    {experience.company}
                  </p>
                </div>

                <div className="min-w-0">
                  <h3 lang={position.lang} className="text-[22px] font-medium">
                    {position.value}
                  </h3>

                  {experience.location ? (
                    <p className="mt-1.5 text-[15px] text-muted">
                      {experience.location}
                    </p>
                  ) : null}

                  <p
                    lang={summary.lang}
                    className="mt-4 leading-relaxed text-muted"
                  >
                    {summary.value}
                  </p>

                  {/* Poin tanggung jawab sebagai daftar tanpa butir bawaan:
                      jaraknya diatur `gap`, bukan margin per baris. */}
                  {achievements.length > 0 ? (
                    <ul className="mt-5 flex list-none flex-col gap-2.5 pl-0">
                      {achievements.map((achievement) => (
                        <li
                          key={achievement}
                          className="flex gap-3 text-[15px] leading-relaxed text-text-2"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 h-[3px] w-[3px] shrink-0 rounded-full bg-faint"
                          />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {experience.tools.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {experience.tools.map((tool) => (
                        <li key={tool}>
                          <Badge>{tool}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}
    </Section>
  )
}
