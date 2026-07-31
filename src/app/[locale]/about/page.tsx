import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { resolveLocalized } from '@/lib/i18n-content'
import { NARRATIVE_KEYS } from '@/lib/schemas/site-settings'
import { getPublishedProfile } from '@/data/profile'
import { getNarrativeSection } from '@/data/settings'
import { getPublishedSkills } from '@/data/skill'

import { PageHeader } from '@/components/layout/page-header'
import { Capabilities, Narrative } from '@/components/sections'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')

  const [profile, story, skills] = await Promise.all([
    getPublishedProfile(),
    getNarrativeSection(NARRATIVE_KEYS.aboutStory),
    getPublishedSkills(),
  ])

  const summary = profile ? resolveLocalized(profile, 'summary', locale) : null

  return (
    <>
      <PageHeader
        title={t('title')}
        description={summary?.value}
        descriptionLang={summary?.lang}
      />

      {/* Riwayat pribadi hanya boleh datang dari pemilik lewat admin.
          Tanpa data, bagian ini tidak dirender (CLAUDE.md aturan §1). */}
      <Narrative
        id="story"
        title={t('storyTitle')}
        blocks={story}
        locale={locale}
      />

      <Capabilities skills={skills} />
    </>
  )
}
