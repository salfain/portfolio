import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { ContactForm } from '@/components/contact-form'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('contact')

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <Container className="pb-20">
        <div className="max-w-xl">
          <ContactForm locale={locale} />
        </div>
      </Container>
    </>
  )
}
