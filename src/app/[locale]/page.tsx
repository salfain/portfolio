import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { NARRATIVE_KEYS } from '@/lib/schemas/site-settings'
import { getPublishedProfile } from '@/data/profile'
import { getFeaturedProjects } from '@/data/project'
import { getPublishedExperiences } from '@/data/experience'
import { getPublishedSkills } from '@/data/skill'
import { getPublishedCertificates } from '@/data/certificate'
import { getCareerStats } from '@/data/stats'
import { getNarrativeSection } from '@/data/settings'
import { getLatestDocuments } from '@/data/knowledge'

import {
  AtAGlance,
  Capabilities,
  CertificationsList,
  ContactCta,
  ExperienceTimeline,
  ExploreWork,
  FeaturedWork,
  Hero,
  KnowledgePreview,
  Narrative,
} from '@/components/sections'

// Statis + revalidasi (05_ROUTE_AND_PRIORITY_MAP §2).
// Mutasi di admin memanggil revalidateTag; angka ini hanya jaring pengaman.
export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')

  const [
    profile,
    featured,
    experiences,
    skills,
    certificates,
    stats,
    whyWorkWithMe,
    troubleshooting,
    latestDocuments,
  ] = await Promise.all([
    getPublishedProfile(),
    getFeaturedProjects(3),
    getPublishedExperiences(),
    getPublishedSkills(),
    getPublishedCertificates(),
    getCareerStats(),
    getNarrativeSection(NARRATIVE_KEYS.whyWorkWithMe),
    getNarrativeSection(NARRATIVE_KEYS.troubleshootingProcess),
    getLatestDocuments(3),
  ])

  // Urutan bagian ditetapkan di docs/01_PHASES.md (Fase 3, "Homepage order").
  return (
    <>
      <Hero profile={profile} locale={locale} />
      <ExploreWork />
      <AtAGlance stats={stats} />
      <FeaturedWork projects={featured} locale={locale} />

      <Narrative
        id="why-work-with-me"
        title={t('whyWorkWithMe')}
        blocks={whyWorkWithMe}
        locale={locale}
      />

      <Capabilities skills={skills} compact />

      <Narrative
        id="troubleshooting"
        title={t('troubleshootingProcess')}
        blocks={troubleshooting}
        locale={locale}
        numbered
      />

      <ExperienceTimeline experiences={experiences} locale={locale} limit={2} />
      <CertificationsList certificates={certificates} locale={locale} limit={3} />
      <KnowledgePreview documents={latestDocuments} locale={locale} />
      <ContactCta profile={profile} locale={locale} />
    </>
  )
}
