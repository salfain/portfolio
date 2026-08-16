import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms' })

  return { title: t('title'), description: t('metaDescription') }
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('terms')

  const sections = ['usage', 'content', 'labDisclaimer', 'liability'] as const

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <Container className="pb-20">
        <div className="max-w-none space-y-10">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="text-xl font-medium tracking-tight">
                {t(`sections.${section}.title`)}
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted">
                {t(`sections.${section}.body`)}
              </p>
            </section>
          ))}

          <p className="border-t border-border pt-6 text-sm text-muted">
            {t('lastUpdated')}
          </p>
        </div>
      </Container>
    </>
  )
}
