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
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return { title: t('title'), description: t('metaDescription') }
}

/**
 * Halaman ini WAJIB ada karena situs punya form kontak.
 *
 * Isinya menjelaskan apa yang benar-benar dilakukan kode saat ini:
 * data form disimpan di database, tidak ada IP mentah yang disimpan,
 * belum ada analitik. Isi wajib diperbarui begitu Turnstile, analitik,
 * atau notifikasi email ditambahkan.
 */
export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('privacy')

  const sections = [
    'dataCollected',
    'purpose',
    'retention',
    'cookies',
    'analytics',
    'rights',
  ] as const

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <Container className="pb-20">
        <div className="max-w-none space-y-10">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="font-display text-xl font-semibold tracking-tight">
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
