import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getPublishedCertificates } from '@/data/certificate'

import { PageHeader } from '@/components/layout/page-header'
import { CertificationsList } from '@/components/sections'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'certifications' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function CertificationsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('certifications')
  const certificates = await getPublishedCertificates()

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <CertificationsList certificates={certificates} locale={locale} />
    </>
  )
}
