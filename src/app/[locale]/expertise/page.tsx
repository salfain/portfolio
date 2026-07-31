import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getPublishedSkills } from '@/data/skill'

import { PageHeader } from '@/components/layout/page-header'
import { Capabilities } from '@/components/sections'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'expertise' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function ExpertisePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('expertise')
  const skills = await getPublishedSkills()

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Capabilities skills={skills} />
    </>
  )
}
