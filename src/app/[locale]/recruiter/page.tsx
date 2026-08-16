import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { formatFullDate, formatPeriod } from '@/lib/format'
import { resolveLocalized } from '@/lib/i18n-content'
import { getRecruiterProfile } from '@/data/profile'
import { getPublishedExperiences, toAchievements } from '@/data/experience'
import { getPublishedSkills, groupSkillsByCategory } from '@/data/skill'
import { getPublishedCertificates } from '@/data/certificate'
import { getFeaturedProjects } from '@/data/project'

import { Container } from '@/components/layout/container'
import { PrintButton } from '@/components/print-button'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'recruiter' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    // Ringkasan ini menduplikasi isi halaman lain; jangan diindeks
    // sebagai halaman tersendiri.
    robots: { index: false, follow: true },
  }
}

/**
 * Recruiter Mode — ringkasan satu halaman yang wajib bisa dicetak.
 *
 * Ini SATU-SATUNYA halaman publik yang menampilkan kontak langsung.
 * Q10 (06_OPEN_QUESTIONS) belum dijawab, jadi jalan tengah yang
 * disarankan dokumen itu yang dipakai: email dan telepon hanya di sini,
 * selebihnya lewat form kontak. Halaman ini juga `noindex`, sehingga
 * alamatnya tidak ikut terpanen dari hasil pencarian.
 */
export default async function RecruiterPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('recruiter')

  const [profile, experiences, skills, certificates, projects] =
    await Promise.all([
      getRecruiterProfile(),
      getPublishedExperiences(),
      getPublishedSkills(),
      getPublishedCertificates(),
      getFeaturedProjects(3),
    ])

  const role = profile ? resolveLocalized(profile, 'role', locale) : null
  const summary = profile ? resolveLocalized(profile, 'summary', locale) : null
  const cvUrl = locale === 'en' ? profile?.cvEnUrl : profile?.cvIdUrl
  const skillGroups = groupSkillsByCategory(skills)

  return (
    <Container as="article" className="py-14 print:py-0 md:py-20">
      <div className="max-w-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {profile?.name ?? t('title')}
            </h1>
            {role?.value ? (
              <p lang={role.lang} className="mt-2 text-lg text-muted">
                {role.value}
              </p>
            ) : null}
          </div>

          <PrintButton />
        </div>

        {/* Kontak — hanya di halaman ini. */}
        {profile ? (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {profile.location ? <li>{profile.location}</li> : null}
            {profile.email ? (
              <li>
                <a href={`mailto:${profile.email}`} className="hover:underline">
                  {profile.email}
                </a>
              </li>
            ) : null}
            {profile.whatsapp ? <li>{profile.whatsapp}</li> : null}
            {profile.phone && profile.phone !== profile.whatsapp ? (
              <li>{profile.phone}</li>
            ) : null}
            {profile.linkedinUrl ? (
              <li>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
            {profile.githubUrl ? (
              <li>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}

        {summary?.value ? (
          <p
            lang={summary.lang}
            className="mt-8 hyphens-auto text-justify text-base leading-relaxed text-muted"
          >
            {summary.value}
          </p>
        ) : null}

        {cvUrl ? (
          <p className="mt-6 text-sm print:hidden">
            <a
              href={cvUrl}
              download
              className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t('downloadCv')}
            </a>
          </p>
        ) : null}

        {experiences.length > 0 ? (
          <section className="mt-12 break-inside-avoid">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {t('experience')}
            </h2>
            <ul className="mt-4 space-y-6">
              {experiences.map((experience) => {
                const position = resolveLocalized(experience, 'position', locale)
                const achievements = toAchievements(
                  locale === 'en' && experience.achievementsEn
                    ? experience.achievementsEn
                    : experience.achievementsId,
                )

                return (
                  <li key={experience.id} className="break-inside-avoid">
                    <div className="flex flex-wrap justify-between gap-2">
                      <p lang={position.lang} className="font-medium">
                        {position.value} · {experience.company}
                      </p>
                      <p className="text-sm text-muted">
                        {formatPeriod(
                          experience.startDate,
                          experience.endDate,
                          locale,
                          t('present'),
                        )}
                      </p>
                    </div>

                    {achievements.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
                        {achievements.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {skillGroups.length > 0 ? (
          <section className="mt-10 break-inside-avoid">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {t('skills')}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {skillGroups.map((group) => (
                <li key={group.category}>
                  <span className="font-medium">{group.category}:</span>{' '}
                  <span className="text-muted">
                    {group.skills.map((skill) => skill.name).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {certificates.length > 0 ? (
          <section className="mt-10 break-inside-avoid">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {t('certifications')}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {certificates.map((certificate) => (
                <li key={certificate.id}>
                  <span className="font-medium">{certificate.name}</span>{' '}
                  <span className="text-muted">
                    · {certificate.issuer}
                    {certificate.issueDate
                      ? ` · ${formatFullDate(certificate.issueDate, locale)}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {projects.length > 0 ? (
          <section className="mt-10 break-inside-avoid">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {t('projects')}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {projects.map((project) => {
                const title = resolveLocalized(project, 'title', locale)
                const projectSummary = resolveLocalized(
                  project,
                  'summary',
                  locale,
                )

                return (
                  <li key={project.id}>
                    <p lang={title.lang} className="font-medium">
                      {title.value}
                    </p>
                    <p
                      lang={projectSummary.lang}
                      className="mt-1 leading-relaxed text-muted"
                    >
                      {projectSummary.value}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </Container>
  )
}
