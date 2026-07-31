import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getPublishedExperiences } from '@/data/experience'

import { PageHeader } from '@/components/layout/page-header'
import { ExperienceTimeline } from '@/components/sections'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'experience' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function ExperiencePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('experience')
  const experiences = await getPublishedExperiences()

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <ExperienceTimeline experiences={experiences} locale={locale} />
    </>
  )
}
