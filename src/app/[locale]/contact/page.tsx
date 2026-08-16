import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getPublishedProfile } from '@/data/profile'

import { Container } from '@/components/layout/container'
import { ContactForm } from '@/components/contact-form'
import { Reveal } from '@/components/motion'

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
  const profile = await getPublishedProfile()

  /**
   * Baris kontak dibangun HANYA dari kolom yang memang publik.
   *
   * `email`, `phone`, dan `whatsapp` sengaja tidak ada di
   * `publicProfileSelect` (Q10, 06_OPEN_QUESTIONS) — jadi halaman ini
   * tidak menampilkannya, dan tidak menggantinya dengan alamat karangan.
   * Kontak langsung tetap hanya di Recruiter Mode.
   */
  const channels = [
    profile?.location
      ? {
          key: 'location',
          label: t('channels.location'),
          value: profile.location,
        }
      : null,
    profile?.linkedinUrl
      ? {
          key: 'linkedin',
          label: t('channels.linkedin'),
          value: profile.linkedinUrl,
          href: profile.linkedinUrl,
        }
      : null,
    profile?.githubUrl
      ? {
          key: 'github',
          label: t('channels.github'),
          value: profile.githubUrl,
          href: profile.githubUrl,
        }
      : null,
  ].filter((channel) => channel !== null)

  return (
    <Container className="pb-24 pt-16 sm:pt-20 md:pt-24">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
        <Reveal>
          <h1 className="font-display text-h1">{t('title')}</h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            {t('description')}
          </p>

          {channels.length > 0 ? (
            <dl className="mt-12 border-t border-border">
              {channels.map((channel) => (
                <div
                  key={channel.key}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                    {channel.label}
                  </dt>
                  <dd className="min-w-0 break-words text-[15px]">
                    {channel.href ? (
                      <a
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      channel.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <p className="mt-10">
            <Link
              href="/recruiter"
              className="inline-flex items-center gap-2 rounded-full border border-border-med px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-border-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t('recruiterLink')}
              <span aria-hidden>&rarr;</span>
            </Link>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm locale={locale} />
        </Reveal>
      </div>
    </Container>
  )
}
